export class Globals {
  public static debugAll = false;

  private static _debugTrees = false;
  public static get debugTrees() {
    return this.debugAll || this._debugTrees;
  }
  public static set debugTrees(val: boolean) {
    this._debugTrees = val;
  }

  private static _debugScopes = false;
  public static get debugScopes() {
    return this.debugAll || this._debugScopes;
  }
  public static set debugScopes(val: boolean) {
    this._debugScopes = val;
  }
}
