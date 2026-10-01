import { chromium } from 'playwright';
const browser=await chromium.launch();
const base=process.env.SITE_TEST_URL||'http://127.0.0.1:3000';
for(const width of [1440,390,320]){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
 const page=await context.newPage();
 await page.goto(base,{waitUntil:'networkidle'});
 await page.locator('.work-track').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>[...document.querySelectorAll('.work-track img')].slice(0,2).every(i=>i.complete));
 const first=await page.locator('.work-track').evaluate(e=>e.scrollLeft);
 await page.getByRole('button',{name:'Наступна робота'}).click();
 await page.waitForFunction(()=>document.querySelector('.work-track').scrollLeft>10);
 await page.getByRole('button',{name:'Попередня робота'}).click();
 await page.waitForFunction(()=>document.querySelector('.work-track').scrollLeft<10);
 if(first!==0)throw Error('Initial carousel offset');
 for(let i=0;i<(width>600?4:5);i++) {const before=await page.locator('.work-track').evaluate(e=>e.scrollLeft);await page.getByRole('button',{name:'Наступна робота'}).click();await page.waitForFunction(x=>document.querySelector('.work-track').scrollLeft>x+10,before);}
 await page.waitForFunction(()=>document.querySelector('[aria-label="Наступна робота"]').disabled);
 if(await page.getByRole('button',{name:'Наступна робота'}).isEnabled())throw Error('Carousel end control');
 if(await page.locator('img.button-primary').count())throw Error('Photo assigned button class');
 if(await page.locator('img[src="/assets/logo.jpg"]').count())throw Error('Old square logo');
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Overflow '+width);
 await page.getByRole('button',{name:'Попередня робота'}).click();
 await page.evaluate(async()=>{document.activeElement?.blur();document.querySelector('.work-track').scrollTo({left:0,behavior:'instant'});for(const i of document.images)i.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));window.scrollTo({top:0,behavior:'instant'});});
 await page.waitForFunction(()=>document.querySelector('.work-track').scrollLeft<1);
 await page.screenshot({path:'../refs/qa/'+width+'-redesign-home.png',fullPage:true});
 await page.goto(base+'/portfolio',{waitUntil:'networkidle'});
 const boxes=await page.locator('.portfolio-project .image-crop').evaluateAll(els=>els.map(e=>({w:e.clientWidth,h:e.clientHeight})));
 if(boxes.some(b=>Math.abs(b.w-boxes[0].w)>1||Math.abs(b.h-boxes[0].h)>1))throw Error('Unequal cards');
 console.log({width,carousel:'pass',cards:'equal',debug:await page.getByText('Сделать скриншот',{exact:true}).count()});
 await context.close();
}
await browser.close();
