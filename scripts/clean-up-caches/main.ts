import { context, getOctokit } from '@actions/github';
import { assertExists } from '@std/assert';

export async function main(): Promise<void> {
  const token = Deno.env.get('GITHUB_TOKEN');
  assertExists(token);

  const github = getOctokit(token);
  const actions = github.rest.actions;

  const {
    data: { actions_caches: caches },
  } = await actions.getActionsCacheList({
    ...context.repo,
    ref: context.ref,
  });

  console.debug({ caches });

  // const cacheDeletionReqs = caches.flatMap(({ id }) => {
  //   if (!id) return [];

  //   return actions.deleteActionsCacheById({ ...context.repo, cache_id: id });
  // });

  // await Promise.all(cacheDeletionReqs);
}

if (import.meta.main) {
  await main();
}
