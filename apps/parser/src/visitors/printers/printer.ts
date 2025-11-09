import type { Logger } from '@/src/logging.ts';
import { BaseCstVisitor } from '@/src/parser.ts';

export abstract class BasePrinter extends BaseCstVisitor {
  constructor(
    protected readonly colors: boolean = true,
    protected _output: Logger | null = console.log,
  ) {
    super();
    this.validateVisitor();
  }

  public get output() {
    return this._output;
  }

  public setOutput(output: Logger | null) {
    this._output = output;
  }
}
