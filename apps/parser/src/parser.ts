import { type CstNode, CstParser, type ParserMethod } from 'chevrotain';
import * as Tokens from "./lexer.ts";

export class CalvinParser extends CstParser {
  constructor() {
    super(Tokens.allTokens);
    this.performSelfAnalysis();
  }

  public file: ParserMethod<[], CstNode> = this.RULE('file', () => {
    this.MANY(() => this.SUBRULE(this.statement));
  });

  private statement = this.RULE('statement', () => {
    this.OR([
      {
        ALT: () => {
          this.OPTION(() =>
            this.OR1([
              {
                ALT: () => {
                  this.CONSUME(Tokens.LET);
                  this.SUBRULE(this.declaration);
                }
              },
              {
                ALT: () => this.CONSUME(Tokens.BREAK)
              },
              {
                ALT: () => this.CONSUME(Tokens.CONTINUE)
              },
              {
                ALT: () => {
                  this.CONSUME(Tokens.RETURN);
                  this.OPTION2(() => this.SUBRULE(this.expression));
                }
              },
              {
                ALT: () => this.SUBRULE2(this.expression)
              }
            ])
          );
          this.CONSUME(Tokens.SEMI);
        }
      },
      {
        ALT: () => {
          this.CONSUME(Tokens.IF);

          this.SUBRULE1(this.ifPredBody);

          this.MANY(() => {
            this.CONSUME(Tokens.ELIF);
            this.SUBRULE2(this.ifPredBody);
          });

          this.OPTION1(() => {
            this.CONSUME(Tokens.ELSE);
            this.SUBRULE3(this.body);
          });
        }
      },
      {
        ALT: () => {
          this.OPTION3(() => {
            this.CONSUME(Tokens.DO);
            this.SUBRULE4(this.body);
          });

          this.CONSUME(Tokens.WHILE);
          this.SUBRULE3(this.expression);
          this.OR2([
            {
              ALT: () => {
                this.CONSUME2(Tokens.SEMI);
              }
            },
            {
              ALT: () => this.SUBRULE5(this.body)
            }
          ]);

          this.OPTION4(() => {
            this.CONSUME(Tokens.FINALLY);
            this.SUBRULE6(this.body);
          });
        }
      },
      {
        ALT: () => this.SUBRULE(this.body)
      }
    ]);
  });

  private ifPredBody = this.RULE('ifPredBody', () => {
    this.CONSUME(Tokens.LPAREN);
    this.OR([
      {
        ALT: () => {
          this.CONSUME(Tokens.LET);
          this.SUBRULE(this.declaration);
        }
      },
      {
        ALT: () => this.SUBRULE(this.expression)
      }
    ]);
    this.CONSUME(Tokens.RPAREN);

    this.SUBRULE(this.body);
  });

  private body = this.RULE('body', () => {
    this.CONSUME(Tokens.LCURLY);
    this.MANY(() => this.SUBRULE(this.statement));
    this.CONSUME(Tokens.RCURLY);
  });

  private declaration = this.RULE('declaration', () => {
    this.CONSUME(Tokens.ID);
    this.OPTION(() => {
      this.CONSUME(Tokens.COLON);
      this.SUBRULE(this.type);
    });
    this.OPTION1(() => {
      this.CONSUME(Tokens.EQU);
      this.SUBRULE(this.expression);
    });
  });

  private expression = this.RULE('expression', () => {
    this.SUBRULE(this.value);
    this.OR([
      {
        ALT: () => this.CONSUME(Tokens.PostFix)
      },
      {
        ALT: () => {
          this.OPTION(() => {
            this.OR2([
              {
                ALT: () => this.CONSUME(Tokens.CmpAsgn)
              },
              {
                ALT: () => this.CONSUME(Tokens.BinOp)
              }
            ]);
            this.SUBRULE(this.expression);
            // TODO reorder based on precedence
          });
        }
      }
    ]);
  });

  private value = this.RULE('value', () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(Tokens.UnOp);
          this.SUBRULE1(this.value);
        }
      },
      {
        ALT: () => this.SUBRULE(this.constant)
      },
      {
        ALT: () => this.CONSUME(Tokens.ID)
      },
      {
        ALT: () => {
          this.CONSUME(Tokens.LPAREN);
          this.SUBRULE(this.expression);
          this.CONSUME(Tokens.RPAREN);
        }
      }
    ]);
  });

  private constant = this.RULE('constant', () =>
    this.OR(Tokens.literals.map((t) => ({ ALT: () => this.CONSUME(t) })))
  );

  private type = this.RULE('type', () => this.CONSUME(Tokens.BASIC_TYPE));
}

export const parser: CalvinParser = new CalvinParser();
export const BaseCstVisitor: ReturnType<typeof parser.getBaseCstVisitorConstructor> = parser.getBaseCstVisitorConstructor();
export const BaseCstVisitorWithDefaults: ReturnType<typeof parser.getBaseCstVisitorConstructorWithDefaults> = parser.getBaseCstVisitorConstructorWithDefaults();
