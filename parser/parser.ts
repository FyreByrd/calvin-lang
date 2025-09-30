import { CstParser } from 'chevrotain';
import * as Tokens from './lexer.js';

//@typescript-eslint
export class CalvinParser extends CstParser {
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

    this.file = $.RULE('file', () => {
      $.MANY(() => {
        $.SUBRULE($.statement);
      });
    });

    this.statement = $.RULE('statement', () => {
      $.SUBRULE($.expression);
      $.CONSUME(Tokens.SEMI);
    });

    this.expression = $.RULE('expression', () => {
      $.SUBRULE($.value);
      $.OPTION(() => {
        $.OR([
          {
            ALT: () => {
              $.CONSUME(Tokens.N_COAL);
            }
          },
          {
            ALT: () => {
              $.CONSUME(Tokens.EE);
            }
          },
          {
            ALT: () => {
              $.CONSUME(Tokens.NE);
            }
          },
          {
            ALT: () => {
              $.CONSUME(Tokens.GE);
            }
          },
          {
            ALT: () => {
              $.CONSUME(Tokens.LE);
            }
          },
          {
            ALT: () => {
              $.CONSUME(Tokens.LT);
            }
          },
          {
            ALT: () => {
              $.CONSUME(Tokens.GT);
            }
          },
          {
            ALT: () => {
              $.CONSUME(Tokens.PLUS);
            }
          },
          {
            ALT: () => {
              $.CONSUME(Tokens.MINUS);
            }
          },
          {
            ALT: () => {
              $.CONSUME(Tokens.STAR);
            }
          },
          {
            ALT: () => {
              $.CONSUME(Tokens.SLASH);
            }
          },
          {
            ALT: () => {
              $.CONSUME(Tokens.MOD);
            }
          },
          {
            ALT: () => {
              $.CONSUME(Tokens.TILDE);
            }
          },
          {
            ALT: () => {
              $.CONSUME(Tokens.AMP);
            }
          },
          {
            ALT: () => {
              $.CONSUME(Tokens.PIPE);
            }
          },
          {
            ALT: () => {
              $.CONSUME(Tokens.CARET);
            }
          },
          {
            ALT: () => {
              $.CONSUME(Tokens.LSHIFT);
            }
          },
          {
            ALT: () => {
              $.CONSUME(Tokens.RSHIFT);
            }
          },
          {
            ALT: () => {
              $.CONSUME(Tokens.ASHIFT);
            }
          },
          {
            ALT: () => {
              $.CONSUME(Tokens.EQU);
            }
          }
        ]);
        $.SUBRULE($.expression);
      });
    });

    this.value = $.RULE('value', () => {
      $.OR([
        {
          ALT: () => {
            $.SUBRULE($.constant);
          }
        },
        {
          ALT: () => {
            $.CONSUME(Tokens.ID);
          }
        },
        {
          ALT: () => {
            $.CONSUME(Tokens.LPAREN);
            $.SUBRULE($.expression);
            $.CONSUME(Tokens.RPAREN);
          }
        }
      ]);
    });

    this.constant = $.RULE('constant', () => {
      $.OR([
        {
          ALT: () => {
            $.CONSUME(Tokens.BOOL);
          }
        },
        {
          ALT: () => {
            $.CONSUME(Tokens.CMPX);
          }
        },
        {
          ALT: () => {
            $.CONSUME(Tokens.REAL);
          }
        },
        {
          ALT: () => {
            $.CONSUME(Tokens.INT);
          }
        },
        {
          ALT: () => {
            $.CONSUME(Tokens.STRING);
          }
        }
      ]);
    });

    this.performSelfAnalysis();
  }
}
