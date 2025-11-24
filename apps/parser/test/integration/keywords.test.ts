import * as TestSubject from '@encode/parser/lib';
import { v } from '@encode/parser/lib';
import { assert } from '@std/assert';
import { performParsingTestCase, useGlobalSettings } from '@/test/utils/mod.ts';

Deno.test('Keyword parsing #integration', async (t) => {
  using _globalSettings = useGlobalSettings({ debugTrees: true });

  const parser = new TestSubject.EncodeParser();

  const precedenceHandler = new TestSubject.PrecedenceHandler();

  const printer = new TestSubject.ParenPrinter();

  const typeAnalyzer = new TestSubject.TypeAnalyzer();

  await t.step('if-elif-else block and do-while-finally block keywords', () => {
    const { parserOutput } = performParsingTestCase({
      code: [
        'let lettuce = 1; // let',
        'if(lettuce) {',
        '    let spiffy = 2; // if',
        '}elif(lettuce) {',
        '    let elifShmelif = 3; // elif',
        '}else {',
        '    let elsevier = 4; // else',
        '}',
      ].join('\n'),

      parser,
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assert(parser.errors.length === 0, 'Parser should not error');

    v.file(parserOutput, [
      ['declaration', ['lettuce', v.none, [['constant', ['INT', '1']]]]],
      [
        'if',
        [
          [
            'expression',
            [['id', 'lettuce']],
            [['declaration', ['spiffy', v.none, [['constant', ['INT', '2']]]]]],
          ],
          [
            'expression',
            [['id', 'lettuce']],
            [['declaration', ['elifShmelif', v.none, [['constant', ['INT', '3']]]]]],
          ],
        ],
        [['declaration', ['elsevier', v.none, [['constant', ['INT', '4']]]]]],
      ],
    ]);
  });

  await t.step('false positive keyword snippets', async (t) => {
    await t.step('break', () => {
      const { parserOutput } = performParsingTestCase({
        code: 'let coffeebreak = 8; // break',

        parser,
        precedenceHandler,
        printer,
        typeAnalyzer,
      });

      assert(parser.errors.length === 0, 'Parser should not error');

      v.file(parserOutput, [
        ['declaration', ['coffeebreak', v.none, [['constant', ['INT', '8']]]]],
      ]);
    });

    await t.step('continue', () => {
      const { parserOutput } = performParsingTestCase({
        code: 'let dareIcontinue = 9; // continue',

        parser,
        precedenceHandler,
        printer,
        typeAnalyzer,
      });

      assert(parser.errors.length === 0, 'Parser should not error');

      v.file(parserOutput, [
        ['declaration', ['dareIcontinue', v.none, [['constant', ['INT', '9']]]]],
      ]);
    });

    await t.step('return', () => {
      const { parserOutput } = performParsingTestCase({
        code: ['let returnOfTheJedi = 10; // return', 'return OfTheJedi;'].join('\n'),

        parser,
        precedenceHandler,
        printer,
        typeAnalyzer,
      });

      assert(parser.errors.length === 0, 'Parser should not error');

      v.file(parserOutput, [
        ['declaration', ['returnOfTheJedi', v.none, [['constant', ['INT', '10']]]]],
        ['return', [['id', 'OfTheJedi']]],
      ]);
    });

    await t.step('and, or, & not', () => {
      const { parserOutput } = performParsingTestCase({
        code: ['let andor = 11; // and, or', 'let notInNottingham = not andor; // not'].join('\n'),

        parser,
        precedenceHandler,
        printer,
        typeAnalyzer,
      });

      assert(parser.errors.length === 0, 'Parser should not error');

      v.file(parserOutput, [
        ['declaration', ['andor', v.none, [['constant', ['INT', '11']]]]],
        ['declaration', ['notInNottingham', v.none, [['prefix', 'not', ['id', 'andor']]]]],
      ]);
    });

    await t.step('in', () => {
      const { parserOutput } = performParsingTestCase({
        code: 'let spinach = 13; // in',

        parser,
        precedenceHandler,
        printer,
        typeAnalyzer,
      });

      assert(parser.errors.length === 0, 'Parser should not error');

      v.file(parserOutput, [['declaration', ['spinach', v.none, [['constant', ['INT', '13']]]]]]);
    });
  });
});
