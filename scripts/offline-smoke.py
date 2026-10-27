"""Production HTTP checks with no Internet, storage or physical lock commands.

Serve dist/ on port 4174 before running. Only the test intercepts the API;
production always uses the real controller's same-origin API.
"""
import os
import re
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright, expect

SERVER = os.environ.get('OFFLINE_TEST_SERVER', 'http://127.0.0.1:4174')
ORIGIN = 'http://192.168.50.1'
SHOTS = Path('.impeccable/review/offline')
SHOTS.mkdir(parents=True, exist_ok=True)

RESTRICTED = """() => {
  for (const name of ['localStorage', 'sessionStorage']) {
    Object.defineProperty(window, name, { configurable: true, get() {
      throw new DOMException('Storage disabled', 'SecurityError');
    }});
  }
  Object.defineProperty(document, 'cookie', {
    get() { return ''; }, set() { throw new Error('Cookies disabled'); }
  });
  AbortSignal.any = undefined;
  AbortSignal.timeout = undefined;
  const match = window.matchMedia.bind(window);
  window.matchMedia = (...args) => {
    const query = match(...args);
    query.addEventListener = undefined;
    query.removeEventListener = undefined;
    return query;
  };
}"""


def verify_surface(browser, name, width, height, mobile):
    context = browser.new_context(
        viewport={'width': width, 'height': height},
        is_mobile=mobile, has_touch=mobile, service_workers='block',
    )
    context.add_init_script(RESTRICTED)
    page = context.new_page()
    errors, external, commands, failures = [], [], [], []
    control = {'unavailable': False}
    states = [
        {'address': n, 'active': n not in [6, 40, 41, 42, 43, 44, 45, 46], 'locked': n not in [3, 7, 22], 'opened': n in [3, 7, 22]}
        for n in range(1, 49)
    ]

    def route_request(route):
        request = route.request
        url = urlsplit(request.url)
        if f'{url.scheme}://{url.netloc}' != ORIGIN:
            external.append(request.url)
            route.abort()
        elif url.path == '/api/internal/states':
            assert request.method == 'GET'
            if control['unavailable']:
                route.fulfill(status=503, body='Unavailable')
            else:
                route.fulfill(json=states)
        elif url.path.endswith('/open'):
            assert request.method == 'POST'
            commands.append(url.path)
            route.fulfill(status=204)
        else:
            # Serve only local build files while the browser uses a real LAN
            # HTTP origin (not localhost's privileged secure context).
            response = route.fetch(url=SERVER + url.path)
            if response.status != 200:
                failures.append((url.path, response.status))
            route.fulfill(response=response)

    page.on('pageerror', lambda error: errors.append(str(error)))
    page.route('**/*', route_request)
    page.goto(ORIGIN + '/')
    page.wait_for_load_state('networkidle')
    expect(page.locator('.lock-tile')).to_have_count(48)
    expect(page.locator('.connection-badge.connected')).to_be_visible()
    assert not page.evaluate('window.isSecureContext'), 'Test must exercise plain LAN HTTP'
    assert page.evaluate('document.fonts.check("400 16px Instrument Sans", "Zámky Ľščťžýáíé")')
    assert page.locator('.brand img').evaluate('(img) => img.complete && img.naturalWidth > 0')
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), name
    page.screenshot(path=str(SHOTS / f'{name}.png'), full_page=True)

    if width >= 1180:
        sidebar = page.locator('.filter-panel').bounding_box()
        grid = page.locator('.locks-panel').bounding_box()
        assert grid['x'] + grid['width'] <= sidebar['x'], 'Sidebar overlaps the grid'
    if width < 768:
        dock = page.locator('.filter-panel').bounding_box()
        page.locator('.lock-tile').last.scroll_into_view_if_needed()
        last = page.locator('.lock-tile').last.bounding_box()
        assert last['y'] + last['height'] <= dock['y'], 'Dock must not prevent reaching the last port'
        assert page.locator('.filter-panel').bounding_box()['y'] == dock['y']
        page.locator('.dashboard').evaluate('(e) => e.scrollTo(0, 0)')
    page.locator('.filter.locked').click()
    expect(page.locator('.lock-tile')).to_have_count(37)
    page.locator('.filter.unlocked').click()
    expect(page.locator('.filter-row button')).to_have_count(4)
    expect(page.locator('.lock-tile')).to_have_count(3)
    expect(page.locator('.lock-tile.unlocked')).to_have_count(3)
    page.locator('.filter.offline').click()
    expect(page.locator('.lock-tile')).to_have_count(8)
    expect(page.locator('.lock-tile.offline')).to_have_count(8)
    page.locator('.lock-tile.offline').first.click()
    expect(page.locator('.metadata div')).to_have_count(2)
    if width < 768:
        page.locator('dialog .detail-heading .icon-button').click()
    page.locator('.filter.all').click()
    expect(page.get_by_role('searchbox')).to_have_count(0)
    page.locator('.lock-tile').first.click()
    if width < 768:
        expect(page.locator('dialog[open]')).to_be_visible()
        close = page.locator('dialog .detail-heading .icon-button')
        bounds = close.bounding_box()
        assert bounds['width'] >= 44 and bounds['height'] >= 44, (bounds, close.evaluate('(e) => ({pointer: matchMedia("(pointer: coarse)").matches, width: getComputedStyle(e).width, height: getComputedStyle(e).height})'))
        assert page.locator('dialog').evaluate('(d) => d.getBoundingClientRect().height <= innerHeight')
        page.screenshot(path=str(SHOTS / f'{name}-detail.png'), full_page=True)

    # Intercepted POST: a success alone must not change sensor state.
    page.locator('.detail-action').click()
    expect(page.locator('.state-tag')).to_have_text('Spracováva sa')
    assert commands == ['/api/internal/1/open']
    states[0]['locked'] = False
    refresh = page.locator('.connection-badge' if width < 768 else '.header-refresh')
    if width < 768:
        page.locator('dialog .detail-heading .icon-button').click()
    refresh.click()
    expect(page.locator('.lock-tile').first).to_have_class(re.compile(r'\bunlocked\b'))
    control['unavailable'] = True
    refresh.click()
    expect(page.locator('.connection-badge.disconnected')).to_be_visible()
    expect(page.get_by_role('heading', name='Pripojte sa k ovládaču')).to_be_visible()
    expect(page.locator('.lock-tile')).to_have_count(0)
    control['unavailable'] = False
    expect(page.locator('.connection-badge.connected')).to_be_visible(timeout=6000)
    expect(page.locator('.lock-tile').first).to_be_enabled()
    page.reload()
    expect(page.locator('.lock-tile')).to_have_count(48)
    page.wait_for_load_state('networkidle')
    assert commands == ['/api/internal/1/open'], 'Reload/reconnect must not replay commands'
    assert not external, external
    assert not failures, failures
    assert not errors, errors
    assert not context.cookies()
    print(f'PASS: {name}: local HTTP assets/fonts, storage denied, filters, sensor-confirmed command, recovery')
    page.unroute_all(behavior='wait')
    context.close()


with sync_playwright() as p:
    for engine, sizes in [
        ('chromium', [(320, 740), (390, 844), (844, 390), (768, 1024), (1440, 1000)]),
        ('webkit', [(390, 844), (844, 390)]),
    ]:
        browser = getattr(p, engine).launch(headless=True)
        for width, height in sizes:
            verify_surface(browser, f'{engine}-{width}x{height}', width, height, width <= 844)
        browser.close()

    browser = p.chromium.launch(headless=True)
    context = browser.new_context(java_script_enabled=False)
    page = context.new_page()
    page.goto(SERVER)
    expect(page.locator('noscript p')).to_be_visible()
    expect(page.locator('noscript p')).to_contain_text('JavaScript')
    print('PASS: JavaScript-disabled browser shows local-browser instructions')
    context.close()
    browser.close()
