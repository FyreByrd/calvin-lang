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
import { Printer } from './printer.ts';

const start = ANSIColor.BrightRed;
const range = ANSIColor.BrightWhite - start;

export class XMLPrinter extends Printer implements ICstNodeVisitor<number, void> {
  constructor(output: Logger | null = console.log, colors: boolean = true) {
    super(output, colors);
    this.validateVisitor();
  }

  private tree(msg: string, indent: number) {
    if (this.colors) {
      this.output?.(color(start + ((indent / 2) % range), prefix(msg, indent)));
    } else {
      this.output?.(prefix(msg, indent));
    }
  }

  file(node: FileCstChildren, indent: number) {
    this.tree('<?xml version="1.0" encoding="UTF-8"?>', indent);
    if (node.statement) {
      this.tree('<file>', indent);
      this.statement_list(node.statement, indent + 2);
      this.tree('</file>', indent);
    }
  }

  statement_list(statements: StatementCstNode[], indent: number) {
    this.tree('<statements>', indent);
    for (const stmt of statements) {
      this.statement(stmt.children, indent + 2);
    }
    this.tree('</statements>', indent);
  }

  statement(stmt: StatementCstChildren, indent: number) {
    this.tree('<statement>', indent);
    if (stmt.declaration) {
      this.declaration(stmt.declaration[0].children, indent + 2);
    } else if (stmt.BREAK) {
      this.tree('<break/>', indent + 2);
    } else if (stmt.CONTINUE) {
      this.tree('<continue/>', indent + 2);
    } else if (stmt.RETURN) {
      if (stmt.expression) {
        this.tree('<return>', indent + 2);
        this.expression(stmt.expression[0].children, indent + 4);
        this.tree('</return>', indent + 2);
      } else {
        this.tree('<return/>', indent + 2);
      }
    } else if (stmt.IF && stmt.ifPredBody) {
      this.tree('<if>', indent + 2);
      let bodyCount = 0;
      const ifPredBody = stmt.ifPredBody;
      this.ifPredBody(ifPredBody[bodyCount++].children, indent + 4);
      this.tree('</if>', indent + 2);
      if (stmt.ELIF) {
        stmt.ELIF.forEach(() => {
          this.tree('<elif>', indent + 2);
          this.ifPredBody(ifPredBody[bodyCount++].children, indent + 4);
          this.tree('</elif>', indent + 2);
        });
      }
      if (stmt.ELSE && stmt.body) {
        this.tree('<else>', indent + 2);
        this.body(stmt.body[0].children, indent + 4);
        this.tree('</else>', indent + 2);
      }
    } else if (stmt.WHILE && stmt.expression) {
      let bodyCount = 0;
      if (stmt.DO && stmt.body) {
        this.tree('<do>', indent + 2);
        this.body(stmt.body[bodyCount++].children, indent + 4);
        this.tree('</do>', indent + 2);
      }
      this.tree('<while>', indent + 2);
      this.expression(stmt.expression[0].children, indent + 4);
      if (!stmt.SEMI && stmt.body) {
        this.body(stmt.body[bodyCount++].children, indent + 4);
      } else {
        this.tree('<empty/>', indent + 2);
      }
      this.tree('</while>', indent + 2);
      if (stmt.FINALLY && stmt.body) {
        this.tree('<finally>', indent);
        this.body(stmt.body[bodyCount++].children, indent + 4);
        this.tree('</finally>', indent + 2);
      }
    } else if (stmt.body) {
      this.tree('<body>', indent + 2);
      this.body(stmt.body[0].children, indent + 4);
      this.tree('</body>', indent + 2);
    } else if (stmt.expression) {
      this.expression(stmt.expression[0].children, indent + 2);
    } else {
      this.tree('<empty/>', indent + 2);
    }
    this.tree('</statement>', indent);
  }

  ifPredBody(predBody: IfPredBodyCstChildren, indent: number) {
    if (predBody.LET && predBody.declaration) {
      this.declaration(predBody.declaration[0].children, indent);
    } else if (predBody.expression) {
      this.expression(predBody.expression[0].children, indent);
    }
    this.tree('<body>', indent);
    this.body(predBody.body[0].children, indent + 2);
    this.tree('</body>', indent);
  }

  declaration(decl: DeclarationCstChildren, indent: number) {
    this.tree(`<declaration image="${decl.ID[0].image}">`, indent);
    if (decl.type) {
      this.type(decl.type[0].children, indent + 2);
    }
    if (decl.expression) {
      this.expression(decl.expression[0].children, indent + 2);
    }
    this.tree('</declaration>', indent);
  }

  body(body: BodyCstChildren, indent: number) {
    if (body.statement) {
      this.statement_list(body.statement, indent);
    }
  }

  expression(expr: ExpressionCstChildren, indent: number) {
    const op = Object.values(expr).find((e) => 'tokenType' in e[0]) as IToken[] | undefined;
    this.tree(`<expression op="${op?.[0].image ?? ''}">`, indent);
    this.value(expr.value[0].children, indent + 2);
    if (expr.expression) {
      this.expression(expr.expression[0].children, indent + 2);
    }
    this.tree('</expression>', indent);
  }

  value(val: ValueCstChildren, indent: number) {
    this.tree('<value>', indent);
    if (val.expression) {
      this.tree('<nested>', indent + 2);
      this.expression(val.expression[0].children, indent + 4);
      this.tree('</nested>', indent + 2);
    } else if (val.constant) {
      this.constant(val.constant[0].children, indent + 2);
    } else if (val.ID) {
      this.tree(val.ID[0].image, indent);
    } else if (val.value) {
      const op = Object.values(val).find((v) => 'tokenType' in v[0]) as IToken[];
      this.tree(`<prefix op="${op[0].image}">`, indent + 2);
      this.value(val.value[0].children, indent + 4);
      this.tree(`</prefix>`, indent + 2);
    } else {
      throw new Error(`TypeInference: unhandled value type ${JSON.stringify(val)}`);
    }
    this.tree('</value>', indent);
  }

  constant(c: ConstantCstChildren, indent: number) {
    this.tree(`<constant>${Object.values(c)[0][0].image}</constant>`, indent);
  }

  type(t: TypeCstChildren, indent: number) {
    this.tree(`<type>${t.BASIC_TYPE[0].image}</type>`, indent);
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
