from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]; assets=root/'app/public/assets'
for p in list(assets.glob('*.webp')):
 if p.stem.endswith(('-640','-1200')) or p.stem=='og':continue
 im=Image.open(p).convert('RGB')
 for width in [640,1200]:
  out=im.resize((width,round(im.height*width/im.width)),Image.Resampling.LANCZOS);out.save(assets/(p.stem+'-'+str(width)+'.webp'),quality=85)
print('Responsive photo sizes prepared.')
