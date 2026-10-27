"""Live integration checks using intercepted API requests; never opens real hardware."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

SERVER = os.environ.get('LIVE_TEST_SERVER', 'http://127.0.0.1:5173')

SHOTS = Path(__file__).resolve().parent.parent / '.impeccable' / 'review'
SHOTS.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 1100})
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    states = [{'address': i, 'active': i != 2, 'locked': i == 46 or i > 48, 'opened': i != 46} for i in range(1, 57)]
    states[1].update(locked=None, opened=None, last_opened=None, last_closed=None)
    control = {'response': 'valid', 'open_status': 204}
    commands = []

    def mock(route):
        request = route.request
        if request.url.endswith('/states'):
            assert request.method == 'GET'
            if control['response'] == 'http_error':
                route.fulfill(status=503)
            elif control['response'] == 'invalid':
                route.fulfill(json=[{'address': 1, 'active': True, 'locked': 'false', 'opened': True}])
            elif control['response'] == 'active_null':
                route.fulfill(json=[{'address': 1, 'active': True, 'locked': None, 'opened': None}])
            elif control['response'] == 'duplicate':
                route.fulfill(json=[states[0], states[0]])
            elif control['response'] == 'bad_json':
                route.fulfill(content_type='application/json', body='{invalid')
            else:
                route.fulfill(json=states)
        elif request.url.endswith('/open'):
            assert request.method == 'POST', request.method
            commands.append(request.url)
            route.fulfill(status=control['open_status'])
        else:
            raise AssertionError(f'Unexpected API route: {request.url}')

    page.route('**/api/internal/**', mock)
    page.add_init_script("localStorage.setItem('boxyland-language', 'en')")
    page.goto(SERVER + '/')
    expect(page.locator('.lock-tile')).to_have_count(56, timeout=6000)
    expect(page.locator('.filter.locked .filter-count')).to_have_text('9')
    expect(page.locator('.metadata')).to_contain_text('Unlocked since—')
    expect(page.get_by_role('button', name='Lock all unlocked', exact=False)).to_have_count(0)
    expect(page.get_by_role('button', name='Demo scenarios', exact=True)).to_have_count(0)
    page.get_by_role('group', name='Filter locks').get_by_role('button', name='All', exact=False).click()
    expect(page.locator('.lock-tile')).to_have_count(56)
    # Inactive null sensor values must not invalidate connected locks or become false.
    page.get_by_role('button', name='Lock 02, unlocked/not connected', exact=True).click()
    expect(page.locator('.metadata div')).to_have_count(2)
    expect(page.get_by_role('button', name='Open lock', exact=True)).to_have_count(0)
    expect(page.locator('.connection-badge.connected')).to_be_visible()
    page.get_by_role('button', name='Lock 49, locked', exact=True).click()
    expect(page.locator('.metadata div')).to_have_count(3)
    page.get_by_role('button', name='Lock 46, locked', exact=True).click()
    page.screenshot(path=str(SHOTS / 'live-desktop.png'), full_page=True)
    page.get_by_role('button', name='Open lock', exact=True).click()
    expect(page.locator('.state-tag')).to_have_text('Processing')
    expect(page.get_by_role('button', name='Unlocking…', exact=True)).to_be_disabled()
    expect(page.get_by_role('status')).to_contain_text('Waiting for state confirmation')
    assert len(commands) == 1
    # A 204 response must not optimistically change the lock's reported state.
    page.get_by_role('button', name='Refresh', exact=True).click()
    expect(page.locator('.state-tag')).to_have_text('Processing')
    assert states[45]['locked'] is True
    states[45]['locked'] = False
    states[45]['opened'] = True
    expect(page.locator('.state-tag')).to_have_text('Unlocked', timeout=6000)
    expect(page.get_by_role('status')).to_contain_text('confirmed it is unlocked')
    expect(page.locator('.metadata')).to_contain_text('Unlocked sincetoday')
    expect(page.get_by_role('button', name='The lock is unlocked', exact=True)).to_be_disabled()
    expect(page.get_by_role('button', name='Lock', exact=True)).to_have_count(0)
    expect(page.locator('.manual-close-hint')).to_contain_text('Push the latch')
    assert len(commands) == 1

    # A server error preserves the latest snapshot and disables physical controls.
    for invalid in ['http_error', 'invalid', 'active_null', 'duplicate', 'bad_json']:
        control['response'] = invalid
        page.get_by_role('button', name='Refresh', exact=True).click()
        expect(page.locator('.connection-badge.disconnected')).to_be_visible()
        expect(page.locator('.lock-tile')).to_have_count(0 if invalid == 'http_error' else 56)
        expect(page.locator('.lock-tile:enabled')).to_have_count(0)
        control['response'] = 'valid'
        page.get_by_role('button', name='Refresh', exact=True).click()
        expect(page.locator('.connection-badge.connected')).to_be_visible(timeout=6000)

    # Failed command: no auto retries and no false success.
    control['open_status'] = 500
    page.get_by_role('button', name='Lock 49, locked', exact=True).click()
    page.get_by_role('button', name='Open lock', exact=True).click()
    expect(page.locator('.command-error')).to_contain_text('command failed')
    expect(page.locator('.state-tag')).to_have_text('Locked')
    assert len(commands) == 2
    page.get_by_role('button', name='Refresh', exact=True).click()
    expect(page.locator('.connection-badge.connected')).to_be_visible()
    assert len(commands) == 2

    # Timeout on an accepted command that never changes the sensor state.
    page.clock.install()
    control['open_status'] = 204
    page.get_by_role('button', name='Lock 56, locked', exact=True).click()
    page.get_by_role('button', name='Open lock', exact=True).click()
    expect(page.get_by_role('status')).to_contain_text('Waiting for state confirmation')
    page.clock.fast_forward(11000)
    expect(page.locator('.command-error')).to_contain_text('did not confirm unlocking')
    expect(page.locator('.state-tag')).to_have_text('Locked')
    assert len(commands) == 3 and commands[-1].endswith('/56/open')
    page.clock.resume()

    # Ports disappearing after a command become offline, never unlocked.
    states[55].update(active=False, locked=None, opened=None, last_opened=None, last_closed=None)
    page.get_by_role('button', name='Refresh', exact=True).click()
    expect(page.locator('.state-tag')).to_have_text('Unlocked/Not connected')
    expect(page.locator('.metadata div')).to_have_count(2)
    expect(page.locator('.connection-badge.connected')).to_be_visible()
    assert len(commands) == 3

    # An initial outage must not show synthetic locks or silently enter demo mode.
    outage = browser.new_page(viewport={'width': 393, 'height': 852})
    outage.on('pageerror', lambda error: errors.append(str(error)))
    outage_failed = {'value': True}
    outage.route('**/api/internal/**', lambda route: route.fulfill(status=503) if outage_failed['value'] else route.fulfill(json=states))
    outage.goto(SERVER + '/')
    outage.add_init_script("localStorage.setItem('boxyland-language', 'en')")
    outage.reload()
    expect(outage.get_by_role('heading', name='Connect to the controller')).to_be_visible(timeout=6000)
    expect(outage.locator('.lock-tile')).to_have_count(0)
    expect(outage.locator('.stats')).to_have_count(0)
    expect(outage.get_by_role('searchbox')).to_have_count(0)
    expect(outage.locator('.connect-button')).to_have_count(1)
    outage.screenshot(path=str(SHOTS / 'mobile-disconnected.png'), full_page=True)
    outage_failed['value'] = False
    outage.get_by_role('button', name='Connect', exact=True).click()
    expect(outage.locator('.lock-tile')).to_have_count(56, timeout=6000)
    expect(outage.locator('.connection-state')).to_have_count(0)
    expect(outage.get_by_role('searchbox')).to_have_count(0)

    expect(outage.get_by_role('button', name='Demo scenarios', exact=True)).to_have_count(0)
    # The removed footer and runtime simulator must stay absent on both layouts.
    for width in [320, 393, 768, 1440]:
        surface = browser.new_page(viewport={'width': width, 'height': 1000})
        surface.on('pageerror', lambda error: errors.append(str(error)))
        surface.route('**/api/internal/**', mock)
        surface.goto(SERVER + '/?mode=demo')
        surface.add_init_script("localStorage.setItem('boxyland-language', 'en')")
        surface.reload()
        expect(surface.locator('.lock-tile')).to_have_count(56, timeout=6000)
        expect(surface.locator('footer')).to_have_count(0)
        expect(surface.locator('.language-switch')).to_have_count(0)
        expect(surface.get_by_role('button', name='Switch to demo', exact=True)).to_have_count(0)
        expect(surface.get_by_role('button', name='Demo scenarios', exact=True)).to_have_count(0)
        surface.evaluate('document.fonts.ready')
        surface.wait_for_function('document.documentElement.scrollWidth <= innerWidth', timeout=2000)
        assert surface.evaluate('document.documentElement.scrollWidth <= innerWidth'), width
        if width < 768:
            assert surface.locator('.filter-row').evaluate('(el) => el.scrollWidth <= el.clientWidth'), width
            for button in surface.locator('.filter-row button').all():
                expect(button).to_be_in_viewport()

        if width < 768:
            tile = surface.get_by_role('button', name='Lock 07, unlocked', exact=True)
            tile.click()
            expect(surface.get_by_role('dialog')).to_be_visible()
            surface.keyboard.press('Escape')
            expect(surface.get_by_role('dialog')).to_have_count(0)
            expect(tile).to_be_focused()
        surface.screenshot(path=str(SHOTS / f'live-only-{width}.png'), full_page=True)
        surface.close()
    assert not errors, errors
    # Detach polling routes before closing Chrome to avoid pending route callbacks
    # keeping browser.close() waiting after all assertions have completed.
    for context in browser.contexts:
        for open_page in context.pages:
            open_page.unroute_all(behavior='wait')
        context.close()
    browser.close()
    print('PASS: 56-address live snapshots, independent flags, POST-only open, confirmed state/history, command failure/timeout without retry, stale-data protection, recovery, schema validation, initial outage, footer removal, responsive layouts and mobile keyboard operation. All commands intercepted; no physical locks opened.')
