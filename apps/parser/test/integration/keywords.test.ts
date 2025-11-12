import * as TestSubject from '@encode/parser/lib';
import { assert } from '@std/assert';
import { performParsingTestCase, useGlobalSettings } from '@/test/utils/mod.ts';

Deno.test('Keyword parsing #integration', async (t) => {
  using _globalSettings = useGlobalSettings({ debugTrees: true });

  const parser = new TestSubject.EncodeParser();

  const precedenceHandler = new TestSubject.PrecedenceHandler();

  const printer = new TestSubject.CalvinPrinter();

  const typeAnalyzer = new TestSubject.CalvinTypeAnalyzer();

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

    assert(parserOutput.statement, 'Parser should generate statements');
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

      assert(parserOutput.statement, 'Parser should generate statements');
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

      assert(parserOutput.statement, 'Parser should generate statements');
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

      assert(parserOutput.statement, 'Parser should generate statements');
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

      assert(parserOutput.statement, 'Parser should generate statements');
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

      assert(parserOutput.statement, 'Parser should generate statements');
    });
  });
});
