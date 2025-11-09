export enum ANSIColor {
  // Dim colors
  Black = 30, // #000000
  Red = 31, // #aa0000
  Green = 32, // #00aa00
  Yellow = 33, // #aa5500
  Blue = 34, // #0000aa
  Magenta = 35, // #aa00aa
  Cyan = 36, // #00aaaa
  White = 37, // #aaaaaa
  // Bright colors
  BrightBlack = 90, // #555555
  BrightRed = 91, // #ff5555
  BrightGreen = 92, // #55ff55
  BrightYellow = 93, // #ffff55
  BrightBlue = 94, // #5555ff
  BrightMagenta = 95, // #ff55ff
  BrightCyan = 96, // #55ffff
  BrightWhite = 97, // #ffffff
  // Semantic colors
  Debug = Cyan,
  Warning = Yellow,
  Error = Red,
}

export function bg(color: ANSIColor): number {
  return color + 10;
}

export function color(color: ANSIColor, msg: string): string {
  return `\x1b[${color}m${msg}\x1b[0m`;
}

export type Logger = (msg: string) => void;

export function debug(
  msg: string,
  out: Logger = (msg) => console.log(color(ANSIColor.Debug, msg)),
) {
  out(msg);
}

export function warn(
  msg: string,
  out: Logger = (msg) => console.warn(color(ANSIColor.Warning, msg)),
) {
  out(`Warning: ${msg}`);
}
export function error(
  msg: string,
  out: Logger = (msg) => console.error(color(ANSIColor.Error, msg)),
) {
  out(`Error: ${msg}`);
}

export function prefix(str: string, len: number, ch: string = ' '): string {
  let i = 0;
  let pre = '';
  while (i++ < len) {
    pre += ch;
  }
  return pre + str;
}
