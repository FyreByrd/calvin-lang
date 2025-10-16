import type { IToken } from 'chevrotain';
import { Globals } from './globals.js';
import { debug, prefix } from './logging.js';

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

export function printType(t: TypeClasses): string {
  switch (t) {
    case TypeClasses.Unknown:
      return 'unknown';
    case TypeClasses.Integral:
      return 'integer';
    case TypeClasses.Real:
      return 'real';
    case TypeClasses.Complex:
      return 'complex';
    case TypeClasses.Boolean:
      return 'boolean';
    case TypeClasses.Binary:
      return 'binary';
    case TypeClasses.String:
      return 'string';
    case TypeClasses.Never:
      return 'never';
  }
}

export type Meta = {
  returnType: TypeClasses;
  source: IToken;
};

type ScopeData = { tok: IToken; meta: Meta };
type ScopeSearch = { scope: Scope; found?: ScopeData };

export class Scope {
  public readonly name: string;
  private readonly map;
  private _parent: Scope | undefined;
  private children: Scope[];
  constructor(name: string, parent?: Scope) {
    this.name = name;
    this._parent = parent;
    this.map = new Map<string, ScopeData>();
    this.children = [];
  }

  get parent() {
    return this._parent;
  }

  public get(key: string) {
    return this.map.get(key);
  }

  public search(key: string): ScopeSearch | undefined {
    let ret: ScopeSearch | undefined = {
      scope: this,
      found: this.get(key)
    };
    if (!ret.found) {
      ret = this.parent?.search(key);
    }
    return ret;
  }

  public set(key: string, value: ScopeData) {
    return this.map.set(key, value);
  }

  public createChild(name: string) {
    const scope = new Scope(name, this);
    this.children.push(scope);
    return scope;
  }

  public print(indent: number = 0) {
    if (Globals.debugScopes) {
      debug(
        prefix(
          `SCOPE: ${this.name} (parent: ${this.parent?.name ?? 'None'}, symbols: ${this.map.size}, children: ${this.children.length})`,
          indent
        )
      );
      this.map.values().forEach((v) => {
        debug(
          prefix(
            `${v.tok.image} on line ${v.tok.startLine}: ${printType(v.meta.returnType)} (from ${v.meta.source.image} on line ${v.meta.source.startLine})`,
            indent + 2
          )
        );
      });
      console.log('');
      this.children.forEach((c) => c.print(indent + 2));
    }
  }

  public reset(): Scope {
    if (this.parent) {
      return this.parent.reset();
    } else {
      this.resetHelp();
      return this;
    }
  }
  private resetHelp() {
    this.children.forEach((c) => c.resetHelp());
    this.children = [];
    this.map.clear();
  }
}
}
