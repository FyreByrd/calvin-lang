import { EmbeddedActionsParser, type IToken } from 'chevrotain';
import * as Tokens from './lexer.js';

export type Stmt = {
  type: 'expr' | 'decl';
} & (({ type: 'expr' } & Expr) | ({ type: 'decl' } & Decl));

export type Decl = {
  id: IToken;
  expr?: Expr;
};

export type Expr = {
  value: Value;
  operator?: IToken;
  expr?: Expr;
  reversed?: boolean;
};
export type Value = {
  type: 'constant' | 'id' | 'expr';
  // TODO return types
} & (
  | { type: 'constant'; const: IToken }
  | { type: 'id'; id: IToken }
  | { type: 'expr'; expr: Expr }
);
export class CalvinParser extends EmbeddedActionsParser {
  public readonly file;
  private readonly statement;
  private readonly declaration;
  private readonly expression;
  private readonly value;
  private readonly constant;

  constructor() {
    super(Tokens.allTokens);

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
      return {
        id: $.CONSUME(Tokens.ID),
        expr: $.OPTION(() => {
          $.CONSUME(Tokens.EQU);
          return $.SUBRULE($.expression);
        })
      };
    });

    this.expression = $.RULE('expression', (): Expr => {
      const expr: Expr = { value: $.SUBRULE($.value) };
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
            return {
              type: 'expr',
              expr: {
                operator: $.OR1([...Tokens.unopTokens.map((t) => ({ ALT: () => $.CONSUME(t) }))]),
                value: $.SUBRULE1($.value)
              }
            };
          }
        },
        {
          ALT: () => {
            return { type: 'constant', const: $.SUBRULE($.constant) };
          }
        },
        {
          ALT: () => {
            return { type: 'id', id: $.CONSUME(Tokens.ID) };
          }
        },
        {
          ALT: () => {
            $.CONSUME(Tokens.LPAREN);
            const expr = $.SUBRULE($.expression);
            $.CONSUME(Tokens.RPAREN);
            return { type: 'expr', expr };
          }
        }
      ]);
    });

    this.constant = $.RULE('constant', () => {
      return $.OR([
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
    });

    this.performSelfAnalysis();
  }
}
