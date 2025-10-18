import { Globals } from "./globals.ts";

export function debug(msg: string) {
  console.log('\x1b[36m%s\x1b[0m', msg);
}

export function warn(msg: string) {
  console.warn('\x1b[33mWarning: %s\x1b[0m', msg);
}
export function error(msg: string) {
  console.error('\x1b[31mError: %s\x1b[0m', msg);
}

export function tree(msg: string, indent: number) {
  if (Globals.debugTrees) {
    console.log('\x1b[%dm%s\x1b[0m', 91 + ((indent / 2) % 7), prefix(msg, indent));
  }
}

export function prefix(str: string, len: number, ch: string = ' ') {
  let i = 0;
  let pre = '';
  while (i++ < len) {
    pre += ch;
  }
  return pre + str;
}
