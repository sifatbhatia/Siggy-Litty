import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { generateAllOutputs } from '../src/lib/generator';
import { defaultProfile } from '../src/data/defaults';
import { themes } from '../src/data/themes';
const rows = themes.flatMap(theme => generateAllOutputs(defaultProfile, theme).map(output => ({
  theme: theme.id,
  variant: output.id,
  html: output.html ?? null,
  text: output.text ?? null,
  sha256: createHash('sha256').update(output.html ?? output.text ?? '').digest('hex'),
})));
const path = new URL('../verification/original-exports.json', import.meta.url);
if (process.argv.includes('--verify')) {
  const original = JSON.parse(readFileSync(path, 'utf8'));
  if (JSON.stringify(rows) !== JSON.stringify(original)) throw new Error('Generated signature output changed during the UI redesign.');
  console.log(`PASS: ${rows.length} theme/variant exports are byte-for-byte unchanged.`);
} else {
  writeFileSync(path, JSON.stringify(rows, null, 2)+'\n');
  console.log(`Captured ${rows.length} real generated exports across ${themes.length} themes.`);
}
