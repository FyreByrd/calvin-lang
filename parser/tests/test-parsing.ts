import type { ILexingResult } from 'chevrotain';
import type { FileCstChildren } from '../cst-types.js';
import { Globals } from '../globals.js';
import { CalvinLexer } from '../lexer.js';
import type { CalvinParser } from '../parser.js';
import type { PrecedenceHandler } from '../visitors/precedence.js';
import type { CalvinPrinter } from '../visitors/printer.js';
import type { CalvinTypeAnalyzer } from '../visitors/semantics.js';

export interface TestCaseParameters {
  /**
   * The parser to use for parsing Calvin code.
   *
   * **Note:** We choose not to instantiate this ourselves in case we want to inject something else, e.g. a shim or an experimental impl
   */
  parser: CalvinParser;
  /**
   * The parser to use for parsing Calvin code.
   *
   * **Note:** We choose not to instantiate this ourselves in case we want to inject something else, e.g. a shim or an experimental impl
   */
  precHandler: PrecedenceHandler;
  /**
   * The printer to use when debugging.
   *
   * **Note:** We choose not to instantiate this ourselves in case we want to inject something else, e.g. a shim or an experimental impl
   */
  printer: CalvinPrinter;
  /**
   * The type analyzer to use for type inference
   *
   * **Note:** We choose not to instantiate this ourselves in case we want to inject something else, e.g. a shim or an experimental impl
   */
  typeAnalyzer: CalvinTypeAnalyzer;
  /**
   * The Calvin code to parse
   */
  code: string;
}

export interface TestCaseOutputs {
  lexingResult: ILexingResult;
  parserOutput: FileCstChildren;
  precOutput: number;
  typeOutput: {
    errors: number;
    warnings: number;
  };
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
  const { code, parser, printer, typeAnalyzer, precHandler } = params;

  const lexingResult = CalvinLexer.tokenize(code);
  parser.input = lexingResult.tokens;
  const parserOutput = parser.file();

  precHandler.reset();
  precHandler.visit(parserOutput);

  // If this doesn't respect global debugAll option, we should wrap this
  // in a `Globals.debugAll` check
  printer.visit(parserOutput);

  typeAnalyzer.reset();
  typeAnalyzer.visit(parserOutput);
  typeAnalyzer.scope.print();

  const testCaseOutputs: TestCaseOutputs = {
    lexingResult,
    parserOutput: parserOutput.children,
    precOutput: precHandler.reordered,
    typeOutput: {
      errors: typeAnalyzer.errors,
      warnings: typeAnalyzer.warnings
    }
  };

  if (Globals.debugAll) {
    console.dir(testCaseOutputs, { depth: null });
  }

  return testCaseOutputs;
}
