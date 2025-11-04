import type { Logger } from '@/src/logging.ts';
import { BaseCstVisitor } from '@/src/parser.ts';

export abstract class Printer extends BaseCstVisitor {
  constructor(
    protected readonly output: Logger | null = console.log,
    protected readonly colors: boolean = true,
  ) {
    super();
    this.validateVisitor();
  }
}
