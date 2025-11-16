import * as TestSubject from '@encode/parser/lib';
import { assert, assertEquals, assertGreater } from '@std/assert';
import { performParsingTestCase, useGlobalSettings } from '@/test/utils/mod.ts';

Deno.test('Control flow parsing #integration', async (t) => {
  using _globalSettings = useGlobalSettings({ debugTrees: true });

  const parser = new TestSubject.EncodeParser();

  const precedenceHandler = new TestSubject.PrecedenceHandler();

  const printer = new TestSubject.JSONPrinter(false, null, 0);

  const typeAnalyzer = new TestSubject.TypeAnalyzer();

  await t.step('simple if statement', () => {
    const { parserOutput, typeOutput, afterReorder } = performParsingTestCase({
      code: ['let a = 0;', 'if (a > 1) {', '', '}', ''].join('\n'),

      parser,
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    assert(parserOutput.statement);
    assertGreater(parserOutput.statement.length, 0, 'Statements should be generated');

    assertEquals(JSON.parse(afterReorder), {
      file: {
        statements: [
          {
            type: 'declaration',
            declaration: {
              image: 'a',
              expression: {
                value: {
                  constant: '0',
                },
              },
            },
          },
          {
            type: 'if',
            expression: {
              op: '>',
              value: {
                id: 'a',
              },
              expression: {
                value: {
                  constant: '1',
                },
              },
            },
            body: {},
          },
        ],
      },
    });

    assertEquals(typeOutput.warnings, 0, 'TypeAnalyzer should not report any warnings');
    assertEquals(typeOutput.errors, 0, 'TypeAnalyzer should not report any errors');
  });

  await t.step('incorrect variable access', () => {
    const { parserOutput, typeOutput, afterReorder } = performParsingTestCase({
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

    assert(parserOutput.statement);
    assertGreater(parserOutput.statement.length, 0, 'Statements should be generated');

    assertEquals(JSON.parse(afterReorder), {
      file: {
        statements: [
          {
            type: 'declaration',
            declaration: {
              image: 'a',
              expression: {
                value: {
                  constant: '0',
                },
              },
            },
          },
          {
            type: 'if',
            expression: {
              value: {
                constant: '1',
              },
            },
            body: {
              statements: [
                {
                  type: 'declaration',
                  declaration: {
                    image: 'b',
                    expression: {
                      value: {
                        constant: '20',
                      },
                    },
                  },
                },
              ],
            },
            elif: [
              {
                declaration: {
                  image: 'b',
                  expression: {
                    value: {
                      constant: '10',
                    },
                  },
                },
                body: {
                  statements: [
                    {
                      type: 'expression',
                      expression: {
                        op: '=',
                        value: {
                          id: 'a',
                        },
                        expression: {
                          value: {
                            id: 'b',
                          },
                        },
                      },
                    },
                    {
                      type: 'declaration',
                      declaration: {
                        image: 'a',
                        expression: {
                          value: {
                            constant: '25',
                          },
                        },
                      },
                    },
                  ],
                },
              },
            ],
            else: {
              body: {
                statements: [
                  {
                    type: 'expression',
                    expression: {
                      op: '=',
                      value: {
                        id: 'b',
                      },
                      expression: {
                        value: {
                          constant: '2',
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    });

    assertEquals(typeOutput.warnings, 1, 'TypeAnalyzer should report a warning');
    assertEquals(typeOutput.errors, 1, 'TypeAnalyzer should report an error');
  });

  await t.step('simple do-while loop', () => {
    const { parserOutput, typeOutput, afterReorder } = performParsingTestCase({
      code: ['do {}', 'while (a < 3); // maybe the ; should be replaced by an empty body???'].join(
        '\n',
      ),

      parser,
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    assert(parserOutput.statement);
    assertGreater(parserOutput.statement.length, 0, 'Statements should be generated');

    assertEquals(JSON.parse(afterReorder), {
      file: {
        statements: [
          {
            type: 'while',
            do: {
              body: {},
            },
            expression: {
              op: '<',
              value: {
                id: 'a',
              },
              expression: {
                value: {
                  constant: '3',
                },
              },
            },
            body: {},
          },
        ],
      },
    });

    assertEquals(typeOutput.warnings, 0, 'TypeAnalyzer should not report any warnings');
    assertEquals(typeOutput.errors, 1, 'TypeAnalyzer should report an error');
  });

  await t.step('incorrect variable access in while-finally block', () => {
    const { parserOutput, typeOutput, afterReorder } = performParsingTestCase({
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
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    assert(parserOutput.statement);
    assertGreater(parserOutput.statement.length, 0, 'Statements should be generated');

    assertEquals(JSON.parse(afterReorder), {
      file: {
        statements: [
          {
            type: 'while',
            expression: {
              op: '>',
              value: {
                id: 'b',
              },
              expression: {
                value: {
                  constant: '4',
                },
              },
            },
            body: {
              statements: [
                {
                  type: 'declaration',
                  declaration: {
                    image: 'c',
                    expression: {
                      value: {
                        constant: '1',
                      },
                    },
                  },
                },
                {
                  type: 'if',
                  expression: {
                    value: {
                      id: 'a',
                    },
                  },
                  body: {
                    statements: [
                      {
                        type: 'continue',
                      },
                    ],
                  },
                },
              ],
            },
            finally: {
              body: {
                statements: [
                  {
                    type: 'return',
                    expression: {
                      op: '+',
                      value: {
                        nested: {
                          expression: {
                            op: '+',
                            value: {
                              constant: '1',
                            },
                            expression: {
                              value: {
                                constant: '2',
                              },
                            },
                          },
                        },
                      },
                      expression: {
                        value: {
                          id: 'c',
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    });

    assertEquals(typeOutput.warnings, 0, 'TypeAnalyzer should not report any warnings');
    assertEquals(typeOutput.errors, 3, 'TypeAnalyzer should report 3 errors');
  });
});
