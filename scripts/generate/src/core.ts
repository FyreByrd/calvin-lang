import type { BaseParser } from 'chevrotain';

export interface GenerationParams {
  outputPath: URL;
  parser: BaseParser;
  signal?: AbortSignal;
}

export interface WriteTextFileAtPathParams {
  outputPath: URL;
  data: string | ReadableStream<string>;
  dirOptions?: Deno.MkdirOptions;
  textFileOptions?: Deno.WriteFileOptions;
}

export async function writeTextFileAtPath({
  outputPath,
  data,
  dirOptions,
  textFileOptions,
}: WriteTextFileAtPathParams): Promise<void> {
  const enclosingDir = new URL('./', outputPath);
  await Deno.mkdir(enclosingDir, { recursive: true, ...dirOptions });

  await Deno.writeTextFile(outputPath, data, textFileOptions);
}
