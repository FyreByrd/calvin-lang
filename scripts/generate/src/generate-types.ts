import { bold, green } from '@std/fmt/colors';
import { generateCstDts } from 'chevrotain';
import { type GenerationParams, writeTextFileAtPath } from './core.ts';

export async function generateTypes({
  outputPath,
  parser,
  signal,
}: GenerationParams): Promise<void> {
  const typeDeclarations = generateCstDts(parser.getGAstProductions());

  await writeTextFileAtPath({
    outputPath,
    data: typeDeclarations,
    textFileOptions: { signal },
  });

  const matchRegex = /export (type|interface)/gi;

  const symbolCount = typeDeclarations.match(matchRegex)?.length ?? 0;

  const formattedSymbolCount = pluralizeSymbolCount(symbolCount);

  const successMsg = [
    bold(green('Success!')),
    `Generated ${bold(formattedSymbolCount)} and wrote them to ${outputPath}`,
  ].join('\n');

  console.info(successMsg);
}

function pluralizeSymbolCount(symbolCount: number): string {
  const plural = new Intl.PluralRules(undefined, {
    type: 'cardinal',
  });

  const plurals: Record<Intl.LDMLPluralRule, string> = {
    zero: 'symbols',
    one: 'symbol',
    two: 'symbols',

    few: 'symbols',
    many: 'symbols',

    other: 'symbols',
  };

  return `${symbolCount} ${plurals[plural.select(symbolCount)]}`;
}
