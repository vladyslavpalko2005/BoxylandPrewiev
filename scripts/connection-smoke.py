"""Connection screen checks with intercepted API responses; no hardware calls."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

SERVER = os.environ.get('LIVE_TEST_SERVER', 'http://127.0.0.1:5175')
SHOTS = Path('.impeccable/review/connection')
SHOTS.mkdir(parents=True, exist_ok=True)
STATES = [{'address': 1, 'active': True, 'locked': True, 'opened': False}]

with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    for width, height in [(393, 852), (1440, 900), (320, 740)]:
        context = browser.new_context(viewport={'width': width, 'height': height})
        page = context.new_page()
        replies = {'kind': 'unavailable', 'calls': 0}
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))

        def api(route):
            assert route.request.method == 'GET'
            replies['calls'] += 1
            if replies['kind'] == 'valid':
                route.fulfill(json=STATES)
            elif replies['kind'] == 'html':
                route.fulfill(content_type='text/html', body='<html>Captive portal</html>')
            elif replies['kind'] == 'network':
                route.abort('internetdisconnected')
            else:
                route.fulfill(status=503)

        page.route('**/api/internal/**', api)
        page.goto(SERVER)
        expect(page.get_by_role('heading', name='Pripojte sa k ovládaču')).to_be_visible()
        expect(page.locator('.connect-button')).to_have_text('Pripojiť')
        expect(page.locator('.connection-badge')).to_contain_text('Nepripojené')
        expect(page.locator('.lock-tile')).to_have_count(0)
        assert not page.get_by_text('Pripojiť káblom', exact=False).count()
        page.evaluate('document.fonts.ready')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        page.screenshot(path=str(SHOTS / f'{width}.png'))
        for kind in ['html', 'network']:
            replies['kind'] = kind
            page.reload()
            expect(page.locator('.connect-button')).to_be_visible()
        replies['kind'] = 'valid'
        page.locator('.connect-button').click()
        expect(page.locator('.lock-tile')).to_have_count(1)
        # Network loss immediately hides controls and any detail sheet.
        if width < 768:
            page.locator('.lock-tile').click()
            expect(page.locator('dialog')).to_be_visible()
        context.set_offline(True)
        expect(page.locator('.connect-button')).to_be_visible()
        expect(page.locator('dialog')).to_have_count(0)
        expect(page.locator('.lock-tile')).to_have_count(0)
        context.set_offline(False)
        expect(page.locator('.lock-tile')).to_have_count(1, timeout=6000)
        assert not errors, errors
        context.close()
    # Offline browser signal at initial load: serve cached/local assets, do not poll API.
    context = browser.new_context(viewport={'width': 393, 'height': 852})
    context.add_init_script("Object.defineProperty(navigator, 'onLine', {get: () => false})")
    page = context.new_page()
    calls = []
    page.route('**/api/internal/**', lambda route: (calls.append(route.request.url), route.abort()))
    page.goto(SERVER)
    expect(page.locator('.connect-button')).to_be_visible()
    assert not calls, calls
    context.close()
    browser.close()
    print('PASS: offline, unavailable API, captive HTML, retry, online recovery, hidden controls, 320/393/1440px.')
