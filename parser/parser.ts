import { EmbeddedActionsParser, type IToken } from 'chevrotain';
import * as Tokens from './lexer.js';

export type Expr = {
  value: Value;
  operator?: IToken;
  expr?: Expr;
};
export type Value = {
  type: 'constant' | 'id' | 'expr';
} & (
  | { type: 'constant'; const: IToken }
  | { type: 'id'; id: IToken }
  | { type: 'expr'; expr: Expr }
);
export class CalvinParser extends EmbeddedActionsParser {
  public readonly file;
  private readonly statement;
  private readonly expression;
  private readonly value;
  private readonly constant;

  constructor() {
    super(Tokens.allTokens, {
      maxLookahead: 5
    });

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const $ = this;

    this.file = $.RULE('file', (): Expr[] => {
      const res: Expr[] = [];
      $.MANY(() => {
        res.push($.SUBRULE($.statement));
      });
      return res;
    });

    this.statement = $.RULE('statement', () => {
      const expr = $.SUBRULE($.expression);
      $.CONSUME(Tokens.SEMI);
      return expr;
    });

    this.expression = $.RULE('expression', () => {
      const expr = { value: $.SUBRULE($.value) } as Expr;
      $.OPTION(() => {
        expr.operator = $.OR([
          {
            ALT: () => {
              return $.CONSUME(Tokens.N_COAL);
            }
          },
          {
            ALT: () => {
              return $.CONSUME(Tokens.EE);
            }
          },
          {
            ALT: () => {
              return $.CONSUME(Tokens.NE);
            }
          },
          {
            ALT: () => {
              return $.CONSUME(Tokens.GE);
            }
          },
          {
            ALT: () => {
              return $.CONSUME(Tokens.LE);
            }
          },
          {
            ALT: () => {
              return $.CONSUME(Tokens.LT);
            }
          },
          {
            ALT: () => {
              return $.CONSUME(Tokens.GT);
            }
          },
          {
            ALT: () => {
              return $.CONSUME(Tokens.PLUS);
            }
          },
          {
            ALT: () => {
              return $.CONSUME(Tokens.MINUS);
            }
          },
          {
            ALT: () => {
              return $.CONSUME(Tokens.STAR);
            }
          },
          {
            ALT: () => {
              return $.CONSUME(Tokens.SLASH);
            }
          },
          {
            ALT: () => {
              return $.CONSUME(Tokens.MOD);
            }
          },
          {
            ALT: () => {
              return $.CONSUME(Tokens.TILDE);
            }
          },
          {
            ALT: () => {
              return $.CONSUME(Tokens.AMP);
            }
          },
          {
            ALT: () => {
              return $.CONSUME(Tokens.PIPE);
            }
          },
          {
            ALT: () => {
              return $.CONSUME(Tokens.CARET);
            }
          },
          {
            ALT: () => {
              return $.CONSUME(Tokens.LSHIFT);
            }
          },
          {
            ALT: () => {
              return $.CONSUME(Tokens.RSHIFT);
            }
          },
          {
            ALT: () => {
              return $.CONSUME(Tokens.ASHIFT);
            }
          },
          {
            ALT: () => {
              return $.CONSUME(Tokens.EQU);
            }
          }
        ]);
        expr.expr = $.SUBRULE($.expression);
      });
      return expr;
    });

    this.value = $.RULE('value', (): Value => {
      return $.OR([
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
