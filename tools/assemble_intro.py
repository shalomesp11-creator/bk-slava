import pathlib,subprocess,json
root=pathlib.Path(__file__).resolve().parents[1];assets=root/'app/public/assets';tmp=root/'refs/video';tmp.mkdir(parents=True,exist_ok=True)
ff=r'C:\ffmpeg\bin\ffmpeg.exe'
def call(args):
 p=subprocess.run([ff,'-hide_banner','-loglevel','error','-y']+args,capture_output=True,text=True)
 if p.returncode:raise RuntimeError(p.stderr)
names=['intro-retry','intro-leg2','intro-leg3']
for i,name in enumerate(names):
 call(['-i',str(assets/(name+'.mp4')),'-t','12','-an','-vf','scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=25,fade=t=in:st=0:d=0.35:color=0x0d3d06,fade=t=out:st=11.65:d=0.35:color=0x0d3d06','-c:v','libx264','-preset','fast','-crf','21','-pix_fmt','yuv420p',str(tmp/(str(i)+'.mp4'))])
# Preserve the supplied raster logo exactly: no AI redraw, warping or recoloring.
call(['-loop','1','-i',str(assets/'hero.webp'),'-loop','1','-i',str(assets/'logo.jpg'),'-t','10','-filter_complex',"[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=25,drawbox=x=0:y=0:w=iw:h=ih:color=0x0d3d06@0.25:t=fill[bg];[1:v]scale=550:550,format=rgba,fade=t=in:st=0:d=1:alpha=1,fade=t=out:st=6:d=2:alpha=1[logo];[bg][logo]overlay=(W-w)/2:(H-h)/2:shortest=1[v]",'-map','[v]','-an','-c:v','libx264','-preset','fast','-crf','21','-pix_fmt','yuv420p',str(tmp/'3.mp4')])
(tmp/'concat.txt').write_text('\n'.join("file '"+str(tmp/(str(i)+'.mp4')).replace('\\','/')+"'" for i in range(4)))
call(['-f','concat','-safe','0','-i',str(tmp/'concat.txt'),'-c','copy','-movflags','+faststart',str(assets/'intro.mp4')])
call(['-i',str(assets/'intro.mp4'),'-vf','scale=960:-2','-an','-c:v','libx264','-preset','fast','-crf','26','-movflags','+faststart',str(assets/'intro-mobile.mp4')])
call(['-i',str(assets/'intro.mp4'),'-frames:v','1',str(assets/'intro-poster.jpg')])
probe=subprocess.run([r'C:\ffmpeg\bin\ffprobe.exe','-v','quiet','-show_entries','format=duration,size','-of','json',str(assets/'intro.mp4')],capture_output=True,text=True)
(root/'refs/video-verification.json').write_text(probe.stdout)
print(probe.stdout)
# Keep original generation masters in refs; only optimized assets ship.
for name in names:
 p=assets/(name+'.mp4')
 if p.exists():p.replace(tmp/p.name)
for p in assets.glob('*.png'):p.replace(root/'refs'/p.name)
