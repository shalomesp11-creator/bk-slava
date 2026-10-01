import {chromium} from 'playwright';
const browser=await chromium.launch();
const base=process.env.SITE_TEST_URL||'http://127.0.0.1:3000';
for(const width of [1440,390]){
 const ctx=await browser.newContext({viewport:{width,height:900}});const page=await ctx.newPage();
 await page.goto(base+'/',{waitUntil:'commit',timeout:90000});
 try{await page.waitForFunction(()=>{const v=document.querySelector('.intro video');return v&&v.currentTime>0.2},{},{timeout:30000})}catch(e){console.log(await page.evaluate(()=>({intro:!!document.querySelector('.intro'),video:[...document.querySelectorAll('video')].map(v=>({time:v.currentTime,duration:v.duration,ready:v.readyState,paused:v.paused,error:v.error?.message,src:v.currentSrc})),body:document.body.textContent.slice(0,120)})));await browser.close();throw e}
 const media=await page.locator('.intro video').evaluate(v=>({duration:v.duration,width:v.videoWidth,source:v.currentSrc}));
 await page.screenshot({path:'../refs/qa/'+width+'-intro.png'});
 await page.getByRole('button',{name:'Перейти на сайт'}).click();
 await page.locator('.intro').waitFor({state:'detached'});
 if(await page.locator('.intro').count())throw Error('Skip failed');
 await page.reload({waitUntil:'networkidle'});if(await page.locator('.intro').count())throw Error('Session marker failed');
 console.log(width,media);await ctx.close();
}
await browser.close();
