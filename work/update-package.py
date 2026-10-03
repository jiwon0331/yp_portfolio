from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json
import os

root = Path('C:/Users/문지원/Documents/Codex/yp_portfolio')
archive = root / 'outputs/portfolio-github-pages.zip'
staged = Path(__file__).parent / 'portfolio-github-pages.updated.zip'
names = ['index.html', 'css/style.css', 'css/responsive.css', 'js/projects.js', 'data/projects.json', 'README.md']
data = json.loads((root / 'data/projects.json').read_text(encoding='utf-8'))
names += [image['src'] for project in data['projects'] for image in project['images']]
replacement = {name: (root / name).read_bytes() for name in names}
with ZipFile(archive) as existing, ZipFile(staged, 'w', compression=ZIP_DEFLATED) as updated:
    for entry in existing.infolist():
        updated.writestr(entry, replacement.pop(entry.filename, existing.read(entry.filename)))
    for name, payload in replacement.items():
        updated.writestr(name, payload)
with ZipFile(staged) as result:
    assert result.testzip() is None
    for name in names:
        assert result.read(name) == (root / name).read_bytes(), name
os.replace(staged, archive)
print('Existing deployment ZIP updated; all 22 images and changed sources verified.')
