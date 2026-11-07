"""Smoke test: load the page, step through years, use the main controls, fail on any JS error.

Usage:  python3 -m http.server 8000   (in the repo root, separate terminal)
        python3 tests/smoke.py [http://localhost:8000/] [path-to-chrome]
Needs: pip install playwright && playwright install chromium
"""
import asyncio,sys
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else "http://localhost:8000/"
CHROME=sys.argv[2] if len(sys.argv)>2 else None
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(**({"executable_path":CHROME} if CHROME else {}));errs=[]
        for vp in ({"width":1440,"height":900},{"width":390,"height":844}):
            pg=await b.new_page(viewport=vp);pg.on("pageerror",lambda e:errs.append(str(e)))
            await pg.goto(URL);await pg.wait_for_timeout(2500)
            await pg.evaluate("document.getElementById('intro').remove()")
            for y,l in ((1300,'nl'),(1600,'en'),(1830,'nl'),(1953,'en'),(2026,'nl')):
                await pg.evaluate(f"__stilte.set({y},0,null,'{l}')");await pg.wait_for_timeout(200)
            await pg.evaluate("__stilte.focus(4.49,52.16,20)");await pg.wait_for_timeout(500)
            await pg.mouse.move(vp["width"]//2,vp["height"]//2);await pg.mouse.click(vp["width"]//2,vp["height"]//2)
            await pg.keyboard.press("Escape");await pg.keyboard.press("Space");await pg.wait_for_timeout(1500);await pg.keyboard.press("Space")
            await pg.close()
        await b.close()
        print("JS errors:",errs or "none");sys.exit(1 if errs else 0)
asyncio.run(main())
