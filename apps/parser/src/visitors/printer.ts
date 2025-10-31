import type { CstNode, IToken } from 'chevrotain';
import type {
  ArrayTypeCstChildren,
  BodyCstChildren,
  ChainValueCstChildren,
  ConstantCstChildren,
  DeclarationCstChildren,
  ExpressionCstChildren,
  FileCstChildren,
  ICstNodeVisitor,
  IfPredBodyCstChildren,
  IndexOrSliceCstChildren,
  StatementCstChildren,
  StatementCstNode,
  TypeCstChildren,
  ValueCstChildren,
} from '@/generated/cst-types.ts';
import { tree } from '../logging.ts';
import { BaseCstVisitor } from '../parser.ts';

export class CalvinPrinter extends BaseCstVisitor implements ICstNodeVisitor<number, void> {
  constructor() {
    super();
    this.validateVisitor();
  }
  file(node: FileCstChildren, indent: number) {
    if (node.statement) {
      tree('(', indent);
      this.statement_list(node.statement, indent + 2);
      tree(')', indent);
    }
  }

  statement_list(statements: StatementCstNode[], indent: number) {
    for (const stmt of statements) {
      this.statement(stmt.children, indent);
    }
  }

  statement(stmt: StatementCstChildren, indent: number) {
    if (stmt.declaration) {
      this.declaration(stmt.declaration[0].children, indent);
    } else if (stmt.BREAK) {
      tree('break;', indent);
    } else if (stmt.CONTINUE) {
      tree('continue;', indent);
    } else if (stmt.RETURN) {
      if (stmt.expression) {
        tree('return (', indent);
        this.expression(stmt.expression[0].children, indent + 2);
        tree(')', indent);
      } else {
        tree('return;', indent);
      }
    } else if (stmt.IF && stmt.ifPredBody) {
      tree('if (', indent);
      let bodyCount = 0;
      const ifPredBody = stmt.ifPredBody;
      this.ifPredBody(ifPredBody[bodyCount++].children, indent);
      if (stmt.ELIF) {
        stmt.ELIF.forEach(() => {
          tree('elif (', indent);
          this.ifPredBody(ifPredBody[bodyCount++].children, indent);
        });
      }
      if (stmt.ELSE && stmt.body) {
        tree('else {', indent);
        this.body(stmt.body[0].children, indent + 2);
      }
    } else if (stmt.WHILE && stmt.expression) {
      let bodyCount = 0;
      if (stmt.DO && stmt.body) {
        tree('do {', indent);
        this.body(stmt.body[bodyCount++].children, indent + 2);
        tree('} while (', indent);
      } else {
        tree('while (', indent);
      }
      this.expression(stmt.expression[0].children, indent + 2);
      tree(') {', indent);
      if (!stmt.SEMI && stmt.body) {
        this.body(stmt.body[bodyCount++].children, indent + 2);
      }
      if (stmt.FINALLY && stmt.body) {
        tree('} finally {', indent);
        this.body(stmt.body[bodyCount++].children, indent + 2);
        tree('}', indent);
      } else {
        tree('}', indent);
      }
    } else if (stmt.body) {
      tree('{', indent);
      this.body(stmt.body[0].children, indent + 2);
      tree('}', indent);
    } else if (stmt.expression) {
      this.expression(stmt.expression[0].children, indent);
    } else {
      tree(';', indent);
    }
  }

  ifPredBody(predBody: IfPredBodyCstChildren, indent: number) {
    if (predBody.LET && predBody.declaration) {
      this.declaration(predBody.declaration[0].children, indent + 2);
    } else if (predBody.expression) {
      this.expression(predBody.expression[0].children, indent + 2);
    }
    tree(') {', indent);
    this.body(predBody.body[0].children, indent + 2);
    tree('}', indent);
  }

  declaration(decl: DeclarationCstChildren, indent: number) {
    tree(`let ${decl.ID[0].image}${decl.expression ? ' = (' : ''}`, indent);
    if (decl.type) {
      this.type(decl.type[0].children, indent + 2);
    }
    if (decl.expression) {
      this.expression(decl.expression[0].children, indent + 2);
      tree(')', indent);
    }
  }

  body(body: BodyCstChildren, indent: number) {
    if (body.statement) {
      this.statement_list(body.statement, indent);
    }
  }

  expression(expr: ExpressionCstChildren, indent: number) {
    const op = Object.values(expr).find((e) => 'tokenType' in e[0]) as IToken[] | undefined;
    if (op) {
      tree(`(${op[0].image}`, indent);
    } else {
      tree('(', indent);
    }
    this.chainValue(expr.chainValue[0].children, indent + 2);
    if (expr.expression) {
      this.expression(expr.expression[0].children, indent + 2);
    }
    tree(')', indent);
  }

  chainValue(cval: ChainValueCstChildren, indent: number) {
    this.value(cval.value[0].children, indent);
  }

  indexOrSlice(ios: IndexOrSliceCstChildren, indent: number) {
    if (ios.LBRACK && ios.RBRACK) {
      tree('[', indent);
      if (ios.COLON) {
        let exprCount = 0;
        if (ios.expression?.at(exprCount)) {
          // start
          this.expression(ios.expression[exprCount++].children, indent + 2);
        }
        tree(':', indent);
        if (ios.expression?.at(exprCount)) {
          // end
          this.expression(ios.expression[exprCount++].children, indent + 2);
        }
        if (ios.COLON.at(1)) {
          tree(':', indent);
          if (ios.expression?.at(exprCount)) {
            // direction
            this.expression(ios.expression[exprCount++].children, indent + 2);
          }
        }
      } else if (ios.expression?.at(0)) {
        this.expression(ios.expression[0].children, indent + 2);
      }
      tree(']', indent);
    }
  }

  value(val: ValueCstChildren, indent: number) {
    if (val.expression) {
      tree('(', indent);
      this.expression(val.expression[0].children, indent + 2);
      tree(')', indent);
    } else if (val.constant) {
      this.constant(val.constant[0].children, indent);
    } else if (val.ID) {
      tree(val.ID[0].image, indent);
    } else if (val.chainValue) {
      const op = Object.values(val).find((v) => 'tokenType' in v[0]) as IToken[];
      tree(`(${op[0].image}!`, indent);
      this.chainValue(val.chainValue[0].children, indent + 2);
      tree(`)`, indent);
    } else {
      throw new Error(`TypeInference: unhandled value type ${JSON.stringify(val)}`);
    }
  }

  constant(c: ConstantCstChildren, indent: number) {
    if (c.expression) {
      // list
      tree('[', indent);
      c.expression.forEach((e) => {
        this.expression(e.children, indent + 2);
      });
      tree(']', indent);
    } else if (c.LBRACK) {
      // empty list
      tree('[]', indent);
    } else {
      tree((Object.values(c)[0][0] as IToken).image, indent);
    }
  }

  type(t: TypeCstChildren, indent: number) {
    tree(`: ${t.BASIC_TYPE[0].image}`, indent);
    if (t.arrayType) {
      t.arrayType.forEach((at) => {
        this.arrayType(at.children, indent + 2);
      });
    }
  }

  arrayType(a: ArrayTypeCstChildren, indent: number) {
    tree(`[${a.INT?.at(0)?.image ?? ''}]`, indent);
  }

  override visit(node: CstNode, indent: number = 0) {
    switch (node.name) {
      case 'file':
        this.file(node.children as FileCstChildren, indent);
        break;
      case 'statement':
        this.statement(node.children as StatementCstChildren, indent);
        break;
      case 'ifPredBody':
        this.ifPredBody(node.children as IfPredBodyCstChildren, indent);
        break;
      case 'body':
        this.body(node.children as BodyCstChildren, indent);
        break;
      case 'declaration':
        this.declaration(node.children as DeclarationCstChildren, indent);
        break;
      case 'expression':
        this.expression(node.children as ExpressionCstChildren, indent);
        break;
      case 'chainValue':
        this.chainValue(node.children as ChainValueCstChildren, indent);
        break;
      case 'indexOrSlice':
        this.indexOrSlice(node.children as IndexOrSliceCstChildren, indent);
        break;
      case 'value':
        this.value(node.children as ValueCstChildren, indent);
        break;
      case 'constant':
        this.constant(node.children as ConstantCstChildren, indent);
        break;
      case 'type':
        this.type(node.children as TypeCstChildren, indent);
        break;
      case 'arrayType':
        this.arrayType(node.children as ArrayTypeCstChildren, indent);
        break;
    }
  }
}
