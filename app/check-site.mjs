import { chromium } from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true});
const out='../refs/qa';fs.mkdirSync(out,{recursive:true});
const paths=['/','/poslugy','/poslugy/remont-pid-klyuch','/poslugy/demontazh','/poslugy/gipsokarton','/poslugy/steli','/poslugy/ozdoblennya','/poslugy/santehnika-elektryka','/portfolio','/pro-kompaniyu','/kontakty','/pryvatnist'];
const report=[];const failures=[];
for(const width of [1440,390]) {
 const ctx=await browser.newContext({viewport:{width,height:width===1440?1000:844},reducedMotion:'reduce'});
 const page=await ctx.newPage();page.setDefaultNavigationTimeout(90000);page.on('pageerror',e=>failures.push(e.message));
 for(const path of paths){
  const response=await page.goto('http://127.0.0.1:3000'+path,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  const state=await page.evaluate(()=>({title:document.title,h1:document.querySelector('h1')?.textContent,overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src)}));
  report.push({width,path,status:response.status(),...state});
  if(response.status()!==200||state.overflow||state.broken.length)failures.push(JSON.stringify(report.at(-1)));
  if(['/','/portfolio','/poslugy/gipsokarton','/kontakty'].includes(path))await page.screenshot({path:out+'/'+width+'-'+(path==='/'?'home':path.replaceAll('/','_'))+'.png',fullPage:true});
 }
 await page.goto('http://127.0.0.1:3000/kontakty',{waitUntil:'networkidle'});
 await page.locator('.invitation-consult').click();
 await page.getByRole('button',{name:'Підготувати звернення'}).click();
 if(!(await page.getByRole('alert').isVisible()))failures.push('Missing validation');
 await page.getByLabel('Ваше ім’я *').fill('Олена');await page.getByLabel('Телефон *').fill('+380676090075');
 await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Підготувати звернення'}).click();
 if(!(await page.getByText('Звернення підготовлено').isVisible()))failures.push('Missing form completion');
 await page.screenshot({path:out+'/'+width+'-consultation.png',fullPage:false});
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Telegram',exact:true}).first().click();
 if(!(await page.getByText('Зв’язок у Telegram').isVisible()))failures.push('Missing Telegram notice');
 await page.keyboard.press('Escape');
 await page.goto('http://127.0.0.1:3000/portfolio',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Комерційні простори',exact:true}).click();
 if(await page.locator('.portfolio-project').count()!==2)failures.push('Portfolio filter broken');
 await page.locator('.portfolio-project').first().click();
 if(!(await page.getByRole('dialog').isVisible()))failures.push('Project detail broken');
 await page.keyboard.press('Escape');
 const slider=page.getByRole('slider');await slider.focus();await page.keyboard.press('ArrowRight');
 if(await slider.inputValue()!=='51')failures.push('Before-after keyboard broken');
 await ctx.close();
}
await browser.close();fs.writeFileSync(out+'/report.json',JSON.stringify({report,failures},null,2));console.log(JSON.stringify({pages:report.length,failures},null,2));if(failures.length)process.exit(1);
