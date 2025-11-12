import {
  type BasePrinter,
  CalvinLexer,
  type CalvinParser,
  type CalvinTypeAnalyzer,
  debug,
  Globals,
  type PrecedenceHandler,
} from '@encode/parser/lib';
import type { ILexingResult } from 'chevrotain';
import type { FileCstChildren } from '@/generated/cst-types.ts';

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
  precedenceHandler: PrecedenceHandler;
  /**
   * The printer to use when debugging.
   *
   * **Note:** We choose not to instantiate this ourselves in case we want to inject something else, e.g. a shim or an experimental impl
   */
  printer: BasePrinter;
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
  beforeReorder: string;
  afterReorder: string;
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
export function performParsingTestCase(params: TestCaseParameters): TestCaseOutputs {
  const { code, parser, printer, typeAnalyzer, precedenceHandler } = params;

  const lexingResult = CalvinLexer.tokenize(code);
  parser.input = lexingResult.tokens;
  const parserOutput = parser.file();

  // cache printer.output
  const printerOutput = printer.output;

  debug('Before reordering:');
  let beforeReorder = '';
  printer.setOutput((msg) => {
    beforeReorder = beforeReorder.concat(msg);
  });
  printer.visit(parserOutput);

  precedenceHandler.reset();
  precedenceHandler.visit(parserOutput);

  // If this doesn't respect global debugAll option, we should wrap this
  // in a `Globals.debugAll` check
  debug('After reordering:');
  let afterReorder = '';
  printer.setOutput((msg) => {
    afterReorder = afterReorder.concat(msg);
  });
  printer.visit(parserOutput);

  // restore printer.output
  printer.setOutput(printerOutput);

  typeAnalyzer.reset();
  typeAnalyzer.visit(parserOutput);
  typeAnalyzer.scope.print();

  const testCaseOutputs: TestCaseOutputs = {
    lexingResult,
    parserOutput: parserOutput.children,
    beforeReorder,
    afterReorder,
    precOutput: precedenceHandler.reordered,
    typeOutput: {
      errors: typeAnalyzer.errors,
      warnings: typeAnalyzer.warnings,
    },
  };

  if (Globals.debugAll) {
    //console.dir(testCaseOutputs, { depth: null });
  }

  return testCaseOutputs;
}

export interface GlobalSettings {
  debugAll?: boolean;
  debugScopes?: boolean;
  debugTrees?: boolean;
}

/**
 * Customize global settings, and they'll be reset at the end of this scope. You can temporarily
 * override these settings in a child scope, and they'll be restored to the settings of the parent
 * scope at the end of the child scope.
 * @param settings The {@linkcode Globals} settings to apply
 * @returns A {@linkcode Disposable} object that restores the original settings at the end of the scope
 */
export function useGlobalSettings({
  debugAll = false,
  debugScopes = false,
  debugTrees = false,
}: GlobalSettings = {}): Disposable {
  const originalGlobals = {
    debugAll: Globals.debugAll,
    debugScopes: Globals.debugScopes,
    debugTrees: Globals.debugTrees,
  };

  Globals.debugAll = debugAll;
  Globals.debugScopes = debugScopes;
  Globals.debugTrees = debugTrees;

  return {
    /**
     * Restoration function that runs at the end of the scope in which it's used
     */
    [Symbol.dispose]() {
      Globals.debugAll = originalGlobals.debugAll;
      Globals.debugScopes = originalGlobals.debugScopes;
      Globals.debugTrees = originalGlobals.debugTrees;
    },
  };
}
