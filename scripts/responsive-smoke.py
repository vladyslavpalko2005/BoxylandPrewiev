"""Responsive filter/scroll checks; API requests are intercepted, never hardware."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

SERVER = os.environ.get('LIVE_TEST_SERVER', 'http://127.0.0.1:5175')
SHOTS = Path('.impeccable/review/responsive')
SHOTS.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    for engine in [p.chromium, p.webkit]:
        browser = engine.launch(headless=True)
        for width, height in [(320,568), (360,640), (393,852), (620,250), (640,360), (768,390), (1440,900)]:
            context = browser.new_context(viewport={'width':width, 'height':height}, has_touch=True)
            page = context.new_page()
            states = [{'address':n,'active':n<=44,'locked':n<=2,'opened':n>2} for n in range(1,49)]
            page.route('**/api/internal/states', lambda route: route.fulfill(json=states))
            page.goto(SERVER)
            expect(page.locator('.lock-tile')).to_have_count(48)
            expect(page.locator('.filter-row button')).to_have_count(4)
            for choice, count in [('all',48), ('locked',2), ('unlocked',42), ('offline',4)]:
                page.locator('.filter.'+choice).click()
                expect(page.locator('.lock-tile')).to_have_count(count)
                expect(page.locator('.filter.'+choice+' .filter-count')).to_have_text(str(count))
                page.wait_for_timeout(400)
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), (engine.name,width,height,choice)
                assert page.locator('.filter-row').evaluate('(e)=>e.scrollWidth<=e.clientWidth'), (engine.name,width,height,choice)
                for button in page.locator('.filter-row button').all():
                    bounds=button.bounding_box()
                    assert bounds['x']>=0 and bounds['x']+bounds['width']<=width+0.5, (width,choice,bounds)
                    if width<768:
                        assert bounds['height']>=44 and bounds['width']>=44, (width,choice,bounds)
                if width<768:
                    dock=page.locator('.filter-panel').bounding_box()
                    assert dock['y']>=0 and dock['y']+dock['height']<=height, (width,height,dock)
                    page.locator('.lock-tile').last.scroll_into_view_if_needed()
                    page.locator('.dashboard').evaluate('(e)=>e.scrollTop=e.scrollHeight')
                    last=page.locator('.lock-tile').last.bounding_box()
                    assert last['y']+last['height']<=dock['y']-4, (width,height,choice,last,dock)
                    assert last['y']>=page.locator('.app-header').bounding_box()['height'], (width,height,choice,last)
                    assert page.locator('.app-header').bounding_box()['y']==0
                    assert page.locator('.mobile-controls-floating').evaluate('(e)=>getComputedStyle(e).backgroundColor')=='rgba(0, 0, 0, 0)'
                    assert page.locator('.dashboard').bounding_box()['y']+page.locator('.dashboard').bounding_box()['height']>=height-1
                if choice=='all' and width in [393,620,1440]:
                    page.screenshot(path=str(SHOTS/f'{engine.name}-{width}x{height}.png'))
            if width<768:
                page.locator('.filter.unlocked').click()
                expect(page.locator('.lock-tile.offline')).to_have_count(0)
                page.locator('.filter.offline').click()
                expect(page.locator('.lock-tile.unlocked')).to_have_count(0)
                page.set_viewport_size({'width':393,'height':400})
                page.locator('.lock-tile').last.scroll_into_view_if_needed()
                dock=page.locator('.filter-panel').bounding_box()
                assert dock['y']+dock['height']<=400
                expect(page.locator('.filter-row button')).to_have_count(4)
            context.close()
            print(f'PASS: {engine.name} {width}x{height}: 4 filters, separate states, reachable last row, viewport bounds',flush=True)
        # The unloaded controller view has ordinary padding; its action owns
        # a footer row instead of requiring a 104px padding reserve.
        for width,height in [(320,568),(412,924),(620,250),(768,900),(1440,900)]:
            context=browser.new_context(viewport={'width':width,'height':height})
            page=context.new_page()
            page.route('**/api/internal/states',lambda route:route.fulfill(status=503))
            page.goto(SERVER)
            expect(page.locator('.connect-button')).to_be_visible()
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth && document.documentElement.scrollHeight<=innerHeight'), (engine.name,width,height,'root overflow')
            assert page.locator('.dashboard').evaluate('(e)=>e.scrollWidth<=e.clientWidth && e.scrollHeight<=e.clientHeight'), (engine.name,width,height,'main overflow')
            assert page.locator('.dashboard').evaluate('(e)=>parseFloat(getComputedStyle(e).paddingBottom)')<=20
            action=page.locator('.connect-button').bounding_box()
            assert action['y']+action['height']<=height
            assert not page.locator('.filter-panel').count()
            page.screenshot(path=str(SHOTS/f'{engine.name}-connect-{width}x{height}.png'))
            context.close()
        browser.close()
