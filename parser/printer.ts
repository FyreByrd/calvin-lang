import { error, tree } from './logging.js';
import { type Decl, type Expr, type Stmt, type Value } from './parser.js';

export class CalvinPrinter {
  file(statements: Stmt[]) {
    tree('(', 0);
    for (const stmt of statements) {
      this.statement(stmt, 2);
    }
    tree(')', 0);
  }

  statement(stmt: Stmt, indent: number) {
    switch (stmt.type) {
      case 'decl':
        this.declaration(stmt, indent);
        break;
      case 'body':
        tree('{', indent);
        for (const s2 of stmt.body) {
          this.statement(s2, indent + 2);
        }
        tree('}', indent);
        break;
      case 'expr':
        this.expression(stmt, indent);
        break;
      case 'empty':
        break;
      default:
        error(`Unhandled debug stmt ${stmt}`);
        break;
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
      default:
        error(`Unhandled debug value ${val}`);
        break;
    }
  }
}
