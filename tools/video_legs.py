from generate_media import run
import concurrent.futures
prompts={
 'intro-leg2':'Premium architecture film, one continuous elegant lateral camera dolly inside a minimalist contemporary building, refined glass partitions and stainless steel construction geometry, mineral white walls, dark emerald green architectural joinery and subtle natural green reflected light. Photoreal precise material details, slow expensive commercial cinematography. No text, no logo, no particles, no cyberpunk, no gaming, no people.',
 'intro-leg3':'Premium cinematic architecture film. Slow camera pullback from macro real brushed metal and cast concrete joints into a symmetrical elegant architectural interior, pale mineral surfaces, glass panels, forest green accent illumination. End looking straight at a pale wall, clear centered composition. Realistic high end construction and materials, calm precise camera. No text, no logos, no neon, no gaming, no particles.'}
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex:
 for r in ex.map(lambda item:run(item[0],'seedance_2_0',item[1],['--duration','12','--resolution','1080p','--aspect_ratio','16:9','--generate_audio','false']),prompts.items()):print(r,flush=True)
