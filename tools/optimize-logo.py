"""Create small transparent derivatives; keep the supplied master untouched."""
from pathlib import Path
from PIL import Image

assets = Path(__file__).resolve().parents[1] / 'app' / 'public' / 'assets'
with Image.open(assets / 'logo-clean.png') as master:
    for size in (144, 720):
        image = master.convert('RGBA')
        image.thumbnail((size, size), Image.Resampling.LANCZOS)
        image.save(assets / f'logo-{size}.webp', quality=90, method=6)
        print(f'logo-{size}.webp: {(assets / f"logo-{size}.webp").stat().st_size} bytes')
