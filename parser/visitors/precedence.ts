import type { TokenType } from 'chevrotain';
import type {
  ExpressionCstChildren,
  ExpressionCstNode,
  ValueCstChildren,
  ValueCstNode
} from '../cst-types.js';
import * as Tokens from '../lexer.js';
import { BaseCstVisitorWithDefaults } from '../parser.js';
import { CalvinPrinter } from './printer.js';

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

const printer = new CalvinPrinter();

export class PrecedenceHandler extends BaseCstVisitorWithDefaults {
  constructor() {
    super();
    this.validateVisitor();
  }

  reorder(tree: ExpressionCstChildren) {
    // greater precedence number is higher in tree
    // tree.left is value, tree.right is sub-expression
    if (tree.BinOp && tree.expression) {
      const ln = tree.BinOp[0].startLine;
      //console.log(`${ln}: ${tree.BinOp[0].image}`);
      // tree.right (i.e. expression) = reordered expression
      //console.log(`${ln}: enter recurse`);
      const right = (tree.expression[0].children = this.reorder(tree.expression[0].children));
      //console.log(`${ln}: exit recurse`);
      if (right.BinOp) {
        if (tok2Prec(tree.BinOp[0].tokenType) <= tok2Prec(right.BinOp[0].tokenType)) {
          console.log(`${ln}: reordering`);
          console.log(`${ln}: before:`);
          const indent = 2;
          printer.expression(tree, indent);
          // keep reference to old tree
          const old = { ...tree };
          console.log(`${ln}: old:`);
          printer.expression(old, indent);
          // tree is now tree.right
          tree = { ...right };
          console.log(`${ln}: tree = old.right:`);
          printer.expression(tree, indent);
          // old tree.right is now tree.right.left
          const left = tree.value[0];
          old.expression![0] = {
            ...left,
            children: { value: [{ ...left }] },
            name: 'expression'
          } satisfies ExpressionCstNode;
          console.log(`${ln}: old.right = tree.right.left:`);
          printer.expression(old, indent);
          // new tree.left is now old tree
          tree.value[0] = {
            children: { expression: [{ name: 'expression', children: old }] },
            name: 'value'
          } satisfies ValueCstNode;
          console.log(`${ln}: tree.left = old:`);
          printer.expression(tree, indent);
        }
      }
    }
    return tree;
  }

  expression(expr: ExpressionCstChildren) {
    expr = this.reorder(expr);
    this.value(expr.value[0].children);
  }

  value(val: ValueCstChildren) {
    if (val.expression) {
      // nested expression
      this.expression(val.expression[0].children);
    } else if (!val.constant && !val.ID) {
      // Unop
      this.value(val.value![0].children);
    }
  }
}
