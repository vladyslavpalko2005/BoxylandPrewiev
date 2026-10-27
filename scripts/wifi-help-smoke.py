"""Manual Wi-Fi help and immediate return checks; no hardware requests."""
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

SERVER=os.environ.get('LIVE_TEST_SERVER','http://127.0.0.1:5175')
SHOTS=Path('.impeccable/review/wifi-help');SHOTS.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    for engine in [p.chromium,p.webkit]:
        browser=engine.launch(headless=True)
        for width,height,event in [(320,568,'focus'),(393,852,'visibilitychange'),(620,250,'focus'),(1440,900,'visibilitychange')]:
            page=browser.new_page(viewport={'width':width,'height':height})
            replies={'valid':False,'calls':0}
            errors=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            def api(route):
                assert route.request.method=='GET'
                replies['calls']+=1
                if replies['valid']:route.fulfill(json=[{'address':1,'active':True,'locked':True,'opened':False}])
                else:route.fulfill(status=503)
            page.route('**/api/internal/**',api)
            page.goto(SERVER)
            expect(page.locator('.connect-button')).to_have_text('Pripojiť')
            page.locator('.connect-button').click()
            expect(page.get_by_role('heading',name='Pripojenie cez Wi-Fi')).to_be_visible()
            expect(page.locator('.wifi-help-steps li')).to_have_count(3)
            expect(page.locator('.wifi-help')).to_contain_text('Po návrate pripojenie overíme automaticky.')
            expect(page.locator('.connect-button')).to_have_text('Skúsiť znova')
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth && document.documentElement.scrollHeight<=innerHeight'),(width,height)
            button=page.locator('.connect-button').bounding_box()
            assert button['y']+button['height']<=height
            page.screenshot(path=str(SHOTS/f'{engine.name}-{width}.png'))
            # Freeze polling, so only returning to the page can recover now.
            page.clock.install()
            page.clock.pause_at(datetime.now(timezone.utc)+timedelta(seconds=10))
            expect(page.locator('.connect-button')).to_be_enabled()
            previous=replies['calls']
            replies['valid']=True
            if event=='focus':page.evaluate('window.dispatchEvent(new Event("focus"))')
            else:page.evaluate('document.dispatchEvent(new Event("visibilitychange"))')
            expect(page.locator('.lock-tile')).to_have_count(1,timeout=1500)
            assert replies['calls']>previous
            expect(page.locator('.wifi-help')).to_have_count(0)
            assert not errors,errors
            page.unroute_all(behavior='wait');page.close()
            print(f'PASS: {engine.name} {width}x{height}: help, retry and immediate {event} recovery',flush=True)
        browser.close()
