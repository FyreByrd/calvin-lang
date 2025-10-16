import type { CstNode, ICstVisitor, IToken } from 'chevrotain';

export interface FileCstNode extends CstNode {
  name: 'file';
  children: FileCstChildren;
}

export type FileCstChildren = {
  statement?: StatementCstNode[];
};

export interface StatementCstNode extends CstNode {
  name: 'statement';
  children: StatementCstChildren;
}

export type StatementCstChildren = {
  LET?: IToken[];
  declaration?: DeclarationCstNode[];
  BREAK?: IToken[];
  CONTINUE?: IToken[];
  RETURN?: IToken[];
  expression?: ExpressionCstNode[];
  SEMI?: IToken[];
  IF?: IToken[];
  ifPredBody?: IfPredBodyCstNode[];
  ELIF?: IToken[];
  ELSE?: IToken[];
  body?: BodyCstNode[];
  DO?: IToken[];
  WHILE?: IToken[];
  FINALLY?: IToken[];
};

export interface IfPredBodyCstNode extends CstNode {
  name: 'ifPredBody';
  children: IfPredBodyCstChildren;
}

export type IfPredBodyCstChildren = {
  LPAREN: IToken[];
  LET?: IToken[];
  declaration?: DeclarationCstNode[];
  expression?: ExpressionCstNode[];
  RPAREN: IToken[];
  body: BodyCstNode[];
};

export interface BodyCstNode extends CstNode {
  name: 'body';
  children: BodyCstChildren;
}

export type BodyCstChildren = {
  LCURLY: IToken[];
  statement?: StatementCstNode[];
  RCURLY: IToken[];
};

export interface DeclarationCstNode extends CstNode {
  name: 'declaration';
  children: DeclarationCstChildren;
}

export type DeclarationCstChildren = {
  ID: IToken[];
  COLON?: IToken[];
  type?: TypeCstNode[];
  EQU?: IToken[];
  expression?: ExpressionCstNode[];
};

export interface ExpressionCstNode extends CstNode {
  name: 'expression';
  children: ExpressionCstChildren;
}

export type ExpressionCstChildren = {
  value: ValueCstNode[];
  INC?: IToken[];
  DEC?: IToken[];
  PL_EQU?: IToken[];
  MIN_EQU?: IToken[];
  ST_EQU?: IToken[];
  SL_EQU?: IToken[];
  MD_EQU?: IToken[];
  TL_EQU?: IToken[];
  AM_EQU?: IToken[];
  PI_EQU?: IToken[];
  CR_EQU?: IToken[];
  LS_EQU?: IToken[];
  RS_EQU?: IToken[];
  AS_EQU?: IToken[];
  NC_EQU?: IToken[];
  N_COAL?: IToken[];
  EE?: IToken[];
  NE?: IToken[];
  GE?: IToken[];
  LE?: IToken[];
  LT?: IToken[];
  GT?: IToken[];
  PLUS?: IToken[];
  MINUS?: IToken[];
  STAR?: IToken[];
  SLASH?: IToken[];
  MOD?: IToken[];
  TILDE?: IToken[];
  AMP?: IToken[];
  PIPE?: IToken[];
  CARET?: IToken[];
  LSHIFT?: IToken[];
  RSHIFT?: IToken[];
  ASHIFT?: IToken[];
  EQU?: IToken[];
  AND?: IToken[];
  OR?: IToken[];
  IN?: IToken[];
  expression?: ExpressionCstNode[];
};

export interface ValueCstNode extends CstNode {
  name: 'value';
  children: ValueCstChildren;
}

export type ValueCstChildren = {
  NOT?: IToken[];
  INC?: IToken[];
  DEC?: IToken[];
  value?: ValueCstNode[];
  constant?: ConstantCstNode[];
  ID?: IToken[];
  LPAREN?: IToken[];
  expression?: ExpressionCstNode[];
  RPAREN?: IToken[];
};

export interface ConstantCstNode extends CstNode {
  name: 'constant';
  children: ConstantCstChildren;
}

export type ConstantCstChildren = {
  STRING?: IToken[];
  BOOL?: IToken[];
  BIN?: IToken[];
  INT?: IToken[];
  CMPX?: IToken[];
  REAL?: IToken[];
};

export interface TypeCstNode extends CstNode {
  name: 'type';
  children: TypeCstChildren;
}

export type TypeCstChildren = {
  BASIC_TYPE: IToken[];
};

export interface ICstNodeVisitor<IN, OUT> extends ICstVisitor<IN, OUT> {
  file(children: FileCstChildren, param?: IN): OUT;
  statement(children: StatementCstChildren, param?: IN): OUT;
  ifPredBody(children: IfPredBodyCstChildren, param?: IN): OUT;
  body(children: BodyCstChildren, param?: IN): OUT;
  declaration(children: DeclarationCstChildren, param?: IN): OUT;
  expression(children: ExpressionCstChildren, param?: IN): OUT;
  value(children: ValueCstChildren, param?: IN): OUT;
  constant(children: ConstantCstChildren, param?: IN): OUT;
  type(children: TypeCstChildren, param?: IN): OUT;
}
