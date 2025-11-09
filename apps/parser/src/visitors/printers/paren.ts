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

export class CalvinPrinter extends BasePrinter implements ICstNodeVisitor<number, void> {
  constructor(colors: boolean = true, output: Logger | null = console.log) {
    super(colors, output);
  }

  private tree(msg: string, indent: number) {
    if (this.colors) {
      this.output?.(color(start + ((indent / 2) % range), prefix(msg, indent)));
    } else {
      this.output?.(prefix(msg, indent));
    }
  }

  file(node: FileCstChildren, indent: number) {
    if (node.statement) {
      this.tree('(', indent);
      this.statement_list(node.statement, indent + 2);
      this.tree(')', indent);
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
      this.tree('break;', indent);
    } else if (stmt.CONTINUE) {
      this.tree('continue;', indent);
    } else if (stmt.RETURN) {
      if (stmt.expression) {
        this.tree('return (', indent);
        this.expression(stmt.expression[0].children, indent + 2);
        this.tree(')', indent);
      } else {
        this.tree('return;', indent);
      }
    } else if (stmt.IF && stmt.ifPredBody) {
      this.tree('if (', indent);
      let bodyCount = 0;
      const ifPredBody = stmt.ifPredBody;
      this.ifPredBody(ifPredBody[bodyCount++].children, indent);
      if (stmt.ELIF) {
        stmt.ELIF.forEach(() => {
          this.tree('elif (', indent);
          this.ifPredBody(ifPredBody[bodyCount++].children, indent);
        });
      }
      if (stmt.ELSE && stmt.body) {
        this.tree('else {', indent);
        this.body(stmt.body[0].children, indent + 2);
      }
    } else if (stmt.WHILE && stmt.expression) {
      let bodyCount = 0;
      if (stmt.DO && stmt.body) {
        this.tree('do {', indent);
        this.body(stmt.body[bodyCount++].children, indent + 2);
        this.tree('} while (', indent);
      } else {
        this.tree('while (', indent);
      }
      this.expression(stmt.expression[0].children, indent + 2);
      this.tree(') {', indent);
      if (!stmt.SEMI && stmt.body) {
        this.body(stmt.body[bodyCount++].children, indent + 2);
      }
      if (stmt.FINALLY && stmt.body) {
        this.tree('} finally {', indent);
        this.body(stmt.body[bodyCount++].children, indent + 2);
        this.tree('}', indent);
      } else {
        this.tree('}', indent);
      }
    } else if (stmt.body) {
      this.tree('{', indent);
      this.body(stmt.body[0].children, indent + 2);
      this.tree('}', indent);
    } else if (stmt.expression) {
      this.expression(stmt.expression[0].children, indent);
    } else {
      this.tree(';', indent);
    }
  }

  ifPredBody(predBody: IfPredBodyCstChildren, indent: number) {
    if (predBody.LET && predBody.declaration) {
      this.declaration(predBody.declaration[0].children, indent + 2);
    } else if (predBody.expression) {
      this.expression(predBody.expression[0].children, indent + 2);
    }
    this.tree(') {', indent);
    this.body(predBody.body[0].children, indent + 2);
    this.tree('}', indent);
  }

  declaration(decl: DeclarationCstChildren, indent: number) {
    this.tree(`let ${decl.ID[0].image}${decl.expression ? ' = (' : ''}`, indent);
    if (decl.type) {
      this.type(decl.type[0].children, indent + 2);
    }
    if (decl.expression) {
      this.expression(decl.expression[0].children, indent + 2);
      this.tree(')', indent);
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
      this.tree(`(${op[0].image}`, indent);
    } else {
      this.tree('(', indent);
    }
    this.value(expr.value[0].children, indent + 2);
    if (expr.expression) {
      this.expression(expr.expression[0].children, indent + 2);
    }
    this.tree(')', indent);
  }

  value(val: ValueCstChildren, indent: number) {
    if (val.expression) {
      this.tree('(', indent);
      this.expression(val.expression[0].children, indent + 2);
      this.tree(')', indent);
    } else if (val.constant) {
      this.constant(val.constant[0].children, indent);
    } else if (val.ID) {
      this.tree(val.ID[0].image, indent);
    } else if (val.value) {
      const op = Object.values(val).find((v) => 'tokenType' in v[0]) as IToken[];
      this.tree(`(${op[0].image}!`, indent);
      this.value(val.value[0].children, indent + 2);
      this.tree(`)`, indent);
    } else {
      throw new Error(`TypeInference: unhandled value type ${JSON.stringify(val)}`);
    }
  }

  constant(c: ConstantCstChildren, indent: number) {
    this.tree(Object.values(c)[0][0].image, indent);
  }

  type(t: TypeCstChildren, indent: number) {
    this.tree(`: ${t.BASIC_TYPE[0].image}`, indent);
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
