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
import { Globals } from '../globals.ts';
import { debug, error, prefix, warn } from '../logging.ts';
import { BaseCstVisitor } from '../parser.ts';
import { assert } from '@std/assert';

export enum TypeClasses {
  Unknown,
  Integral,
  Real,
  Complex,
  Boolean,
  Binary,
  String,
  Never,
}

export function printType(t: TypeClasses): string {
  switch (t) {
    case TypeClasses.Unknown:
      return 'unknown';
    case TypeClasses.Integral:
      return 'integer';
    case TypeClasses.Real:
      return 'real';
    case TypeClasses.Complex:
      return 'complex';
    case TypeClasses.Boolean:
      return 'boolean';
    case TypeClasses.Binary:
      return 'binary';
    case TypeClasses.String:
      return 'string';
    case TypeClasses.Never:
      return 'never';
  }
}

export type Meta = {
  returnType: TypeClasses;
  source: IToken;
};

type ScopeData = { tok: IToken; meta: Meta };
type ScopeSearch = { scope: Scope; found?: ScopeData };

export class Scope {
  public readonly name: string;
  private readonly map;
  private _parent: Scope | undefined;
  private children: Scope[];
  constructor(name: string, parent?: Scope) {
    this.name = name;
    this._parent = parent;
    this.map = new Map<string, ScopeData>();
    this.children = [];
  }

  get parent(): Scope | undefined {
    return this._parent;
  }

  public get(key: string): ScopeData | undefined {
    return this.map.get(key);
  }

  public search(key: string): ScopeSearch | undefined {
    let ret: ScopeSearch | undefined = {
      scope: this,
      found: this.get(key),
    };
    if (!ret.found) {
      ret = this.parent?.search(key);
    }
    return ret;
  }

  public set(key: string, value: ScopeData): void {
    this.map.set(key, value);
  }

  public createChild(name: string): Scope {
    const scope = new Scope(name, this);
    this.children.push(scope);
    return scope;
  }

  public print(indent: number = 0): void {
    if (Globals.debugScopes) {
      debug(
        prefix(
          `SCOPE: ${this.name} (parent: ${this.parent?.name ?? 'None'}, symbols: ${this.map.size}, children: ${this.children.length})`,
          indent,
        ),
      );
      this.map.values().forEach((v) => {
        debug(
          prefix(
            `${v.tok.image} on line ${v.tok.startLine}: ${printType(v.meta.returnType)} (from ${v.meta.source.image} on line ${v.meta.source.startLine})`,
            indent,
          ),
        );
      });
      console.log('');
      this.children.forEach((c) => { c.print(indent) });
    }
  }

  public reset(): Scope {
    if (this.parent) {
      return this.parent.reset();
    } else {
      this.resetHelp();
      return this;
    }
  }
  private resetHelp(): void {
    this.children.forEach((c) => { c.resetHelp() });
    this.children = [];
    this.map.clear();
  }
}

export class CalvinTypeAnalyzer
  extends BaseCstVisitor
  implements ICstNodeVisitor<void, Meta | undefined>
{
  private counts;
  private _errors;
  public get errors(): number {
    return this._errors;
  }
  private _warnings;
  public get warnings(): number {
    return this._warnings;
  }
  private _currentScope: Scope;
  public get scope(): Scope {
    return this._currentScope;
  }

  warn(msg: string) {
    this._warnings++;
    warn(msg);
  }

  error(msg: string) {
    this._errors++;
    error(msg);
  }

  pushScope(type: keyof typeof this.counts) {
    this._currentScope = this.scope.createChild(`${type}-${this.counts[type]++}`);
  }
  popScope() {
    assert(this.scope.parent, 'Scope push/pop mismatch!');
    this._currentScope = this.scope.parent;
  }

  reset() {
    this.counts = {
      if: 0,
      elif: 0,
      else: 0,
      do: 0,
      while: 0,
      finally: 0,
      anon: 0,
    };
    this._errors = 0;
    this._warnings = 0;
    this._currentScope = this.scope.reset();
  }

  constructor() {
    super();
    this.counts = {
      if: 0,
      elif: 0,
      else: 0,
      do: 0,
      while: 0,
      finally: 0,
      anon: 0,
    };
    this._errors = 0;
    this._warnings = 0;
    this._currentScope = new Scope('ROOT');
    this.validateVisitor();
  }

  override visit(node: CstNode): undefined {
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
        this.expression(node.children as ExpressionCstChildren);
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

  file(node: FileCstChildren): undefined {
    if (node.statement) {
      this.statement_list(node.statement);
    }
  }

  statement_list(statements: StatementCstNode[]): undefined {
    for (const stmt of statements) {
      this.statement(stmt.children);
    }
  }

  statement(stmt: StatementCstChildren): undefined {
    if (stmt.declaration) {
      this.declaration(stmt.declaration[0].children);
    } else if (stmt.RETURN) {
      if (stmt.expression) {
        this.expression(stmt.expression[0].children);
      }
    } else if (stmt.IF && stmt.ifPredBody) {
      let bodyCount = 0;
      const ifPredBody = stmt.ifPredBody;
      this.pushScope('if');
      this.ifPredBody(stmt.ifPredBody[bodyCount++].children);
      this.popScope();
      if (stmt.ELIF) {
        stmt.ELIF.forEach(() => {
          this.pushScope('elif');
          this.ifPredBody(ifPredBody[bodyCount++].children);
          this.popScope();
        });
      }
      if (stmt.ELSE && stmt.body) {
        this.pushScope('else');
        this.body(stmt.body[0].children);
        this.popScope();
      }
    } else if (stmt.WHILE && stmt.expression) {
      let bodyCount = 0;
      if (stmt.DO && stmt.body) {
        this.pushScope('do');
        this.body(stmt.body[bodyCount++].children);
        this.popScope();
      }
      this.expression(stmt.expression[0].children);
      if (!stmt.SEMI && stmt.body) {
        this.pushScope('while');
        this.body(stmt.body[bodyCount++].children);
        this.popScope();
      }
      if (stmt.FINALLY && stmt.body) {
        this.pushScope('finally');
        this.body(stmt.body[bodyCount++].children);
        this.popScope();
      }
    } else if (stmt.body) {
      this.pushScope('anon');
      this.body(stmt.body[0].children);
      this.popScope();
    } else if (stmt.expression) {
      this.expression(stmt.expression[0].children);
    }
  }

  ifPredBody(predBody: IfPredBodyCstChildren): undefined {
    if (predBody.LET && predBody.declaration) {
      this.declaration(predBody.declaration[0].children);
    } else if (predBody.expression) {
      this.expression(predBody.expression[0].children);
    }
    this.body(predBody.body[0].children);
  }

  declaration(decl: DeclarationCstChildren): undefined {
    const id = decl.ID[0];
    const t = decl.type ? this.type(decl.type[0].children) : null;
    const expr = decl.expression ? this.expression(decl.expression[0].children) : null;
    const meta = t ?? expr ?? ({ source: id, returnType: TypeClasses.Unknown } satisfies Meta);
    const search = this.scope.search(id.image);
    const existing = this.scope === search?.scope && search.found;
    if (search) {
      if (existing) {
        this.error(
          `variable ${id.image} originally defined on line ${existing.tok.startLine}, redefined on line ${id.startLine}!`,
        );
      } else if (search.found) {
        this.warn(
          `variable ${id.image} on line ${id.startLine} shadows variable defined on line ${search.found.tok.startLine}`,
        );
      }
    }
    if (t && expr) {
      if (t.returnType !== expr.returnType) {
        // TODO type resolution algorithm
        this.error(
          `type declaration on line ${t.source.startLine} does not match assignment on line ${expr.source.startLine}`,
        );
      }
    } else if (!t && !expr) {
      this.warn(
        `Type inference failed for ${id.image} on line ${id.startLine}, assigned type = unknown`,
      );
    }
    if (!existing) {
      this.scope.set(id.image, { tok: id, meta });
    }
  }

  body(body: BodyCstChildren): undefined {
    if (body.statement) {
      this.statement_list(body.statement);
    }
  }

  expression(expr: ExpressionCstChildren): Meta {
    const op = Object.values(expr).find((e) => 'tokenType' in e[0]) as IToken[] | undefined;
    if (op) {
      // TODO value operator mismatch
    }
    const val = this.value(expr.value[0].children);
    // TODO handle type mismatch
    const exprMeta = expr.expression ? this.expression(expr.expression[0].children) : null;
    return exprMeta ?? val;
  }

  value(val: ValueCstChildren): Meta {
    if (val.expression) {
      return this.expression(val.expression[0].children);
    } else if (val.constant) {
      return this.constant(val.constant[0].children);
    } else if (val.ID) {
      const id = val.ID[0];
      const existing = this.scope.search(id.image);
      if (!existing) {
        this.error(`undeclared variable ${id.image} used on line ${id.startLine}`);
      }
      const meta = existing?.found?.meta;

      return meta ?? ({ source: id, returnType: TypeClasses.Never } satisfies Meta);
    } else if (val.value) {
      //const op = Object.values(val).find((v) => 'tokenType' in v[0]) as IToken[];
      // TODO value operator mismatch
      return this.value(val.value[0].children);
    }
    throw new Error(`TypeInference: unhandled value type ${JSON.stringify(val)}`);
  }

  constant(c: ConstantCstChildren): Meta {
    if (c.BIN) return { source: c.BIN[0], returnType: TypeClasses.Binary };
    else if (c.BOOL) return { source: c.BOOL[0], returnType: TypeClasses.Boolean };
    else if (c.CMPX) return { source: c.CMPX[0], returnType: TypeClasses.Complex };
    else if (c.REAL) return { source: c.REAL[0], returnType: TypeClasses.Real };
    else if (c.INT) return { source: c.INT[0], returnType: TypeClasses.Integral };
    else if (c.STRING) return { source: c.STRING[0], returnType: TypeClasses.String };
    // this should never be reached, except maybe when adding a new literal type
    throw new Error(`Could not get type from constant token ${JSON.stringify(c, null, 4)}`);
  }

  type(t: TypeCstChildren): Meta {
    const source = t.BASIC_TYPE[0];
    return {
      source,
      returnType: [source.image].map((t) => {
        switch (t[0]) {
          case 'i':
          case 'u':
            return TypeClasses.Integral;
          case 'x':
            return TypeClasses.Complex;
          case 'r':
            return TypeClasses.Real;
          case 'b':
            return t[1] === 'o' ? TypeClasses.Boolean : TypeClasses.Binary;
          case 's':
            return TypeClasses.String;
          default:
            return TypeClasses.Unknown;
        }
      })[0],
    };
  }
}
