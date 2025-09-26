import type { CstNode, IToken } from 'chevrotain';
import { readFileSync } from 'fs';
import { join } from 'path';
import { CalvinLexer, CalvinParser } from './parser.js';

const parser = new CalvinParser();

// ----------------- Printer -----------------
// Obtains the default CstVisitor constructor to extend.
const BaseCstVisitor = parser.getBaseCstVisitorConstructor();

// All our semantics go into the visitor, completely separated from the grammar.
class CalvinPrinter extends BaseCstVisitor {
  constructor() {
    super();
    // This helper will detect any missing or redundant methods on this visitor
    this.validateVisitor();
  }

  file(ctx: { expression: CstNode[] }) {
    for (const expr of ctx.expression) {
      this.visit(expr);
    }
  }

  expression(ctx: { ID: IToken[]; value: CstNode[] }) {
    console.log(`${ctx.ID[0]!.image} = `);
    this.visit(ctx.value);
    console.log(';');
  }

  value(ctx: { ID: IToken[]; NUMBER: IToken[] }) {
    if (ctx.ID) {
      console.log(ctx.ID[0]!.image);
    } else if (ctx.NUMBER) {
      console.log(ctx.NUMBER[0]!.image);
    } else {
      console.log('$UNKNOWN_VALUE');
    }
  }
}

const printer = new CalvinPrinter();

function parseInput(text: string) {
  const lexingResult = CalvinLexer.tokenize(text);
  // "input" is a setter which will reset the parser's state.
  parser.input = lexingResult.tokens;
  const output = parser.file();

  if (parser.errors.length > 0) {
    for (const err of parser.errors) {
      console.log(err);
    }
    throw Error();
  }

  //console.log(JSON.stringify(output, null, 4));
  printer.visit(output);
}

const file = readFileSync(join(import.meta.dirname, './tests/test.txt'));
parseInput(String(file));
