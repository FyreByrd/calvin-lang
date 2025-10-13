import { readFileSync } from 'fs';
import { join } from 'path';
import { CalvinLexer } from './lexer.js';
import { CalvinParser, type Decl, type Expr, type Stmt, type Value } from './parser.js';
import { error, tree } from './printers.js';

const parser = new CalvinParser();

// ----------------- Printer -----------------
class CalvinPrinter {
  file(statements: Stmt[]) {
    tree('(', 0);
    for (const stmt of statements) {
      this.statement(stmt, 2);
    }
    tree(')', 0);
  }

  statement(stmt: Stmt, indent: number) {
    if (stmt.type === 'decl') {
      this.declaration(stmt, indent);
    } else if (stmt.type === 'body') {
      tree('{', indent);
      for (const s2 of stmt.body) {
        this.statement(s2, indent + 2);
      }
      tree('}', indent);
    } else {
      this.expression(stmt, indent);
    }
  }

  declaration(decl: Decl, indent: number) {
    tree(`let ${decl.id.image}${decl.expr ? ' = (' : ''}`, indent);
    if (decl.expr) {
      this.expression(decl.expr, indent + 2);
      tree(')', indent);
    }
  }

  expression(expr: Expr, indent: number) {
    if (expr.operator) {
      tree('(' + expr.operator.image + (expr.reversed ? '!' : ''), indent);
    } else {
      tree('(', indent);
    }
    this.value(expr.value, indent + 2);
    if (expr.expr) {
      this.expression(expr.expr, indent + 2);
    }
    tree(')', indent);
  }

  value(val: Value, indent: number) {
    switch (val.type) {
      case 'constant':
        tree(val.const.image, indent);
        break;
      case 'expr':
        this.expression(val, indent + 2);
        break;
      case 'id':
        tree(val.id.image, indent);
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
      error(err.message);
    }
    throw Error();
  }

  printer.file(output);
  parser.scope.print();
}

const file = readFileSync(join(import.meta.dirname, './tests/test.txt'));
parseInput(String(file));
