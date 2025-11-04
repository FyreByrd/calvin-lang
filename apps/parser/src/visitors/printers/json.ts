import type { CstNode, IToken } from 'chevrotain';
import type {
  BodyCstChildren,
  ConstantCstChildren,
  DeclarationCstChildren,
  ExpressionCstChildren,
  FileCstChildren,
  ICstNodeVisitor,
  IfPredBodyCstChildren,
  StatementCstChildren,
  StatementCstNode,
  TypeCstChildren,
  ValueCstChildren,
} from '@/generated/cst-types.ts';
import { ANSIColor, color, type Logger, prefix } from '@/src/logging.ts';
import { BasePrinter } from './printer.ts';

const start = ANSIColor.BrightRed;
const range = ANSIColor.BrightWhite - start;

export class JSONPrinter extends BasePrinter implements ICstNodeVisitor<number, void> {
  constructor(colors: boolean = true, output: Logger | null = console.log) {
    super(colors, output);
  }

  private tree(msg: string, indent: number, trail: boolean = false) {
    if (this.colors) {
      this.output?.(
        color(start + ((indent / 2) % range), prefix(`${msg}${trail ? ',' : ''}`, indent)),
      );
    } else {
      this.output?.(prefix(`${msg}${trail ? ',' : ''}`, indent));
    }
  }

  file(node: FileCstChildren, indent: number, trail: boolean = false) {
    this.tree('{', indent);
    this.tree('"file": {', indent + 2);
    if (node.statement) {
      this.statement_list(node.statement, indent + 4);
    }
    this.tree('}', indent + 2);
    this.tree('}', indent, trail);
  }

  statement_list(statements: StatementCstNode[], indent: number, trail: boolean = false) {
    this.tree('"statements": [', indent);
    for (let i = 0; i < statements.length; i++) {
      this.statement(statements[i].children, indent + 2, i + 1 !== statements.length);
    }
    this.tree(']', indent, trail);
  }

  statement(stmt: StatementCstChildren, indent: number, trail: boolean = false) {
    this.tree('{', indent);
    if (stmt.declaration) {
      this.tree('"type": "declaration"', indent + 2, true);
      this.declaration(stmt.declaration[0].children, indent + 2);
    } else if (stmt.BREAK) {
      this.tree('"type": "break"', indent + 2);
    } else if (stmt.CONTINUE) {
      this.tree('"type": "continue"', indent + 2);
    } else if (stmt.RETURN) {
      this.tree('"type": "return"', indent + 2, !!stmt.expression);
      if (stmt.expression) {
        this.expression(stmt.expression[0].children, indent + 2);
      }
    } else if (stmt.IF && stmt.ifPredBody) {
      this.tree('"type": "if"', indent + 2, true);
      let bodyCount = 0;
      const ifPredBody = stmt.ifPredBody;
      this.ifPredBody(ifPredBody[bodyCount++].children, indent + 2, !!(stmt.ELIF || stmt.ELSE));
      if (stmt.ELIF) {
        this.tree('"elif": [', indent + 2);
        for (let i = 0; i < stmt.ELIF.length; i++) {
          this.tree('{', indent + 4);
          this.ifPredBody(ifPredBody[bodyCount++].children, indent + 6);
          this.tree('}', indent + 4, i + 1 !== stmt.ELIF.length);
        }
        this.tree(']', indent + 2, !!stmt.ELSE);
      }
      if (stmt.ELSE && stmt.body) {
        this.tree('"else": {', indent + 2);
        this.body(stmt.body[0].children, indent + 4);
        this.tree('}', indent + 2);
      }
    } else if (stmt.WHILE && stmt.expression) {
      let bodyCount = 0;
      this.tree('"type": "while"', indent + 2, true);
      if (stmt.DO && stmt.body) {
        this.tree('"do": {', indent + 2);
        this.body(stmt.body[bodyCount++].children, indent + 4);
        this.tree('}', indent + 2, true);
      }
      this.expression(stmt.expression[0].children, indent + 2, true);
      if (!stmt.SEMI && stmt.body) {
        this.body(stmt.body[bodyCount++].children, indent + 2, !!stmt.FINALLY);
      } else {
        this.tree('"body": {}', indent + 2, !!stmt.FINALLY);
      }
      if (stmt.FINALLY && stmt.body) {
        this.tree('"finally": {', indent + 2);
        this.body(stmt.body[bodyCount++].children, indent + 4);
        this.tree('}', indent + 2);
      }
    } else if (stmt.body) {
      this.tree('"type": "body",', indent + 2);
      this.body(stmt.body[0].children, indent + 2);
    } else if (stmt.expression) {
      this.tree('"type": "expression",', indent + 2);
      this.expression(stmt.expression[0].children, indent + 2);
    } else {
      this.tree('"type": "empty"', indent + 2);
    }
    this.tree('}', indent, trail);
  }

  ifPredBody(predBody: IfPredBodyCstChildren, indent: number, trail: boolean = false) {
    if (predBody.LET && predBody.declaration) {
      this.declaration(predBody.declaration[0].children, indent, true);
    } else if (predBody.expression) {
      this.expression(predBody.expression[0].children, indent, true);
    }
    this.body(predBody.body[0].children, indent, trail);
  }

  declaration(decl: DeclarationCstChildren, indent: number, trail: boolean = false) {
    this.tree(`"declaration": {`, indent);
    this.tree(`"image": "${decl.ID[0].image}"`, indent + 2, !!(decl.type || decl.expression));
    if (decl.type) {
      this.type(decl.type[0].children, indent + 2, !!decl.expression);
    }
    if (decl.expression) {
      this.expression(decl.expression[0].children, indent + 2, false);
    }
    this.tree('}', indent, trail);
  }

  body(body: BodyCstChildren, indent: number, trail: boolean = false) {
    this.tree('"body": {', indent);
    if (body.statement) {
      this.statement_list(body.statement, indent + 2);
    }
    this.tree('}', indent, trail);
  }

  expression(expr: ExpressionCstChildren, indent: number, trail: boolean = false) {
    const op = Object.values(expr).find((e) => 'tokenType' in e[0]) as IToken[] | undefined;
    this.tree(`"expression": {`, indent);
    this.tree(`"op": "${op?.[0].image ?? ''}"`, indent + 2, true);
    this.value(expr.value[0].children, indent + 2, !!expr.expression);
    if (expr.expression) {
      this.expression(expr.expression[0].children, indent + 2);
    }
    this.tree('}', indent, trail);
  }

  value(val: ValueCstChildren, indent: number, trail: boolean = false) {
    this.tree('"value": {', indent);
    if (val.expression) {
      this.tree('"nested": {', indent + 2);
      this.expression(val.expression[0].children, indent + 4);
      this.tree('}', indent + 2);
    } else if (val.constant) {
      this.constant(val.constant[0].children, indent + 2);
    } else if (val.ID) {
      this.tree(`"id": "${val.ID[0].image}"`, indent);
    } else if (val.value) {
      const op = Object.values(val).find((v) => 'tokenType' in v[0]) as IToken[];
      this.tree(`"prefix": "${op[0].image}"`, indent + 2, true);
      this.value(val.value[0].children, indent + 2);
    } else {
      throw new Error(`TypeInference: unhandled value type ${JSON.stringify(val)}`);
    }
    this.tree('}', indent, trail);
  }

  constant(c: ConstantCstChildren, indent: number, trail: boolean = false) {
    this.tree(`"constant": "${Object.values(c)[0][0].image}"`, indent, trail);
  }

  type(t: TypeCstChildren, indent: number, trail: boolean = false) {
    this.tree(`"type": "${t.BASIC_TYPE[0].image}"`, indent, trail);
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
      case 'value':
        this.value(node.children as ValueCstChildren, indent);
        break;
      case 'constant':
        this.constant(node.children as ConstantCstChildren, indent);
        break;
      case 'type':
        this.type(node.children as TypeCstChildren, indent);
        break;
    }
  }
}
