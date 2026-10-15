# Rehace fonts/*.woff2 a partir de las fuentes originales de Google Fonts (licencia OFL):
# solo los caracteres que usa la app y, en Archivo, sin el eje de anchura (se queda en 100: el que usa la app).
# Uso: pip install fonttools brotli && python3 scripts/build-fonts.py
import io, os, urllib.request
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC = 'https://raw.githubusercontent.com/google/fonts/main/ofl/'
# ASCII, español y los signos que se ven en pantalla (× ÷ − de KenKen, flechas de Progreso, °…)
TEXT = ''.join(map(chr, range(0x20, 0x7f))) + '¡¿ÁÉÍÑÓÚÜáéíñóúü·×÷−–—‘’“”…°≥↑↓→'
FEATURES = ['kern', 'liga', 'ccmp', 'locl', 'mark', 'mkmk', 'tnum', 'lnum', 'case']

def build(url, out, axes=None):
    font = TTFont(io.BytesIO(urllib.request.urlopen(SRC + url).read()))
    if axes: font = instancer.instantiateVariableFont(font, axes)
    opts = subset.Options()
    opts.layout_features = FEATURES
    opts.flavor = 'woff2'
    opts.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14]   # conserva copyright y licencia
    sub = subset.Subsetter(opts)
    sub.populate(text=TEXT)
    sub.subset(font)
    path = os.path.join(ROOT, 'fonts', out)
    subset.save_font(font, path, opts)
    print(f'{out}: {os.path.getsize(path) // 1024} KB')

build('archivo/Archivo%5Bwdth,wght%5D.ttf', 'archivo.woff2', {'wdth': 100})
build('archivoblack/ArchivoBlack-Regular.ttf', 'archivo-black.woff2')
