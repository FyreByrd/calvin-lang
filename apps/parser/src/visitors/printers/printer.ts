import type { Logger } from '@/src/logging.ts';
import { BaseCstVisitor } from '@/src/parser.ts';

export abstract class BasePrinter extends BaseCstVisitor {
  constructor(
    protected readonly colors: boolean = true,
    protected readonly output: Logger | null = console.log,
  ) {
    super();
    this.validateVisitor();
  }
}
