import { EmbeddedActionsParser, type IToken } from 'chevrotain';
import * as Tokens from './lexer.js';

export type Expr = {
  value: Value;
  operator?: IToken;
  expr?: Expr;
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
      return $.OR([
        {
          ALT: () => {
            const expr = { value: $.SUBRULE($.value) } as Expr;
            $.OPTION(() => {
              expr.operator = $.OR1([
                ...Tokens.binopTokens.map((t) => ({ ALT: () => $.CONSUME(t) }))
              ]);
              expr.expr = $.SUBRULE($.expression);
              // TODO reorder based on precedence
            });
            return expr;
          }
        },
        {
          ALT: () => {
            // TODO postfix
            // TODO `not x in y` should be recognized as `(not x) in y`
            return {
              operator: $.OR2([...Tokens.unopTokens.map((t) => ({ ALT: () => $.CONSUME(t) }))]),
              value: $.SUBRULE1($.value)
            };
          }
        }
      ]);
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
