import pathlib,json,urllib.request,re
from PIL import Image,ImageOps,ImageFont,ImageDraw
root=pathlib.Path(__file__).resolve().parents[1]; public=root/'app/public'; assets=public/'assets'
req=urllib.request.Request('https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap',headers={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'})
css=urllib.request.urlopen(req).read().decode();(root/'refs/font-source.css').write_text(css)
urls=re.findall(r'url\(([^)]+)\)',css)
for name in ['cyrillic','latin']:
 b=next((b for b in css.split('/* ') if b.startswith(name+' */')),None)
 url=re.search(r'url\(([^)]+)\)',b).group(1) if b else urls[-1]
 urllib.request.urlretrieve(url,public/'fonts'/('manrope-'+name+'.woff2'))
if (assets/'hero.webp').exists():
 im=ImageOps.fit(Image.open(assets/'hero.webp').convert('RGB'),(1200,630))
 shade=Image.new('RGBA',im.size,(13,61,6,0));d=ImageDraw.Draw(shade)
 for x in range(1200):d.line([(x,0),(x,630)],fill=(13,61,6,int(220*(1-x/1400))))
 im=Image.alpha_composite(im.convert('RGBA'),shade);d=ImageDraw.Draw(im)
 font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',80);small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',25)
 d.text((60,265),'Простір, у якому\nхочеться жити.',font=font,fill='white',spacing=10)
 d.text((63,70),'ТОВ БК СЛАВА',font=small,fill='white');d.text((63,555),'РЕМОНТ І БУДІВНИЦТВО З 2006 РОКУ',font=small,fill='#89db7c')
 im.convert('RGB').save(assets/'og.webp',quality=93)
photos=[p for p in assets.glob('*.webp') if p.stem not in ['og']]
canvas=Image.new('RGB',(1200,260*((len(photos)+2)//3)),'#f3f5f0')
for i,p in enumerate(photos):
 im=ImageOps.contain(Image.open(p),(390,220));x=(i%3)*400;y=(i//3)*260;canvas.paste(im,(x,y+22));ImageDraw.Draw(canvas).text((x+10,y+4),p.stem,fill='black')
canvas.save(root/'refs/photos.jpg')
print('Fonts, social card and photo contact sheet ready.')
