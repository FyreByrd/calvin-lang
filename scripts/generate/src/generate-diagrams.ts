import { bold, green } from '@std/fmt/colors';
import { createSyntaxDiagramsCode } from 'chevrotain';
import { type GenerationParams, writeTextFileAtPath } from './core.ts';

export async function generateDiagrams({
  outputPath,
  parser,
  signal,
}: GenerationParams): Promise<void> {
  const diagrams = createSyntaxDiagramsCode(parser.getSerializedGastProductions());

  await writeTextFileAtPath({
    outputPath,
    data: diagrams,
    textFileOptions: { signal },
  });

  const successMsg = [
    bold(green('Success!')),
    `Generated syntax diagrams and wrote them to ${outputPath}`,
  ].join('\n');

  console.info(successMsg);
}
