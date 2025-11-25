import * as TestSubject from '@encode/parser/lib';
import { v } from '@encode/parser/lib';
import { assertEquals } from '@std/assert';
import { performParsingTestCase, useGlobalSettings } from '@/test/utils/mod.ts';
import type { FileCstNode, StatementCstNode } from '../../generated/cst-types.ts';

Deno.test('Control flow parsing #integration', async (t) => {
  using _globalSettings = useGlobalSettings({ debugTrees: true });

  const parser = new TestSubject.EncodeParser();

  const precedenceHandler = new TestSubject.PrecedenceHandler();

  const printer = new TestSubject.JSONPrinter(false, null, 0);

  const typeAnalyzer = new TestSubject.TypeAnalyzer();

  await t.step('simple if statement', () => {
    const { parserOutput, typeOutput } = performParsingTestCase({
      code: ['let a = 0;', 'if (a > 1) {', '', '}', ''].join('\n'),

      parser,
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    v.file(parserOutput as FileCstNode, [
      ['declaration', ['a', v.none, [['constant', ['INT', '0']]]]],
      [
        'if',
        [['expression', [['id', 'a'], v.none, '>', [['constant', ['INT', '1']]]], v.none]],
        v.none,
      ],
    ]);

    assertEquals(typeOutput.warnings, 0, 'TypeAnalyzer should not report any warnings');
    assertEquals(typeOutput.errors, 0, 'TypeAnalyzer should not report any errors');
  });

  await t.step('incorrect variable access', () => {
    const { parserOutput, typeOutput } = performParsingTestCase({
      code: [
        'let a = 0;',
        'if (1) {',
        '    let b = 20; // should not be accessible to else block',
        '}',
        'elif (let b = 10) {',
        '    a = b;',
        '    let a = 25; // should warn',
        '}',
        'else {',
        '    b = 2; // should error',
        '}',
      ].join('\n'),

      parser,
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    v.file(parserOutput as FileCstNode, [
      ['declaration', ['a', v.none, [['constant', ['INT', '0']]]]],
      ['if', v.skip, [['expression', [['id', 'b'], v.none, '=', [['constant', ['INT', '2']]]]]]],
    ]);

    assertEquals(typeOutput.warnings, 1, 'TypeAnalyzer should report a warning');
    assertEquals(typeOutput.errors, 1, 'TypeAnalyzer should report an error');
  });

  await t.step('simple do-while loop', () => {
    const { parserOutput, typeOutput } = performParsingTestCase({
      code: ['do {}', 'while (a < 3); // maybe the ; should be replaced by an empty body???'].join(
        '\n',
      ),

      parser,
      startAt: 'statement',
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    v.statement(parserOutput as StatementCstNode, [
      'while',
      [],
      [['id', 'a'], v.none, '<', [['constant', ['INT', '3']]]],
      v.none,
      v.none,
    ]);

    assertEquals(typeOutput.warnings, 0, 'TypeAnalyzer should not report any warnings');
    assertEquals(typeOutput.errors, 1, 'TypeAnalyzer should report an error');
  });

  await t.step('incorrect variable access in while-finally block', () => {
    const { parserOutput, typeOutput } = performParsingTestCase({
      code: [
        'while (b > 4) {',
        '    let c = 1;',
        '    if (a) {',
        '        continue;',
        '    }',
        '} finally {',
        '    return 1 + 2 + c;',
        '}',
      ].join('\n'),

      parser,
      startAt: 'statement',
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    v.statement(parserOutput as StatementCstNode, [
      'while',
      v.none,
      [['id', 'b'], v.none, '>', [['constant', ['INT', '4']]]],
      [
        ['declaration', ['c', v.none, [['constant', ['INT', '1']]]]],
        ['if', [['expression', [['id', 'a']], [['continue']]]], v.none],
      ],
      [
        [
          'return',
          [
            ['nested', [['constant', ['INT', '1']], v.none, '+', [['constant', ['INT', '2']]]]],
            v.none,
            '+',
            [['id', 'c']],
          ],
        ],
      ],
    ]);

    assertEquals(typeOutput.warnings, 0, 'TypeAnalyzer should not report any warnings');
    assertEquals(typeOutput.errors, 3, 'TypeAnalyzer should report 3 errors');
  });
});
