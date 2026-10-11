#!/usr/bin/env node
// catalog: every repo I own on GitHub and Forgejo, scored for the video series.
//
//   node scripts/vlog/catalog.mjs            fetch repos, judge new ones, write the report
//   node scripts/vlog/catalog.mjs --rejudge  judge every repo again, ignoring the cache
//
// Facts (dates, commits, README, AI trailers) come from the APIs. Jev answers
// the judgment questions; the tier thresholds below turn its answers into a
// pick list. Verdicts are cached by repo and last push, so a rerun only pays
// for repos that changed. Everything lands in scripts/vlog/out/, which is
// git-ignored because it names private repos and this blog is public.

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const OUT = new URL('./out/', import.meta.url).pathname;
const GITHUB_OWNER = 'joe-lloyd';
const FORGEJO = 'https://git.home.arpa';
const FORGEJO_OWNERS = new Set(['joe', 'joe-lloyd']);
const TYPESAFE = 'https://api.typesafe.ai/v1/systemone';
const README_CHARS = 4000;
const AI_TRAILER = /co-authored-by:\s*(claude|codex|copilot)|generated with \[claude code\]/i;

// Policy. Raw scores stay on every row, so changing these needs no rejudge.
const HIDE_ABOVE = 0.5;
const tierOf = (r) => {
  if (r.verdict.keepOff > HIDE_ABOVE) return 'hidden';
  if (r.verdict.cv >= 2.3 && r.verdict.demo >= 1.5 && r.commits >= 40) return 'flagship';
  if (r.verdict.cv >= 1.5 && r.verdict.demo >= 1) return 'short';
  return 'roundup';
};

const QUESTIONS = {
  theme: {
    type: 'choice',
    instructions: 'What is the main theme of `repo`?',
    criteria: {
      homelab: 'Self-hosting, servers, networking, home infrastructure, automation of the home lab.',
      ai: 'AI tools, agents, LLM apps, image, voice or video generation, model serving.',
      'web-app': 'A web, desktop or mobile app for end users that is not mainly one of the other themes.',
      'dev-tools': 'Tools for developers: git clients, editors, CLIs, build tooling, browser extensions, templates.',
      games: 'Video games, game clones, game mods, tabletop and wargame tools.',
      data: 'Scrapers, data pipelines, datasets, dashboards over collected data.',
      learning: 'Tutorials, course work, exercises, boilerplates and small experiments made to learn.',
      other: 'None of the above fits.',
    },
  },
  cv: {
    type: 'score',
    instructions: 'How much would `repo` impress someone hiring a senior software engineer?',
    criteria: [
      'A tutorial, exercise, boilerplate or trivial script.',
      'A small working tool or experiment.',
      'A real project with a clear purpose and some engineering depth.',
      'An ambitious product: several parts, hard problems solved, finished enough to use.',
    ],
  },
  demo: {
    type: 'score',
    instructions: 'How well would `repo` show in a screen-recorded video demo?',
    criteria: [
      'Nothing visual: config, a library, or code that only runs in the background.',
      'Some output worth showing, such as a terminal run or a simple page.',
      'A clear, visual demo: an app, game or UI someone can watch being used.',
    ],
  },
  aiFeature: {
    type: 'noul',
    instructions: 'Is AI a core part of what `repo` does for its users?',
    criteria: {
      true: 'The product calls models, generates content, or runs agents as its main job.',
      false: 'AI is absent or incidental to what the product does.',
    },
  },
  keepOff: {
    type: 'noul',
    instructions: 'Would showing what `repo` does in a public video embarrass its owner or leak something?',
    criteria: {
      true: 'Adult or NSFW content, personal or family documents, or a codebase that belongs to an employer or client.',
      false: 'Anything else, including private hobby projects, home lab infrastructure and personal websites.',
    },
  },
};

const sh = (cmd, args, input) => execFileSync(cmd, args, { input, encoding: 'utf8', maxBuffer: 64 << 20 });
const secret = (path) => readFileSync(path.replace('~', homedir()), 'utf8').trim();
const readJson = (file, fallback) => (existsSync(join(OUT, file)) ? JSON.parse(readFileSync(join(OUT, file), 'utf8')) : fallback);
const writeJson = (file, data) => writeFileSync(join(OUT, file), JSON.stringify(data, null, 2));

const aiShare = (messages) => (messages.length ? messages.filter((m) => AI_TRAILER.test(m)).length / messages.length : 0);

// ---------------------------------------------------------------- GitHub

const GH_QUERY = `query($owner: String!, $after: String) {
  repositoryOwner(login: $owner) {
    repositories(first: 20, after: $after, ownerAffiliations: OWNER) {
      pageInfo { hasNextPage endCursor }
      nodes {
        name url description isPrivate isFork isArchived createdAt pushedAt
        primaryLanguage { name }
        readme: object(expression: "HEAD:README.md") { ... on Blob { text } }
        claudeMd: object(expression: "HEAD:CLAUDE.md") { id }
        agentsMd: object(expression: "HEAD:AGENTS.md") { id }
        defaultBranchRef { target { ... on Commit {
          history(first: 100) { totalCount nodes { message } }
        } } }
      }
    }
  }
}`;

function githubRepos() {
  const repos = [];
  for (let after = null, more = true; more; ) {
    const args = ['api', 'graphql', '-f', `query=${GH_QUERY}`, '-f', `owner=${GITHUB_OWNER}`];
    if (after) args.push('-f', `after=${after}`);
    const page = JSON.parse(sh('gh', args)).data.repositoryOwner.repositories;
    for (const n of page.nodes) {
      const history = n.defaultBranchRef?.target?.history;
      repos.push({
        name: n.name,
        links: [n.url],
        description: n.description ?? '',
        private: n.isPrivate,
        fork: n.isFork,
        archived: n.isArchived,
        created: n.createdAt.slice(0, 10),
        pushed: n.pushedAt?.slice(0, 10) ?? '',
        language: n.primaryLanguage?.name ?? '',
        readme: n.readme?.text ?? '',
        agentFile: Boolean(n.claudeMd || n.agentsMd),
        commits: history?.totalCount ?? 0,
        aiShare: aiShare((history?.nodes ?? []).map((c) => c.message)),
      });
    }
    more = page.pageInfo.hasNextPage;
    after = page.pageInfo.endCursor;
  }
  return repos;
}

// ---------------------------------------------------------------- Forgejo

const forgejoToken = () =>
  sh('git', ['credential', 'fill'], `protocol=https\nhost=${new URL(FORGEJO).host}\n\n`).match(/^password=(.*)$/m)[1];

async function forgejoRepos() {
  const token = forgejoToken();
  const get = (path) => fetch(`${FORGEJO}/api/v1${path}`, { headers: { Authorization: `token ${token}` } });
  const all = [];
  for (let page = 1; ; page++) {
    const batch = await (await get(`/user/repos?limit=50&page=${page}`)).json();
    all.push(...batch);
    if (batch.length < 50) break;
  }
  const own = all.filter((r) => FORGEJO_OWNERS.has(r.owner.login));
  return Promise.all(
    own.map(async (r) => {
      const base = `/repos/${r.full_name}`;
      const [readme, commitsRes, claudeMd, agentsMd] = await Promise.all([
        get(`${base}/raw/README.md`).then((x) => (x.ok ? x.text() : '')),
        get(`${base}/commits?limit=100&stat=false&verification=false&files=false`),
        get(`${base}/contents/CLAUDE.md`),
        get(`${base}/contents/AGENTS.md`),
      ]);
      const commits = commitsRes.ok ? await commitsRes.json() : [];
      return {
        name: r.name,
        links: [r.html_url],
        description: r.description ?? '',
        private: r.private,
        fork: r.fork,
        archived: r.archived,
        created: r.created_at.slice(0, 10),
        pushed: (r.updated_at ?? '').slice(0, 10),
        language: r.language ?? '',
        readme,
        agentFile: claudeMd.ok || agentsMd.ok,
        commits: Number(commitsRes.headers.get('x-total-count') ?? commits.length),
        aiShare: aiShare(commits.map((c) => c.commit.message)),
      };
    }),
  );
}

// Forgejo mirrors most GitHub repos, so the same project shows up twice.
function merge(lists) {
  const byName = new Map();
  for (const r of lists.flat()) {
    const key = r.name.toLowerCase();
    const seen = byName.get(key);
    if (!seen) {
      byName.set(key, r);
      continue;
    }
    const richer = r.commits > seen.commits ? r : seen;
    byName.set(key, {
      ...richer,
      links: [...seen.links, ...r.links],
      private: seen.private && r.private,
      fork: seen.fork || r.fork,
      readme: richer.readme || seen.readme || r.readme,
      description: richer.description || seen.description || r.description,
      agentFile: seen.agentFile || r.agentFile,
      aiShare: Math.max(seen.aiShare, r.aiShare),
      created: [seen.created, r.created].sort()[0],
      pushed: [seen.pushed, r.pushed].sort().at(-1),
    });
  }
  return [...byName.values()];
}

// ---------------------------------------------------------------- Jev

async function judge(repo, key) {
  const state = {
    repo: {
      name: repo.name,
      description: repo.description,
      language: repo.language,
      firstCommit: repo.created,
      lastPush: repo.pushed,
      commits: repo.commits,
      readme: repo.readme.slice(0, README_CHARS),
    },
  };
  const res = await fetch(TYPESAFE, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'jev-latest', state, questions: QUESTIONS }),
  });
  if (!res.ok) throw new Error(`TypeSafe ${res.status} for ${repo.name}: ${await res.text()}`);
  const { answers: a, model } = await res.json();
  return {
    model,
    theme: a.theme.choice,
    cv: a.cv.score,
    demo: a.demo.score,
    aiFeature: a.aiFeature.noul,
    keepOff: a.keepOff.noul,
  };
}

async function judgeAll(repos, rejudge) {
  const key = secret('~/.secrets/typesafe-api-key');
  const cache = rejudge ? {} : readJson('verdicts.json', {});
  const todo = repos.filter((r) => !cache[`${r.name}@${r.pushed}`]);
  console.log(`judging ${todo.length} of ${repos.length} repos`);
  const queue = [...todo];
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      for (let r; (r = queue.shift()); ) cache[`${r.name}@${r.pushed}`] = await judge(r, key);
    }),
  );
  writeJson('verdicts.json', cache);
  return repos.map((r) => ({ ...r, verdict: cache[`${r.name}@${r.pushed}`] }));
}

// ---------------------------------------------------------------- report

// The first prose paragraph of the README, minus markdown, as a one-line summary.
const summarise = (r) =>
  r.description ||
  (r.readme
    .split(/\n\s*\n/)
    .map((p) => p.replace(/<[^>]+>|!\[[^\]]*\]\([^)]*\)|[#*_`>]/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').trim())
    .find((p) => p.length > 40 && !p.startsWith('|')) ?? '').slice(0, 280);

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function render(rows) {
  const counts = Object.groupBy(rows, (r) => r.tier);
  const body = rows
    .map((r) => {
      const v = r.verdict;
      return `<tr data-tier="${r.tier}" data-theme="${v.theme}">
<td><b>${esc(r.name)}</b><br>${r.links.map((l) => `<a href="${esc(l)}">${new URL(l).host.split('.')[0]}</a>`).join(' ')}${r.private ? ' <i>private</i>' : ''}</td>
<td class="t-${r.tier}">${r.tier}</td><td>${v.theme}</td>
<td data-v="${v.cv}">${v.cv.toFixed(1)}</td><td data-v="${v.demo}">${v.demo.toFixed(1)}</td>
<td data-v="${r.aiShare}">${Math.round(r.aiShare * 100)}%${r.agentFile ? ' 🤖' : ''}${v.aiFeature > 0.5 ? ' ✨' : ''}</td>
<td data-v="${r.commits}">${r.commits}</td><td>${r.created}</td><td>${r.pushed}</td>
<td data-v="${v.keepOff}">${v.keepOff.toFixed(2)}</td>
<td class="sum">${esc(summarise(r))}</td></tr>`;
    })
    .join('\n');
  const opts = (vals) => ['all', ...vals].map((v) => `<option>${v}</option>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>byteMyFaceOff repo catalog</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font:14px/1.4 system-ui,sans-serif;margin:24px;background:#0f1115;color:#e6e6e6}
a{color:#7cc4ff}h1{margin:0 0 4px}p{color:#aaa;max-width:80ch}
table{border-collapse:collapse;width:100%}th,td{padding:6px 8px;border-bottom:1px solid #262a33;vertical-align:top;text-align:left}
th{cursor:pointer;position:sticky;top:0;background:#171a21;user-select:none}th:hover{color:#fff}
td.sum{color:#bbb;max-width:60ch}td:nth-child(8),td:nth-child(9){white-space:nowrap}i{color:#d9a34a;font-style:normal;font-size:12px}
.t-flagship{color:#ff6b9d;font-weight:600}.t-short{color:#7cc4ff}.t-roundup{color:#999}.t-hidden{color:#555}
tr[hidden]{display:none}select{background:#171a21;color:#e6e6e6;border:1px solid #333;padding:4px;margin-right:12px}
</style></head><body>
<h1>Repo catalog for the video series</h1>
<p>${rows.length} repos, forks left out. ${['flagship', 'short', 'roundup', 'hidden'].map((t) => `${counts[t]?.length ?? 0} ${t}`).join(', ')}.
Jev scored CV value 0 to 3, demo 0 to 2, and the chance a repo should stay off camera. AI is the share of the last 100 commits with an AI co-author trailer;
🤖 means the repo has a CLAUDE.md or AGENTS.md, ✨ means AI is the product. Generated ${new Date().toISOString().slice(0, 10)}.</p>
<p><label>Tier <select id="tier">${opts(['flagship', 'short', 'roundup', 'hidden'])}</select></label>
<label>Theme <select id="theme">${opts(Object.keys(QUESTIONS.theme.criteria))}</select></label></p>
<table><thead><tr><th>Repo</th><th>Tier</th><th>Theme</th><th>CV</th><th>Demo</th><th>AI</th><th>Commits</th><th>First</th><th>Last</th><th>Hide</th><th>Summary</th></tr></thead>
<tbody>${body}</tbody></table>
<script>
const tb=document.querySelector('tbody'),f=()=>{const t=tier.value,h=theme.value;
for(const r of tb.rows)r.hidden=(t!=='all'&&r.dataset.tier!==t)||(h!=='all'&&r.dataset.theme!==h)};
tier.onchange=theme.onchange=f;
document.querySelectorAll('th').forEach((th,i)=>th.onclick=()=>{const d=th.dataset.d=th.dataset.d==='1'?'-1':'1',
k=c=>c.dataset.v!==undefined?+c.dataset.v:c.textContent.toLowerCase();
[...tb.rows].sort((a,b)=>{const x=k(a.cells[i]),y=k(b.cells[i]);return(x>y?1:x<y?-1:0)*d*(typeof x==='number'?-1:1)}).forEach(r=>tb.append(r))});
</script></body></html>`;
}

// ---------------------------------------------------------------- main

mkdirSync(OUT, { recursive: true });
const repos = merge([githubRepos(), await forgejoRepos()]).filter((r) => !r.fork);
writeJson('repos.json', repos);
const judged = await judgeAll(repos, process.argv.includes('--rejudge'));
const rows = judged
  .map((r) => ({ ...r, tier: tierOf(r) }))
  .sort((a, b) => b.verdict.cv * 2 + b.verdict.demo - (a.verdict.cv * 2 + a.verdict.demo));
writeJson('catalog.json', rows.map(({ readme, ...r }) => r));
writeFileSync(join(OUT, 'catalog.html'), render(rows));
console.log(`wrote ${join(OUT, 'catalog.html')}`);
