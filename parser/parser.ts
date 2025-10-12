import { EmbeddedActionsParser, type IToken } from 'chevrotain';
import * as Tokens from './lexer.js';
import { type Meta, TypeClasses, scope } from './semantics.js';

export type Stmt = {
  type: 'expr' | 'decl';
} & (({ type: 'expr' } & Expr) | ({ type: 'decl' } & Decl));

export type Decl = {
  id: IToken;
  meta: Meta;
  expr?: Expr;
};

export type Expr = {
  meta: Meta;
  value: Value;
  operator?: IToken;
  expr?: Expr;
  reversed?: boolean;
};
export type Value = {
  type: 'constant' | 'id' | 'expr';
} & (
  | { type: 'constant'; const: IToken; meta: Meta }
  | { type: 'id'; id: IToken; meta: Meta }
  | ({ type: 'expr' } & Expr)
);
export class CalvinParser extends EmbeddedActionsParser {
  public readonly file;
  private readonly statement;
  private readonly declaration;
  private readonly expression;
  private readonly value;
  private readonly constant;
  private readonly type;
  private _hasErrors: boolean;
  private _hasWarnings: boolean;

  get hasErrors() {
    return this._hasErrors;
  }
  get hasWarnings() {
    return this._hasWarnings;
  }

  warn(msg: string) {
    this._hasWarnings = true;
    console.warn('\x1b[33mWarning: %s\x1b[0m', msg);
  }

  error(msg: string) {
    this._hasErrors = true;
    console.error('\x1b[31mError: %s\x1b[0m', msg);
  }

  constructor() {
    super(Tokens.allTokens);
    this._hasErrors = false;
    this._hasWarnings = false;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const $ = this;

    this.file = $.RULE('file', (): Stmt[] => {
      const res: Stmt[] = [];
      $.MANY(() => {
        res.push($.SUBRULE($.statement));
      });
      return res;
    });

    this.statement = $.RULE('statement', (): Stmt => {
      const stmt = $.OR([
        {
          ALT: () => {
            $.CONSUME(Tokens.LET);
            return {
              type: 'decl',
              ...$.SUBRULE($.declaration)
            };
          }
        },
        {
          ALT: () => ({
            type: 'expr',
            ...$.SUBRULE($.expression)
          })
        }
      ]);
      $.CONSUME(Tokens.SEMI);
      return stmt;
    });

    this.declaration = $.RULE('declaration', (): Decl => {
      const id = $.CONSUME(Tokens.ID);
      const t = $.OPTION(() => {
        $.CONSUME(Tokens.COLON);
        return $.SUBRULE($.type);
      });
      const expr = $.OPTION1(() => {
        $.CONSUME(Tokens.EQU);
        return $.SUBRULE($.expression);
      });
      const meta =
        t ?? expr?.meta ?? ({ source: id, returnType: TypeClasses.Unknown } satisfies Meta);
      $.ACTION(() => {
        const existing = scope.get(id.image);
        if (existing) {
          $.error(
            `variable ${id.image} originally defined on line ${existing.tok.startLine}, redefined on line ${id.startLine}!`
          );
        }
        if (t && expr?.meta) {
          if (t.returnType !== expr.meta.returnType) {
            // TODO type resolution algorithm
            $.error(
              `type declaration on line ${t.source.startLine} does not match assignment on line ${expr.meta.source.startLine}`
            );
          }
        } else if (!t && !expr?.meta) {
          $.warn(
            `Type inference failed for ${id.image} on line ${id.startLine}, assigned type = unknown`
          );
        }
        if (!existing) {
          scope.set(id.image, { tok: id, meta });
        }
      });
      return {
        id,
        meta,
        expr
      };
    });

    this.expression = $.RULE('expression', (): Expr => {
      const value = $.SUBRULE($.value);
      // TODO value operator mismatch
      const expr: Expr = { value, meta: value.meta };
      $.OR([
        {
          ALT: () => {
            expr.operator = $.OR1([
              ...Tokens.postfixUnopTokens.map((t) => ({ ALT: () => $.CONSUME(t) }))
            ]);
            expr.reversed = true;
          }
        },
        {
          ALT: () => {
            $.OPTION(() => {
              expr.operator = $.OR2([
                ...Tokens.binopTokens.map((t) => ({ ALT: () => $.CONSUME(t) }))
              ]);
              expr.expr = $.SUBRULE($.expression);
              // TODO reorder based on precedence
            });
          }
        }
      ]);
      return expr;
    });

    this.value = $.RULE('value', (): Value => {
      return $.OR([
        {
          ALT: () => {
            const operator = $.OR1([
              ...Tokens.unopTokens.map((t) => ({ ALT: () => $.CONSUME(t) }))
            ]);
            // TODO value operator mismatch
            const value = $.SUBRULE1($.value);
            return {
              type: 'expr',
              operator,
              value,
              meta: value.meta
            } satisfies Value;
          }
        },
        {
          ALT: () => {
            return { type: 'constant', ...$.SUBRULE($.constant) } satisfies Value;
          }
        },
        {
          ALT: () => {
            const id = $.CONSUME(Tokens.ID);
            let meta: Meta | undefined = undefined;
            $.ACTION(() => {
              const existing = scope.get(id.image);
              if (!existing) {
                $.error(`undeclared variable ${id.image} used on line ${id.startLine}`);
              }
              meta = existing?.meta;
            });
            return {
              type: 'id',
              id,
              meta: meta ?? { source: id, returnType: TypeClasses.Never }
            } satisfies Value;
          }
        },
        {
          ALT: () => {
            $.CONSUME(Tokens.LPAREN);
            const expr = $.SUBRULE($.expression);
            $.CONSUME(Tokens.RPAREN);
            return { type: 'expr', ...expr } satisfies Value;
          }
        }
      ]);
    });

    this.constant = $.RULE('constant', () => {
      const tok = $.OR([
        {
          ALT: () => {
            return $.CONSUME(Tokens.BOOL);
          }
        },
        {
          ALT: () => {
            return $.CONSUME(Tokens.CMPX);
          }
        },
        {
          ALT: () => {
            return $.CONSUME(Tokens.REAL);
          }
        },
        {
          ALT: () => {
            return $.CONSUME(Tokens.INT);
          }
        },
        {
          ALT: () => {
            return $.CONSUME(Tokens.STRING);
          }
        }
      ]);
      const ret = {
        const: tok,
        meta: {
          source: tok,
          returnType: [tok].map((t) => {
            switch (tok.tokenType) {
              case Tokens.BOOL:
                return TypeClasses.Boolean;
              case Tokens.CMPX:
                return TypeClasses.Complex;
              case Tokens.REAL:
                return TypeClasses.Real;
              case Tokens.INT:
                return TypeClasses.Integral;
              case Tokens.BIN:
                return TypeClasses.Binary;
              case Tokens.STRING:
                return TypeClasses.String;
              default:
                return TypeClasses.Unknown;
            }
          })[0]!
        }
      };
      return ret;
    });

    this.type = $.RULE('type', (): Meta => {
      const source = $.CONSUME(Tokens.BASIC_TYPE);
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
        })[0]!
      };
    });

    this.performSelfAnalysis();
  }
}
