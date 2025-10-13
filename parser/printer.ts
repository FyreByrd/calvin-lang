import { error, tree } from './logging.js';
import { type Decl, type Expr, type Stmt, type Value } from './parser.js';

export class CalvinPrinter {
  file(statements: Stmt[]) {
    tree('(', 0);
    this.statement_list(statements, 2);
    tree(')', 0);
  }

  statement_list(statements: Stmt[], indent: number) {
    for (const stmt of statements) {
      this.statement(stmt, indent);
    }
  }

  statement(stmt: Stmt, indent: number) {
    switch (stmt.type) {
      case 'decl':
        this.declaration(stmt, indent);
        break;
      case 'body':
        tree('{', indent);
        this.statement_list(stmt.body, indent + 2);
        tree('}', indent);
        break;
      case 'expr':
        this.expression(stmt, indent);
        break;
      case 'empty':
        break;
      case 'if':
        tree('if (', indent);
        if (stmt.pred.type === 'decl') {
          this.declaration(stmt.pred, indent + 2);
        } else {
          this.expression(stmt.pred, indent + 2);
        }
        tree(') {', indent);
        this.statement_list(stmt.body, indent + 2);
        tree('}', indent);
        for (const elif of stmt.alts) {
          tree('elif (', indent);
          if (elif.pred.type === 'decl') {
            this.declaration(elif.pred, indent + 2);
          } else {
            this.expression(elif.pred, indent + 2);
          }
          tree(') {', indent);
          this.statement_list(elif.body, indent + 2);
          tree('}', indent);
        }
        if (stmt.else) {
          tree('else {', indent);
          this.statement_list(stmt.else, indent + 2);
          tree('}', indent);
        }
        break;
      case 'while':
        if (stmt.do) {
          tree('do {', indent);
          this.statement_list(stmt.do, indent + 2);
          tree('} while (', indent);
        } else {
          tree('while (', indent);
        }
        this.expression(stmt.pred, indent + 2);
        tree(') {', indent);
        this.statement_list(stmt.while, indent + 2);
        if (stmt.finally) {
          tree('} finally {', indent);
          this.statement_list(stmt.finally, indent + 2);
          tree('}', indent);
        } else {
          tree('}', indent);
        }
        break;
      case 'control':
        if (stmt.expr) {
          tree(`${stmt.tok.image} (`, indent);
          this.expression(stmt.expr, indent + 2);
          tree(')', indent);
        } else {
          tree(stmt.tok.image, indent);
        }
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
