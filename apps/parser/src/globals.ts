/** biome-ignore-all lint/complexity/noStaticOnlyClass: Ignoring this as a temporary measure for now.
 * TODO discuss alternatives
 */
export class Globals {
  public static debugAll = false;

  private static _debugTrees = false;
  public static get debugTrees(): boolean {
    return Globals.debugAll || Globals._debugTrees;
  }
  public static set debugTrees(val: boolean) {
    Globals._debugTrees = val;
  }

  private static _debugScopes = false;
  public static get debugScopes(): boolean {
    return Globals.debugAll || Globals._debugScopes;
  }
  public static set debugScopes(val: boolean) {
    Globals._debugScopes = val;
  }
}
