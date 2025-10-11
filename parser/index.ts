import { readFileSync } from 'fs';
import { join } from 'path';
import { CalvinLexer } from './lexer.js';
import { CalvinParser, type Decl, type Expr, type Stmt, type Value } from './parser.js';

function prefix(str: string, len: number, ch: string = ' ') {
  let i = 0;
  let pre = '';
  while (i++ < len) {
    pre += ch;
  }
  return pre + str;
}

const parser = new CalvinParser();

// ----------------- Printer -----------------
class CalvinPrinter {
  file(statements: Stmt[]) {
    console.log('(');
    for (const stmt of statements) {
      this.statement(stmt, 2);
    }
    console.log(')');
  }

  statement(stmt: Stmt, indent: number) {
    if (stmt.type === 'decl') {
      this.declaration(stmt, indent);
    } else {
      this.expression(stmt, indent);
    }
  }

  declaration(decl: Decl, indent: number) {
    console.log(prefix(`let ${decl.id.image}${decl.expr ? ' = (' : ''}`, indent));
    if (decl.expr) {
      this.expression(decl.expr, indent + 2);
      console.log(prefix(')', indent));
    }
  }

  expression(expr: Expr, indent: number) {
    if (expr.operator) {
      console.log(prefix('(' + expr.operator.image + (expr.reversed ? '!' : ''), indent));
    } else {
      console.log(prefix('(', indent));
    }
    this.value(expr.value, indent + 2);
    if (expr.expr) {
      this.expression(expr.expr, indent + 2);
    }
    console.log(prefix(')', indent));
  }

  value(val: Value, indent: number) {
    switch (val.type) {
      case 'constant':
        console.log(prefix(val.const.image, indent));
        break;
      case 'expr':
        this.expression(val.expr, indent + 2);
        break;
      case 'id':
        console.log(prefix(val.id.image, indent));
        break;
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
  printer.file(output);
}

const file = readFileSync(join(import.meta.dirname, './tests/test.txt'));
parseInput(String(file));
