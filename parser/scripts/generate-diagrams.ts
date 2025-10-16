import { createSyntaxDiagramsCode } from 'chevrotain';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { parser } from '../parser.js';

const diagrams = createSyntaxDiagramsCode(parser.getSerializedGastProductions());
const path = join(import.meta.dirname, '../../docs/syntax-diagrams.html');
writeFileSync(path, diagrams);
console.log(`Wrote output to ${path}`);
