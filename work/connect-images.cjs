const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = 'C:/Users/문지원/Documents/Codex/yp_portfolio';
const file = path.join(root, 'data/projects.json');
const before = JSON.parse(fs.readFileSync(file, 'utf8'));
const data = structuredClone(before);
const folders = {
  'koica-paraguay': 'koica-paraguay',
  'welfare-practicum': 'welfare-practicum',
  'research-data-analysis': 'research',
  thesis: 'thesis',
  'community-welfare': 'community-project',
  'medical-social-welfare': 'medicla-social-welfare'
};
for (const project of data.projects) {
  const folder = folders[project.id];
  if (!folder) continue;
  const relative = `assets/images/projects/${folder}`;
  const files = fs.readdirSync(path.join(root, relative), { withFileTypes: true })
    .filter(entry => entry.isFile() && /\.(jpe?g|png|webp|gif|avif)$/i.test(entry.name))
    .map(entry => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  const alt = /research|thesis/.test(project.id) ? `${project.title} 연구 자료` : `${project.title} 활동 사진`;
  project.images = files.map(name => ({ src: `${relative}/${name}`, alt }));
  console.log(`${project.id}: ${files.join(', ')}`);
}
assert.deepEqual(data.projects.map(({ images, ...rest }) => rest), before.projects.map(({ images, ...rest }) => rest));
assert.equal(data.projects.reduce((count, p) => count + p.images.length, 0), 22);
fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
