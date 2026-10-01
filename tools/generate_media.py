import subprocess, json, pathlib, concurrent.futures, sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'media-jobs'; OUT.mkdir(exist_ok=True)
CLI=r'C:\Users\PC\AppData\Roaming\npm\higgsfield.cmd'
def run(name, model, prompt, extra=None):
    dest=OUT/(name+'.json')
    if dest.exists(): return name+' already submitted'
    args=[CLI,'generate','create',model,'--prompt',prompt,'--json','--wait','--wait-timeout','30m']+(extra or [])
    p=subprocess.run(args,capture_output=True,text=True,encoding='utf-8')
    dest.write_text(p.stdout or p.stderr,encoding='utf-8')
    return name+': '+str(p.returncode)+' '+(p.stderr[:220] if p.returncode else 'ready')
base='Website desktop section design reference, Ukrainian construction company BK Slava, architectural editorial art direction, mineral white #F3F5F0, forest green #0D3D06, tiny electric green #1FCE08 accents. Sharp planes, Manrope Cyrillic grotesk, extremely sophisticated generous composition, real architectural photography, no template cards, no glow, no browser chrome, no watermark. '
boards={
'board-hero':'Image as canvas, bright contemporary minimal apartment fills width. Giant white two-line headline lower left: Простір, у якому хочеться жити. Small forest consultation slab at bottom right. Thin cream header, brand logo space, four navigation links.',
'board-year':'White mineral surface, enormous outline numeral 2006 on left, compact paragraph right, forest vertical hairline. Headline: Досвід, що стає основою. Premium typography and negative space.',
'board-services':'A white architectural service directory. Headline Послуги. Six horizontal ruled rows, a large interior image preview breaking into right half. Each row has a number and a Ukrainian renovation service name. Refined green arrows.',
'board-projects':'Portfolio section, asymmetric staggered two photographic images, modern living room large left and refined office smaller lower right. Text below photos. Headline: Майбутній вигляд вашого простору. Generous mineral margins.',
'board-process':'Full forest green architectural field, small lime lines. Headline: Від задуму до останньої деталі. Four quiet sequential steps across width, no boxes, mint text, precision grid.',
'board-contact':'White editorial contact composition with giant forest headline: Почнемо з вашого простору. Large telephone typography, small separate WhatsApp Viber Telegram links. Green consultation rectangle aligned lower right.'}
photos={
'hero':'High-end architectural interior photography of a real plausible recently renovated Kyiv apartment living room. Large windows right, pale mineral plaster, oak floor, dark forest green kitchen cabinetry in background, elegant low sofa, daylight, detailed material texture. Wide rectilinear 24mm tilt-shift lens, straight verticals, eye-level, quiet balanced asymmetry. No people, no text, no watermark, no fantastical geometry, no CGI appearance.',
'house':'Professional architectural photography of contemporary private house living and dining room near Kyiv, oak flooring, mineral white walls, dark green joinery, garden through glass doors, restrained furniture, realistic lived-in detail, daylight, straight verticals, no text no logos no watermark.',
'office':'Professional architectural photography of a renovated Ukrainian office, Grilyato ceiling black open-cell grid with precise recessed lights, glass meeting rooms, green fabric chairs, warm light grey floors, plausible joints, real office finishes, no people, no text no watermark.',
'drywall':'Real documentary construction photograph inside Ukrainian apartment, unfinished gypsum board partition and niche, visible metal studs on one side, neatly taped screw lines, clean tools on floor, natural window light, precise perspective, believable construction detail, no people, no text, no watermark.',
'bathroom':'Professional interior photograph of realistic newly renovated apartment bathroom, pale large-format tile, forest green vanity, brushed steel fixtures, realistic plumbing, mirror with subtle warm task light, daylight, no people no text no watermark.',
'ceiling':'Professional detailed architectural photograph of bright office with Armstrong acoustic tile suspended ceiling, exact regular ceiling tile grid, straight aligned LED panels, daylight and neutral painted walls, photoreal material imperfections, no people no text no watermark.',
'material':'Macro architectural material photography, intersecting real brushed stainless steel, cast mineral concrete and transparent glass surfaces, deep forest green reflected lighting, controlled natural shadows, luxury construction precision, no neon no text no logos no watermark.',
'before':'Architectural documentary photograph of an unfinished Kyiv apartment living room, raw screed floor, raw plaster walls, exposed ceiling, large three-panel window on right, rectangular room and kitchen opening back left. Shot eye level from doorway with 24mm rectilinear lens, straight verticals, daylight, no people no text no logos no watermark.'}
if len(sys.argv)>1 and sys.argv[1]=='boards':
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
        fs=[ex.submit(run,n,'gpt_image_2',base+p,['--aspect_ratio','16:9','--resolution','1k','--quality','high']) for n,p in boards.items()]
        for f in concurrent.futures.as_completed(fs): print(f.result(),flush=True)
elif len(sys.argv)>1 and sys.argv[1]=='photos':
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
        fs=[ex.submit(run,n,'gpt_image_2',p,['--aspect_ratio','16:9','--resolution','2k','--quality','high']) for n,p in photos.items()]
        for f in concurrent.futures.as_completed(fs): print(f.result(),flush=True)
elif len(sys.argv)>1 and sys.argv[1]=='video':
    p='Premium architectural brand introduction film, precision construction geometry. One continuous slow elegant camera dolly across real brushed steel framing, glass panes and cast concrete planes arranged in a minimalist architectural studio. Controlled deep forest #0D3D06 and emerald green reflections, mint light as subtle physical architectural lighting. Pale mineral surfaces, photoreal materials, expensive restrained commercial cinematography, quiet daylight. End on a front-facing open pale mineral wall with dark green architectural framing and generous center space for an original logo to be composited later. No text, no logos, no particles, no explosions, no gaming, no cyberpunk, no neon glow, no chaotic cuts. No audio.'
    print(run('intro-source','seedance_2_0',p,['--duration','15','--resolution','1080p','--aspect_ratio','16:9','--generate_audio','false']),flush=True)
