import * as TestSubject from '@encode/parser/lib';
import { v } from '@encode/parser/lib';
import { assert, assertEquals } from '@std/assert';
import { performParsingTestCase, useGlobalSettings } from '@/test/utils/mod.ts';

Deno.test('Expression parsing #integration', async (t) => {
  using _globalSettings = useGlobalSettings({ debugTrees: true });

  const parser = new TestSubject.EncodeParser();

  const precedenceHandler = new TestSubject.PrecedenceHandler();

  const printer = new TestSubject.ParenPrinter();

  const typeAnalyzer = new TestSubject.TypeAnalyzer();

  await t.step('simple expression', () => {
    const { parserOutput, precOutput } = performParsingTestCase({
      code: 'let a = 1 * 2 + 3;',

      parser,
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assert(parser.errors.length === 0, 'Parser should not error');

    v.file(parserOutput, [
      [
        'declaration',
        [
          'a',
          v.none,
          [
            ['nested', [['constant', ['INT', '1']], v.none, '*', [['constant', ['INT', '2']]]]],
            v.none,
            '+',
            [['constant', ['INT', '3']]],
          ],
        ],
      ],
    ]);

    assertEquals(precOutput, 1, 'Expression should be reordered');
  });
});
