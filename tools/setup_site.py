from pathlib import Path
import shutil,json,urllib.request,re
from PIL import Image,ImageOps,ImageDraw,ImageFont
root=Path(__file__).resolve().parents[1]; app=root/'app'; routes=app/'src/routes'; public=app/'public'; assets=public/'assets';assets.mkdir(parents=True,exist_ok=True)
shutil.copy(root.parent/'logo.jpg',assets/'logo.jpg')
pages=[('poslugy','ServicesPage','Послуги','Ремонт під ключ, демонтаж, гіпсокартон, стелі, оздоблення, сантехніка та електрика. Київ та область.','house'),('portfolio','Portfolio','Наші роботи','Архітектурні рішення та візуалізації житлових і комерційних просторів.','hero'),('pro-kompaniyu','About','Про компанію','ТОВ БК Слава працює з 2006 року у Києві та Київській області.','material'),('kontakty','Contacts','Контакти','Телефон +380 67 609 00 75. WhatsApp, Viber, email. Запис на консультацію.','material'),('pryvatnist','Privacy','Приватність','Обробка контактних даних у формі консультації БК Слава.','og')]
for slug,comp,title,desc,image in pages:
 (routes/(slug+'.tsx')).write_text(f"import {{createFileRoute}} from '@tanstack/react-router';\nimport {{{comp}}} from '../slava/site';\nimport {{pageHead}} from '../slava/content';\nexport const Route=createFileRoute('/{slug}')({{head:()=>pageHead('{title}','/{slug}','{desc}','{image}'),component:{comp}}});\n",encoding='utf-8')
slugs=['remont-pid-klyuch','demontazh','gipsokarton','steli','ozdoblennya','santehnika-elektryka']
for index,slug in enumerate(slugs):
 (routes/('poslugy.'+slug+'.tsx')).write_text(f"import {{createFileRoute}} from '@tanstack/react-router';\nimport {{ServicePage}} from '../slava/site';\nimport {{pageHead,services}} from '../slava/content';\nconst service=services[{index}];\nexport const Route=createFileRoute('/poslugy/{slug}')({{head:()=>pageHead(service.name,'/poslugy/{slug}',service.intro,service.image),component:()=> <ServicePage service={{service}}/>}});\n",encoding='utf-8')
# Index file prevents a services layout from swallowing nested service pages.
(routes/'poslugy.tsx').rename(routes/'poslugy.index.tsx')
p=routes/'poslugy.index.tsx';p.write_text(p.read_text(encoding='utf-8').replace("createFileRoute('/poslugy')","createFileRoute('/poslugy/')"),encoding='utf-8')
paths=['/']+['/'+p[0] for p in pages]+['/poslugy/'+s for s in slugs]
sitemap="""import {createFileRoute} from '@tanstack/react-router';
const paths=PATHS;
export const Route=createFileRoute('/sitemap.xml')({server:{handlers:{GET:async()=>new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+paths.map(p=>'<url><loc>https://bk-slava.higgsfield.app'+p+'</loc></url>').join('')+'</urlset>',{headers:{'Content-Type':'application/xml; charset=utf-8'}})}}});
""".replace('PATHS',json.dumps(paths))
(routes/'sitemap[.]xml.ts').write_text(sitemap,encoding='utf-8')
fontdir=public/'fonts';fontdir.mkdir(exist_ok=True)
req=urllib.request.Request('https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap',headers={'User-Agent':'Mozilla/5.0'})
css=urllib.request.urlopen(req).read().decode()
blocks=css.split('/* ')
for subset in ['cyrillic','latin']:
 block=next((b for b in blocks if b.startswith(subset+' */')),None)
 if block:
  url=re.search(r'url\(([^)]+)\)',block).group(1);urllib.request.urlretrieve(url,fontdir/('manrope-'+subset+'.woff2'))
logo=Image.open(assets/'logo.jpg').convert('RGB')
mark=logo.crop((310,100,950,790))
for size,name in [(16,'favicon-16.png'),(32,'favicon-32.png'),(180,'apple-touch-icon.png'),(192,'icon-192.png'),(512,'icon-512.png')]:
 canvas=Image.new('RGB',(size,size),'#0d3d06');im=ImageOps.contain(mark,(int(size*.78),int(size*.78)));canvas.paste(im,((size-im.width)//2,(size-im.height)//2));canvas.save(public/name)
Image.open(public/'favicon-32.png').save(public/'favicon.ico',sizes=[(16,16),(32,32)])
shutil.copy(public/'icon-512.png',public/'icon-maskable.png')
(public/'site.webmanifest').write_text(json.dumps({'name':'ТОВ БК Слава','short_name':'БК Слава','lang':'uk','start_url':'/','display':'standalone','background_color':'#F3F5F0','theme_color':'#0D3D06','icons':[{'src':'/icon-192.png','sizes':'192x192','type':'image/png'},{'src':'/icon-512.png','sizes':'512x512','type':'image/png'},{'src':'/icon-maskable.png','sizes':'512x512','type':'image/png','purpose':'maskable'}]},ensure_ascii=False),encoding='utf-8')
(root/'media-jobs').mkdir(exist_ok=True)
print('Routes, logo, favicon family and local fonts prepared.')
