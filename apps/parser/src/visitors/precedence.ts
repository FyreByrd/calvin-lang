import type { CstNode, TokenType } from 'chevrotain';
import type {
  BodyCstChildren,
  ConstantCstChildren,
  DeclarationCstChildren,
  ExpressionCstChildren,
  ExpressionCstNode,
  FileCstChildren,
  IfPredBodyCstChildren,
  StatementCstChildren,
  StatementCstNode,
  TypeCstChildren,
  ValueCstChildren,
  ValueCstNode
} from '@/generated/cst-types.ts';
import * as Tokens from '../lexer.ts';
import { BaseCstVisitor } from '../parser.ts';

enum Prec {
  // ltr
  Mult = 0, // * / %
  Add, // + -
  Shift, // << >> >>>
  Order, // < > <= >=
  Equal, // == !=
  BinXor, // ^
  BinAnd, // &
  BinOr, // |
  Coal, // ??
  // rtl
  Asgn // =, compound assignment
}

function tok2Prec(tok: TokenType) {
  switch (tok) {
    case Tokens.STAR:
    case Tokens.SLASH:
    case Tokens.MOD:
      return Prec.Mult;
    case Tokens.PLUS:
    case Tokens.MINUS:
      return Prec.Add;
    case Tokens.LSHIFT:
    case Tokens.RSHIFT:
    case Tokens.ASHIFT:
      return Prec.Shift;
    case Tokens.LT:
    case Tokens.GT:
    case Tokens.LE:
    case Tokens.GE:
      return Prec.Order;
    case Tokens.EE:
    case Tokens.NE:
      return Prec.Equal;
    case Tokens.CARET:
      return Prec.BinXor;
    case Tokens.AMP:
      return Prec.BinAnd;
    case Tokens.PIPE:
      return Prec.BinOr;
    case Tokens.N_COAL:
      return Prec.Coal;
    default:
      return Prec.Asgn;
  }
}

export class PrecedenceHandler extends BaseCstVisitor {
  private _reordered;
  public get reordered(): number {
    return this._reordered;
  }
  constructor() {
    super();
    this.validateVisitor();
    this._reordered = 0;
  }

  reset() {
    this._reordered = 0;
  }

  reorder(tree: ExpressionCstChildren): ExpressionCstChildren {
    // greater precedence number is higher in tree
    // tree.left is value, tree.right is sub-expression
    if (tree.BinOp && tree.expression) {
      const right = (tree.expression[0].children = this.reorder(tree.expression[0].children));
      if (right.BinOp) {
        if (tok2Prec(tree.BinOp[0].tokenType) <= tok2Prec(right.BinOp[0].tokenType)) {
          this._reordered++;
          // keep reference to old tree
          const old = { ...tree };
          // tree is now tree.right
          tree = { ...right };
          // old tree.right is now tree.right.left
          const left = tree.value[0];
          old.expression![0] = {
            ...left,
            children: { value: [{ ...left }] },
            name: 'expression'
          } satisfies ExpressionCstNode;
          // new tree.left is now old tree
          tree.value[0] = {
            children: { expression: [{ name: 'expression', children: old }] },
            name: 'value'
          } satisfies ValueCstNode;
        }
      }
    }
    return tree;
  }

  expression(expr: ExpressionCstNode) {
    expr.children = this.reorder(expr.children);
    this.value(expr.children.value[0].children);
  }

  value(val: ValueCstChildren) {
    if (val.expression) {
      // nested expression
      this.expression(val.expression[0]);
    } else if (!val.constant && !val.ID && val.value) {
      // Unop
      this.value(val.value[0].children);
    }
  }

  file(node: FileCstChildren) {
    if (node.statement) {
      this.statement_list(node.statement);
    }
  }

  statement_list(statements: StatementCstNode[]) {
    for (const stmt of statements) {
      this.statement(stmt.children);
    }
  }

  statement(stmt: StatementCstChildren) {
    if (stmt.declaration) {
      this.declaration(stmt.declaration[0].children);
    } else if (stmt.RETURN) {
      if (stmt.expression) {
        this.expression(stmt.expression[0]);
      }
    } else if (stmt.IF && stmt.ifPredBody) {
      let bodyCount = 0;
      this.ifPredBody(stmt.ifPredBody[bodyCount++].children);
      if (stmt.ELIF) {
        stmt.ELIF.forEach(() => {
          this.ifPredBody(stmt.ifPredBody![bodyCount++].children);
        });
      }
      if (stmt.ELSE && stmt.body) {
        this.body(stmt.body![0].children);
      }
    } else if (stmt.WHILE) {
      let bodyCount = 0;
      if (stmt.DO) {
        this.body(stmt.body![bodyCount++].children);
      }
      this.expression(stmt.expression![0]);
      if (!stmt.SEMI) {
        this.body(stmt.body![bodyCount++].children);
      }
      if (stmt.FINALLY) {
        this.body(stmt.body![bodyCount++].children);
      }
    } else if (stmt.body) {
      this.body(stmt.body[0].children);
    } else if (stmt.expression) {
      this.expression(stmt.expression[0]);
    }
  }

  ifPredBody(predBody: IfPredBodyCstChildren) {
    if (predBody.LET) {
      this.declaration(predBody.declaration![0].children);
    } else {
      this.expression(predBody.expression![0]);
    }
    this.body(predBody.body[0].children);
  }

  declaration(decl: DeclarationCstChildren) {
    if (decl.expression) {
      this.expression(decl.expression[0]);
    }
  }

  body(body: BodyCstChildren) {
    if (body.statement) {
      this.statement_list(body.statement);
    }
  }

  constant(c: ConstantCstChildren) {}

  type(t: TypeCstChildren) {}

  visit(node: CstNode) {
    switch (node.name) {
      case 'file':
        this.file(node.children as FileCstChildren);
        break;
      case 'statement':
        this.statement(node.children as StatementCstChildren);
        break;
      case 'ifPredBody':
        this.ifPredBody(node.children as IfPredBodyCstChildren);
        break;
      case 'body':
        this.body(node.children as BodyCstChildren);
        break;
      case 'declaration':
        this.declaration(node.children as DeclarationCstChildren);
        break;
      case 'expression':
        this.expression(node as ExpressionCstNode);
        break;
      case 'value':
        this.value(node.children as ValueCstChildren);
        break;
      case 'constant':
        this.constant(node.children as ConstantCstChildren);
        break;
      case 'type':
        this.type(node.children as TypeCstChildren);
        break;
    }
  }
}
