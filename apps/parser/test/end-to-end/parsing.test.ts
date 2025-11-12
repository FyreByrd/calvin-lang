import * as TestSubject from '@encode/parser/lib';
import { bold, dim, yellow } from '@std/fmt/colors';
import { walk } from '@std/fs';
import { toFileUrl } from '@std/path';
import { performParsingTestCase, useGlobalSettings } from '@/test/utils/mod.ts';

Deno.test('Loading & parsing', async (t) => {
  const snippetUrl = new URL(import.meta.resolve('./fixtures'));

  for await (const file of walk(snippetUrl)) {
    if (!(file.isFile && file.name.endsWith('.txt'))) {
      const warningMsg = [
        `${bold(yellow('Warning:'))} ${bold(file.name)} is not a .txt file.`,
        `${bold(dim('Skipping'))} ${dim(`${file.path}...`)}`,
      ].join('\n');
      console.warn(warningMsg);

      continue;
    }

    await t.step(file.name, async () => {
      using _globalSettings = useGlobalSettings({ debugTrees: false });

      const parser = new TestSubject.CalvinParser();

      const precedenceHandler = new TestSubject.PrecedenceHandler();

      const printer = new TestSubject.CalvinPrinter();

      const typeAnalyzer = new TestSubject.CalvinTypeAnalyzer();

      const _testCaseOutputs = performParsingTestCase({
        code: await Deno.readTextFile(toFileUrl(file.path)),
        parser,
        precedenceHandler,
        printer,
        typeAnalyzer,
      });

      // TODO - Add file-specific assertion logic
    });
  }
});
