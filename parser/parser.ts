import { EmbeddedActionsParser, type IToken } from 'chevrotain';
import * as Tokens from './lexer.js';
import { error, warn } from './logging.js';
import { type Meta, Scope, TypeClasses } from './semantics.js';

export type Stmt =
  | IfPred
  | { type: 'body'; body: Stmt[] }
  | { type: 'empty' }
  | ({ type: 'if'; alts: IfStmt[]; else?: Stmt[] } & IfStmt);

type IfPred = ({ type: 'expr' } & Expr) | ({ type: 'decl' } & Decl);
type IfStmt = { pred: IfPred; body: Stmt[] };

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
  private readonly ifStatement;
  private readonly body;
  private readonly declaration;
  private readonly expression;
  private readonly value;
  private readonly constant;
  private readonly type;
  private _hasErrors: boolean;
  private _hasWarnings: boolean;
  private _scope: Scope;

  get hasErrors() {
    return this._hasErrors;
  }
  get hasWarnings() {
    return this._hasWarnings;
  }
  get scope() {
    return this._scope;
  }

  warn(msg: string) {
    this._hasWarnings = true;
    warn(msg);
  }

  error(msg: string) {
    this._hasErrors = true;
    error(msg);
  }

  constructor() {
    super(Tokens.allTokens);
    this._hasErrors = false;
    this._hasWarnings = false;
    this._scope = new Scope('ROOT');

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
      return $.OR([
        {
          ALT: () => {
            const ret = $.OPTION(
              (): Stmt =>
                $.OR1([
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
                ])
            );
            $.CONSUME(Tokens.SEMI);
            return (ret ?? { type: 'empty' }) satisfies Stmt;
          }
        },
        {
          ALT: () => {
            $.CONSUME(Tokens.IF);

            const { pred, body } = $.SUBRULE1($.ifStatement);

            const alts: IfStmt[] = [];

            $.MANY(() => {
              $.CONSUME(Tokens.ELIF);
              alts.push($.SUBRULE2($.ifStatement, { ARGS: ['elif'] }));
            });

            const optElse = $.OPTION1(() => {
              $.CONSUME(Tokens.ELSE);
              return $.SUBRULE3($.body, { ARGS: [true, 'else'] });
            });

            return {
              type: 'if',
              pred,
              body,
              alts,
              else: optElse?.body
            } satisfies Stmt;
          }
        },
        {
          ALT: () => $.SUBRULE($.body)
        }
      ]) satisfies Stmt;
    });

    this.ifStatement = $.RULE('ifStatement', (scopeName: string = 'if') => {
      $.CONSUME(Tokens.LPAREN);
      $.ACTION(() => {
        $._scope = $.scope.createChild(scopeName);
      });
      const pred = $.OR<IfPred>([
        {
          ALT: () => {
            $.CONSUME(Tokens.LET);
            return { type: 'decl', ...$.SUBRULE($.declaration) };
          }
        },
        {
          ALT: () => ({ type: 'expr', ...$.SUBRULE($.expression) })
        }
      ]);
      $.CONSUME(Tokens.RPAREN);

      const { body } = $.SUBRULE($.body, { ARGS: [false] });

      $.ACTION(() => {
        $._scope = $.scope.parent!;
      });

      return { pred, body } satisfies IfStmt;
    });

    this.body = $.RULE('body', (createNewScope: boolean = true, scopeName?: string) => {
      $.CONSUME(Tokens.LCURLY);
      $.ACTION(() => {
        if (createNewScope) $._scope = $.scope.createChild(scopeName ?? '{anonymous body}');
      });
      const body: Stmt[] = [];
      $.MANY(() => {
        body.push($.SUBRULE($.statement));
      });
      $.CONSUME(Tokens.RCURLY);
      $.ACTION(() => {
        if (createNewScope) $._scope = $._scope.parent!;
      });
      return { type: 'body', body };
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
        const search = $.scope.search(id.image);
        const existing = $.scope === search?.scope && search.found;
        if (search) {
          if (existing) {
            $.error(
              `variable ${id.image} originally defined on line ${existing.tok.startLine}, redefined on line ${id.startLine}!`
            );
          } else if (search.found) {
            $.warn(
              `variable ${id.image} on line ${id.startLine} shadows variable defined on line ${search.found.tok.startLine}`
            );
          }
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
          this.scope.set(id.image, { tok: id, meta });
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
                ...[...Tokens.compAssgnTokens, ...Tokens.binopTokens].map((t) => ({
                  ALT: () => $.CONSUME(t)
                }))
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
              const existing = this.scope.search(id.image);
              if (!existing) {
                $.error(`undeclared variable ${id.image} used on line ${id.startLine}`);
              }
              meta = existing?.found?.meta;
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
