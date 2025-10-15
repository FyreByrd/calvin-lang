import type { ILexingResult } from 'chevrotain';
import { CalvinLexer } from '../lexer.js';
import type { CalvinParser, Stmt } from '../parser.js';
import type { CalvinPrinter } from '../printer.js';

export interface TestCaseParameters {
  parser: CalvinParser;
  printer: CalvinPrinter;
  code: string;
}

export interface TestCaseOutputs {
  lexingResult: ILexingResult;
  parserOutput: Stmt[];
}

export function testParsing(params: TestCaseParameters): TestCaseOutputs {
  const { code, parser, printer } = params;

  const lexingResult = CalvinLexer.tokenize(code);
  parser.input = lexingResult.tokens;
  const parserOutput = parser.file();

  printer.file(parserOutput);
  parser.scope.print();

  return { lexingResult, parserOutput };
}
