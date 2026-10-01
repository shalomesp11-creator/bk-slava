import pathlib,json,urllib.request,sys
from PIL import Image,ImageOps,ImageDraw
root=pathlib.Path(__file__).resolve().parents[1]
names=sys.argv[1:]
for p in (root/'media-jobs').glob('*.json'):
 if names and p.stem not in names: continue
 try:
  raw=p.read_bytes(); jobs=json.loads(raw.decode('utf-16' if raw.startswith(b'\xff\xfe') else 'utf-8-sig'))
 except ValueError: continue
 job=jobs[0] if isinstance(jobs,list) else jobs
 url=job.get('result_url')
 if not url: continue
 out=root/('refs' if p.stem.startswith('board') else 'app/public/assets')
 out.mkdir(parents=True,exist_ok=True)
 ext='.mp4' if job.get('job_type','').startswith(('seedance','kling','veo')) else '.png'
 dest=out/(p.stem+ext)
 if not dest.exists(): urllib.request.urlretrieve(url,dest)
 print(p.stem+' downloaded',flush=True)
 if ext=='.png' and not p.stem.startswith('board'):
  im=Image.open(dest).convert('RGB'); im.thumbnail((1920,1920)); im.save(out/(p.stem+'.webp'),'WEBP',quality=88)
boards=list((root/'refs').glob('board*.png'))
if boards:
 canvas=Image.new('RGB',(1200,380*((len(boards)+1)//2)), '#f3f5f0')
 for i,p in enumerate(boards):
  im=Image.open(p); im=ImageOps.contain(im,(590,340)); x=(i%2)*600;y=(i//2)*380
  canvas.paste(im,(x,y+25));ImageDraw.Draw(canvas).text((x+10,y+5),p.stem,fill='black')
 canvas.save(root/'refs/boards.jpg')
