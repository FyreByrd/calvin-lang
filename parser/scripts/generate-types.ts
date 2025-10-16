import { generateCstDts } from 'chevrotain';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { parser } from '../parser.js';

const types = generateCstDts(parser.getGAstProductions());
const path = join(import.meta.dirname, '../cst-types.ts');
writeFileSync(path, types);
console.log(
  `Generated ${types.match(/export (type|interface)/gi)?.length ?? 0} types and wrote them to ${path}`
);
