import { getInput } from '@actions/core';
import { context, getOctokit } from '@actions/github';

export async function main(): Promise<void> {
  const github = getOctokit(getInput('token', { required: true }));
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
