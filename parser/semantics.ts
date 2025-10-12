import type { IToken } from 'chevrotain';

export enum TypeClasses {
  Unknown,
  Integral,
  Real,
  Complex,
  Boolean,
  Binary,
  String,
  Never
}

export const scope = new Map<string, { tok: IToken; meta: Meta }>();

export type Meta = {
  returnType: TypeClasses;
  source: IToken;
};
