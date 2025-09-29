import { CstParser } from 'chevrotain';
import * as Tokens from './lexer.js';

//@typescript-eslint
export class CalvinParser extends CstParser {
  public readonly file;
  private readonly expression;
  private readonly value;
  private readonly constant;

  constructor() {
    super(Tokens.allTokens);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const $ = this;

    this.file = $.RULE('file', () => {
      $.MANY(() => {
        $.SUBRULE($.expression);
      });
    });

    this.expression = $.RULE('expression', () => {
      $.CONSUME(Tokens.ID);
      $.CONSUME(Tokens.EQU);
      $.SUBRULE($.value);
      $.CONSUME(Tokens.SEMI);
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
