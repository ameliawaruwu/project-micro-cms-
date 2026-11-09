// Membuat daftar kelas Tailwind TANPA awalan breakpoint (sm:/md:/lg:/xl:/2xl:) dari komponen tema.
//
// Editor Layout mensimulasikan preview Desktop/Tablet/Ponsel dengan mengubah `md:col-span-4`
// menjadi `col-span-4` (lihat src/utils/responsivePreview.ts). Tailwind hanya membuat CSS untuk
// kelas yang tertulis di kode, jadi versi tanpa awalan harus didaftarkan di sini agar CSS-nya ada.
// Dijalankan otomatis oleh `npm run dev` dan `npm run build`.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOTS = ['src/themes', 'src/components'];
const OUT = 'src/utils/responsiveSafelist.generated.ts';
const CLASS_RE = /(?:^|[\s"'`{])((?:sm|md|lg|xl|2xl):)+([!a-z0-9\-\[\]#.%/():_,]+)/gi;

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (['.ts', '.tsx'].includes(extname(p)) && !p.endsWith('.generated.ts')) files.push(p);
  }
  return files;
}

const classes = new Set();
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const src = readFileSync(file, 'utf8');
    for (const m of src.matchAll(CLASS_RE)) {
      const bare = m[2].replace(/[),]+$/, '');
      if (bare && /[a-z]/i.test(bare) && !bare.includes('${')) classes.add(bare);
    }
  }
}

const sorted = [...classes].sort();
const body =
  '// FILE OTOMATIS — dibuat oleh scripts/gen-responsive-safelist.mjs, jangan diedit manual.\n' +
  '// Memastikan Tailwind membuat CSS untuk versi tanpa awalan breakpoint dari kelas komponen tema\n' +
  '// (dipakai simulasi preview device di Editor Layout).\n' +
  'export const RESPONSIVE_SAFELIST = `\n' +
  sorted.join('\n') +
  '\n`;\n';
writeFileSync(OUT, body, 'utf8');
console.log(`[responsive-safelist] ${sorted.length} kelas ditulis ke ${OUT}`);
