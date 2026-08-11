from pathlib import Path
import shutil
import re
import unicodedata

src = Path(r"c:\Users\GC1\Desktop\LPS\os-gigantes\assets\images\produtos-drive")
dst = Path(r"c:\Users\GC1\Desktop\LPS\os-gigantes\assets\images\produtos")
dst.mkdir(parents=True, exist_ok=True)

def slug(name: str) -> str:
    n = unicodedata.normalize("NFKD", name)
    n = "".join(c for c in n if not unicodedata.combining(c))
    stem = Path(n).stem
    while Path(stem).suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
        stem = Path(stem).stem
    stem = stem.lower()
    stem = re.sub(r"[^a-z0-9]+", "-", stem).strip("-")
    ext = Path(n).suffix.lower()
    if ext == ".jpeg":
        ext = ".jpg"
    if stem.endswith("-jpg"):
        stem = stem[:-4]
    return stem + (ext if ext else ".jpg")

prefer = {
    "makita": "makita-serra-marmore.jpg",
    "dancor": "dancor-bomba-ultra.jpg",
    "caixa-d-agua": "caixa-dagua.jpg",
    "ourolux": "ourolux-bulbo-9w.png",
    "fios": "corfio-fio-25mm.jpg",
    "lorenzetti-vaso": "lorenzetti-vaso.png",
    "argamassa": "quartzolit-ac1-20kg.jpg",
    "imperio": "imperio-massa-corrida.jpg",
    "fame-tomada": "fame-tomada-10a.jpg",
    "casalit": "casalit-telha.jpg",
    "whatsapp-image-2026-07-24": "viva-piso.jpg",
    "whatsapp-image-2026-07-23": "fame-interruptor.jpg",
}

for f in sorted(src.iterdir()):
    if not f.is_file():
        continue
    s = slug(f.name)
    out_name = s
    for key, val in prefer.items():
        if key in s:
            out_name = val
            break
    target = dst / out_name
    if target.exists() and target.stat().st_size != f.stat().st_size:
        target = dst / f"{target.stem}-alt{target.suffix}"
    shutil.copy2(f, target)
    print(f"{f.name} -> {target.name}")

print("--- DEST ---")
for p in sorted(dst.glob("*")):
    print(p.name, p.stat().st_size)
