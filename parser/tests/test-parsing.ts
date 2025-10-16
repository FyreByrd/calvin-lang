import type { ILexingResult } from 'chevrotain';
import type { FileCstChildren, FileCstNode } from '../cst-types.js';
import { Globals } from '../globals.js';
import { CalvinLexer } from '../lexer.js';
import type { CalvinParser } from '../parser.js';
import type { CalvinPrinter } from '../printer.js';

export interface TestCaseParameters {
  /**
   * The parser to use for parsing Calvin code.
   *
   * **Note:** We choose not to instantiate this ourselves in case we want to inject something else, e.g. a shim or an experimental impl
   */
  parser: CalvinParser;
  /**
   * The printer to use when debugging.
   *
   * **Note:** We choose not to instantiate this ourselves in case we want to inject something else, e.g. a shim or an experimental impl
   */
  printer: CalvinPrinter;
  /**
   * The Calvin code to parse
   */
  code: string;
}

export interface TestCaseOutputs {
  lexingResult: ILexingResult;
  parserOutput: FileCstChildren;
}

/**
 * Executes a standard procedure to parse Calvin code.
 *
 * **Caveats:**
 *
 * 1. This function respects the {@linkcode Globals.debugAll} option when choosing to log debug info.
 *
 * @param params the test case's parameters, used to configure the procedure
 * @returns the results of executing the test procedure to be examined by assertions
 */
export function testParsing(params: TestCaseParameters): TestCaseOutputs {
  const { code, parser, printer } = params;

  const lexingResult = CalvinLexer.tokenize(code);
  parser.input = lexingResult.tokens;
  const parserOutput = parser.file() as FileCstNode;

  // If this doesn't respect global debugAll option, we should wrap this
  // in a `Globals.debugAll` check
  printer.visit(parserOutput);
  //parser.scope.print();

  const testCaseOutputs: TestCaseOutputs = {
    lexingResult,
    parserOutput: parserOutput.children
  };

  if (Globals.debugAll) {
    console.dir(testCaseOutputs, { depth: null });
  }

  return testCaseOutputs;
}
