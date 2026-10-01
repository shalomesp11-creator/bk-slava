import {chromium} from 'playwright';
const browser=await chromium.launch();
for(const width of [1440,390]){
 const ctx=await browser.newContext({viewport:{width,height:900}});const page=await ctx.newPage();
 await page.goto('http://127.0.0.1:3000/',{waitUntil:'networkidle',timeout:90000});
 await page.waitForFunction(()=>{const v=document.querySelector('.intro video');return v&&v.currentTime>0.2&&v.duration===46},{},{timeout:30000});
 const media=await page.locator('.intro video').evaluate(v=>({duration:v.duration,width:v.videoWidth,source:v.currentSrc}));
 await page.screenshot({path:'../refs/qa/'+width+'-intro.png'});
 await page.getByRole('button',{name:'Перейти на сайт'}).click();
 if(await page.locator('.intro').count())throw Error('Skip failed');
 await page.reload({waitUntil:'networkidle'});if(await page.locator('.intro').count())throw Error('Session marker failed');
 console.log(width,media);await ctx.close();
}
await browser.close();
