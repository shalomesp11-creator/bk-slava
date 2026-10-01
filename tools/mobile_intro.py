import subprocess
f="[0:v]split=2[bg][fg];[bg]scale=720:1600:force_original_aspect_ratio=increase,crop=720:1600,boxblur=80:3[back];[fg]scale=900:506,format=yuva420p,geq=lum='lum(X,Y)':cb='cb(X,Y)':cr='cr(X,Y)':a='255*min(1,min(Y/65,(H-Y)/65))'[front];[back][front]overlay=-90:547,format=yuv420p[v]"
subprocess.run(['C:/ffmpeg/bin/ffmpeg.exe','-hide_banner','-loglevel','error','-y','-i','refs/video/redesign-intro.mp4','-filter_complex',f,'-map','[v]','-t','5','-an','-c:v','libx264','-crf','23','-movflags','+faststart','app/public/assets/intro-mobile.mp4'],check=True)
