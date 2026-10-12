// Git Gud overview (DEVBLOG-11): the script and the demo that plays under each line.
//
// `say` is the narration, one sentence or two per line. `do` runs in Git Gud when that
// line starts (see ../../record.mjs). Sections with `footage: false` are overlays only.
// Paths are for Jellybingus, where the demos are recorded.
import { execFileSync } from 'node:child_process';

const HOME = process.env.USERPROFILE ?? process.env.HOME;
const REPOS = `${HOME}\\vlog\\repos`;
const BASH = 'C:\\Program Files\\Git\\bin\\bash.exe';
const posix = (p) => p.replace(/^([A-Z]):/, (_, d) => '/' + d.toLowerCase()).replaceAll('\\', '/');
const EPISODE = new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

const repo = (name) => `${REPOS}\\${name}`;
const freshPets = () => execFileSync(BASH, ['-lc', `bash '${posix(EPISODE)}demo-repo.sh' '${posix(REPOS)}'`], { stdio: 'ignore' });
const freshLab = () => {
  const gg = posix(`${HOME}\\Projects\\MyProjects\\git-gud`);
  execFileSync(BASH, ['-lc', `sed 's/\\r$//' ${gg}/scripts/conflict-lab.sh > /tmp/lab.sh && OUT='${posix(REPOS)}/lab' bash /tmp/lab.sh rebase`], { stdio: 'ignore' });
};

const row = (ctx, message) => ctx.win.getByText(message, { exact: true }).first();
const button = (ctx, text) => ctx.win.locator('button', { hasText: text }).first();
const graph = { x: 0.45, y: 0.5 };
const closeConsole = async (ctx) => {
  for (let i = 0; i < 4; i++) {
    await ctx.wait(700);
    if (await ctx.win.locator('.cdock-title').first().isVisible().catch(() => false)) await ctx.win.getByTitle('Toggle console').click();
  }
};
const diffRow = (ctx, text) => ctx.win.locator('tr.diff-line-add', { hasText: text }).first();

const STATS = 'Since 3 April 2026';

export default {
  title: 'Git Gud: the git client that hides nothing',
  ticket: 'DEVBLOG-11',
  // Joe's voice, cloned from his own mic take (a reading of the script) that stays on Jellybingus (see ../../voice/README.md).
  voice: { engine: 'chatterbox', ref: 'joe-mic', cfg: 0.5, image: 'nsfwgen-tts' },
  app: {
    dir: `${HOME}\\Projects\\MyProjects\\git-gud`,
    env: (profile) => ({ GITGUD_USER_DATA: profile }),
  },
  context: { REPOS },
  async openRepo(ctx, name) {
    await ctx.app.evaluate(({ dialog }, p) => {
      dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [p] });
    }, repo(name));
    await ctx.win.keyboard.press('Control+o');
    await ctx.win.waitForTimeout(2500);
  },

  sections: [
    {
      id: 'cold-open',
      title: 'Cold open',
      open: ['pixel-pets', 'express'],
      prepare: freshPets,
      setup: closeConsole,
      lines: [
        { say: 'This is six and a half thousand commits of Express, and it scrolls like it has sixty.', do: (ctx) => ctx.scroll(graph.x, graph.y, 60000, 5000) },
        { say: 'Every branch gets its own lane and its own colour.', do: async (ctx) => { await ctx.win.keyboard.press('Home'); await ctx.click(ctx.win.locator('.tab', { hasText: 'pixel-pets' }).first()).catch(() => ctx.click(ctx.win.getByText('pixel-pets', { exact: true }).first())); } },
        { say: 'Every command it runs, you can read.', do: (ctx) => ctx.win.getByTitle('Toggle console').click() },
        { say: "And the whole thing exists because I got annoyed at a git client. So I built my own, with an AI agent doing most of the typing.", do: (ctx) => ctx.fx('TitleCard', { title: 'Git Gud', subtitle: 'the git client that hides nothing', background: '#0B0D14', accentColor: '#F5276C', textColor: '#FFFFFF' }, { seconds: 6 }) },
      ],
    },

    {
      id: 'why',
      title: 'Why another git client',
      open: ['pixel-pets'],
      prepare: freshPets,
      setup: closeConsole,
      lines: [
        { say: "So, why build another git client? There are loads of them, and some are really good.", do: (ctx) => ctx.scroll(graph.x, graph.y, 400, 3000) },
        { say: 'My problem was that they all hide what git is actually doing.' },
        { say: "You press a button, something happens, and when it goes wrong you're on your own in a terminal, guessing what the button did.", do: (ctx) => ctx.scroll(graph.x, graph.y, -400, 3000) },
        { say: 'I wanted the opposite. So I gave it three rules.', do: (ctx) => ctx.fx('CardList', { title: 'Three rules', items: 'Show me the whole history\nNever hide what git is doing\nReach my repos wherever they live', reveal: [ctx.when(1, 'Show me'), ctx.when(1, 'Never hide'), ctx.when(1, 'And let me')].join(','), layout: 'column', firstNumber: 1, backdrop: 0.93 }, { lines: 3 }) },
        { say: 'Show me the whole history. Never hide what git is doing. And let me reach my repos wherever they live.' },
        { say: 'Everything in this video comes back to one of those three.' },
        { say: "There was a second reason too. I wanted to find out how far I could get by directing an AI agent instead of writing the code myself. We'll get to that at the end." },
      ],
    },

    {
      id: 'graph',
      title: 'The graph',
      open: ['express', 'pixel-pets'],
      prepare: freshPets,
      setup: closeConsole,
      lines: [
        { say: 'Everything starts with the graph.' },
        { say: 'Each branch is a lane, and each lane keeps its colour all the way down, so you can follow it with your eye.', do: (ctx) => ctx.callout(row(ctx, 'wip(sleep): snoring'), 'feature/sleep has its own lane', { at: 'left' }) },
        { say: 'Branches and tags sit on the commits they point at.', do: (ctx) => ctx.highlight(ctx.win.locator('.ref-pill, [class*="pill"]', { hasText: 'v0.2.0' }).first(), 'tag') },
        { say: 'Stashes hang off the commit they came from, as these little diamonds. So you stop forgetting them.', do: (ctx) => ctx.callout(row(ctx, 'On main: half-done sound effects'), 'a stash you forgot about'), zoom: { on: (ctx) => row(ctx, 'On main: half-done sound effects'), zoom: 1.6 } },
        { say: 'And the row at the top is your uncommitted work. It updates live while you edit files.', do: (ctx) => ctx.highlight(ctx.win.getByText(/^Uncommitted changes/).first(), 'live'), zoom: { on: (ctx) => ctx.win.getByText(/^Uncommitted changes/).first(), zoom: 1.6 } },
        { say: 'Down the left side you get every branch, remote, stash, worktree and tag.', do: (ctx) => ctx.spotlight(ctx.win.locator('aside, .sidebar, [class*="sidebar"]').first()) },
        { say: 'Click one, and the graph jumps straight to it.', do: (ctx) => ctx.click(ctx.win.getByText('fix/hunger-overflow', { exact: true }).first()) },
        { say: "Worktrees get their own section, because I use them all the time. Every agent I run gets its own checkout, so they don't trip over each other." },
        { say: 'Now, small repos are easy. The hard part is a big one.', do: (ctx) => ctx.click(ctx.win.getByText('express', { exact: true }).first()) },
        { say: "This is Express again. Six and a half thousand commits, years of merges.", do: (ctx) => ctx.scroll(graph.x, graph.y, 20000, 4000) },
        { say: 'The rows are virtualised, the lanes are drawn on a canvas, and the layout runs in a web worker. So the interface never waits for the maths.', do: (ctx) => ctx.scroll(graph.x, graph.y, 40000, 5000) },
        { say: "Getting that smooth had its own spec, with numbers it had to hit. I'll show you what a spec looks like later." },
        { say: 'And when you need to find something, search covers messages, authors and hashes.', do: async (ctx) => { await ctx.click(ctx.win.getByTitle('Search commits')); await ctx.wait(400); await ctx.win.keyboard.type('router', { delay: 90 }); } },
        { say: 'Enter jumps to the next match.', do: async (ctx) => { await ctx.win.keyboard.press('Enter'); await ctx.wait(900); await ctx.win.keyboard.press('Enter'); await ctx.wait(900); await ctx.win.keyboard.press('Escape'); } },
      ],
    },

    {
      id: 'staging',
      title: 'Staging and diffs',
      open: ['pixel-pets'],
      prepare: freshPets,
      setup: closeConsole,
      lines: [
        { say: "A pretty graph isn't worth much if you still drop to the terminal for real work. So the everyday stuff lives here too." },
        { say: 'Click a changed file and you get the diff.', do: (ctx) => ctx.click(ctx.win.locator('.wt-file-path', { hasText: 'src/pet.ts' }).first()) },
        { say: 'You can stage the whole file, one hunk at a time, or a single line.', do: (ctx) => ctx.highlight(button(ctx, 'Stage chunk'), 'one hunk') },
        { say: "Here I only want the new mood type, not the rest. So I stage just that hunk.", do: (ctx) => ctx.click(button(ctx, 'Stage chunk')) },
        { say: 'And here, one line. Click the gutter, and that line alone goes in.', do: async (ctx) => { const sign = diffRow(ctx, 'moodFor').locator('td.diff-sign'); await ctx.callout(sign, 'click to stage one line'); await ctx.wait(1200); await ctx.click(sign); }, zoom: { on: (ctx) => diffRow(ctx, 'pet.hunger > 70'), zoom: 1.8 } },
        { say: "That's what git add dash p does, without the guessing in a terminal prompt." },
        { say: 'Word diff shows exactly which characters changed, not just which lines.', do: (ctx) => ctx.click(ctx.win.getByTitle('Toggle word-level diff')), zoom: { on: (ctx) => ctx.win.locator('tr', { hasText: 'feels' }).filter({ visible: true }).first(), zoom: 1.8 } },
        { say: 'And side by side, when you want the old and the new next to each other.', do: async (ctx) => { await ctx.click(ctx.win.getByTitle('Toggle word-level diff')); await ctx.wait(500); await ctx.click(ctx.win.getByTitle('Toggle side-by-side view')); } },
        { say: 'Then you commit. A subject, a description if you want one, and the options I actually use.', do: async (ctx) => { await ctx.click(ctx.win.getByTitle('Toggle side-by-side view')); await ctx.click(ctx.win.locator('input.wt-commit-subject')); await ctx.win.keyboard.type('feat: pets get a mood', { delay: 70 }); }, zoom: { on: (ctx) => ctx.win.locator('input.wt-commit-subject'), zoom: 1.9, lines: 3 } },
        { say: 'Amend, skip the hooks, or sign off.', do: (ctx) => ctx.highlight(ctx.win.locator('label.wt-amend-toggle')) },
        { say: 'Control Enter, and it is in.', do: (ctx) => ctx.key('Ctrl+Enter', 'Commit') },
      ],
    },

    {
      id: 'history',
      title: 'Rewriting history',
      open: ['pixel-pets'],
      prepare: freshPets,
      setup: closeConsole,
      lines: [
        { say: 'Now the fun part. Rewriting history.' },
        { say: "Look at these three commits. Wip, wip again, fix typo. I don't want anyone to see that.", do: (ctx) => ctx.callout(row(ctx, 'wip again'), 'nobody needs to see these'), zoom: { on: (ctx) => row(ctx, 'wip again'), zoom: 1.5 } },
        { say: 'Right-click any commit, and the whole toolbox is there. Cherry-pick, revert, reset, rebase.', do: (ctx) => ctx.click(row(ctx, 'feat: tick config'), { button: 'right' }) },
        { say: 'Interactive rebase opens as a list, instead of a text file in vim.', do: (ctx) => ctx.click(ctx.win.getByText('Interactive rebase from here…')) },
        { say: 'Click an action to change it. Pick, reword, squash, fix up, or drop. And drag rows to reorder them.', do: async (ctx) => { const b = ctx.win.locator('button.ir-action'); const n = await b.count(); for (let i = 0; i < Math.min(2, n); i++) { await ctx.click(b.nth(i)); await ctx.wait(500); await ctx.click(b.nth(i)); await ctx.wait(500); } }, zoom: { on: (ctx) => ctx.win.locator('button.ir-action').first(), zoom: 1.6 } },
        { say: "If you've ever fought with a rebase todo file, this is the version for humans.", do: (ctx) => ctx.click(button(ctx, 'Cancel')) },
        { say: "But for my three ugly commits there's something quicker. Click the first, shift click the last.", do: async (ctx) => { await ctx.click(row(ctx, 'wip')); await ctx.wait(500); await ctx.click(row(ctx, 'fix typo'), { modifiers: ['Shift'] }); } },
        { say: 'Squash, and they become one commit.', do: (ctx) => ctx.click(ctx.win.getByTitle('Combine into one commit')) },
        { say: 'It keeps the first message, so I tick amend and give it a proper name.', do: async (ctx) => { await ctx.click(ctx.win.getByText(/^Uncommitted changes/).first()); await ctx.wait(600); await ctx.click(ctx.win.locator('label.wt-amend-toggle')); const subject = ctx.win.locator('input.wt-commit-subject'); await ctx.click(subject); await ctx.win.keyboard.press('Control+a'); await ctx.win.keyboard.type('feat: game config', { delay: 60 }); await ctx.wait(300); await ctx.win.keyboard.press('Control+Enter'); } },
        { say: 'This is the kind of thing I used to look up every single time. Now it is two clicks, and I can see what happened.' },
      ],
    },

    {
      id: 'sync',
      title: 'Syncing',
      open: ['pixel-pets'],
      prepare: freshPets,
      setup: closeConsole,
      lines: [
        { say: 'Talking to the remote is the part people get scared of, so the toolbar keeps it honest.' },
        { say: 'Pull and push show how many commits are waiting each way. Here, someone pushed a licence I do not have yet.', do: (ctx) => ctx.highlight(ctx.win.getByTitle('Pull from remote (right-click for options)'), '1 to pull'), zoom: { on: (ctx) => ctx.win.getByTitle('Pull from remote (right-click for options)'), zoom: 2.0 } },
        { say: 'And the commit sits in the graph already, on the remote branch, so I can see what I am about to pull before I pull it.', do: (ctx) => ctx.callout(row(ctx, 'chore: add licence'), 'only on origin') },
        { say: 'Pull has options, because pulling is never just one thing. Merge, rebase, or fast forward only.', do: (ctx) => ctx.click(ctx.win.getByTitle('Pull options…')), zoom: { on: (ctx) => ctx.win.getByTitle('Pull options…'), zoom: 1.8, lines: 2 } },
        { say: 'I pick fast forward only most of the time. If it cannot fast forward, I want to know, not get a surprise merge commit.' },
        { say: 'Pull. Done. And if a push gets rejected because someone got there first, it tells you why, and what to do next.', do: async (ctx) => { await ctx.win.keyboard.press('Escape'); await ctx.wait(300); await ctx.click(ctx.win.getByTitle('Pull from remote (right-click for options)')); } },
      ],
    },

    {
      id: 'worktrees',
      title: 'Worktrees and agents',
      open: ['test\\alpha'],
      prepare: () => execFileSync(BASH, ['-lc', `sed 's/\\r$//' ${posix(HOME)}/Projects/MyProjects/git-gud/scripts/build-test-repos.sh > /tmp/btr.sh && OUT='${posix(REPOS)}/test' bash /tmp/btr.sh`], { stdio: 'ignore' }),
      setup: closeConsole,
      lines: [
        { say: 'Quick detour, because this changed how I work. Worktrees.' },
        { say: 'A worktree is a second checkout of the same repo, on another branch, in another folder. No stashing, no switching.', do: (ctx) => ctx.spotlight(ctx.win.getByText('Worktrees', { exact: false }).first().locator('xpath=ancestor::*[2]')) },
        { say: 'When I run AI agents, each one gets its own worktree. One fixes a bug on a hotfix branch, another builds a feature, and they never touch each other.', do: (ctx) => ctx.callout(ctx.win.getByText('hotfix/perf', { exact: true }).last(), 'one agent here') },
        { say: 'Git Gud lists every worktree, and hovering a branch tells you which worktree has it checked out.', do: (ctx) => ctx.win.getByText('feature/cart', { exact: true }).first().hover() },
        { say: 'The graph marks which branches are checked out somewhere else, so I do not try to switch to one and get an error.' },
      ],
    },

    {
      id: 'conflicts',
      title: 'Conflicts',
      open: ['lab\\rebase'],
      prepare: freshLab,
      setup: closeConsole,
      lines: [
        { say: 'And when a rebase goes wrong, which it will, you get this.', do: (ctx) => ctx.highlight(ctx.win.getByText('REBASE IN PROGRESS').first(), '', { seconds: 3 }) },
        { say: 'A banner so you never forget you are mid-rebase, and a list of every file that needs you.', do: (ctx) => ctx.spotlight(ctx.win.getByText('REBASE CONFLICT').locator('xpath=ancestor::*[3]')) },
        { say: 'Open a file, and it walks you through each conflict, one block at a time.', do: (ctx) => ctx.click(ctx.win.getByText('src/app.ts', { exact: true }).last()) },
        { say: 'For every block you choose. Use current, use incoming, or use both.', do: async (ctx) => { await ctx.highlight(button(ctx, 'Use current')); await ctx.wait(1500); await ctx.click(button(ctx, 'Use incoming')); }, zoom: { on: (ctx) => button(ctx, 'Use incoming'), zoom: 1.6, lines: 2 } },
        { say: 'Next block, same again.', do: async (ctx) => { const next = ctx.win.getByTitle('Next block'); if (await next.isEnabled().catch(() => false)) await ctx.click(next); await ctx.wait(600); await ctx.click(button(ctx, 'Use both')); } },
        { say: 'Save, and it is marked resolved.', do: (ctx) => ctx.click(button(ctx, 'Save & Mark Resolved')) },
        { say: 'It can also record how you solved it, with git rerere. So when the same conflict comes back, and it always comes back, it is already solved.' },
        { say: 'Do the same for the other two files, then continue the rebase, and you are done.', do: (ctx) => ctx.highlight(button(ctx, 'Continue rebase')) },
      ],
    },

    {
      id: 'safety-net',
      title: 'The safety net',
      open: ['pixel-pets'],
      prepare: freshPets,
      setup: async (ctx) => { await ctx.win.getByText('Uncommitted changes', { exact: false }).first().isVisible(); },
      lines: [
        { say: "Now let's break something on purpose. I'll throw away my last two commits with a hard reset, right from the built-in console.", do: async (ctx) => { const input = ctx.win.getByPlaceholder('Run a command at the worktree root…'); await ctx.click(input); await ctx.win.keyboard.type('git reset --hard HEAD~2', { delay: 60 }); }, zoom: { on: (ctx) => ctx.win.getByPlaceholder('Run a command at the worktree root…'), zoom: 1.8, lines: 2 } },
        { say: 'Enter. And they are gone.', do: (ctx) => ctx.win.keyboard.press('Enter') },
        { say: "Except nothing in git is really gone. Not for a while, anyway. That's what the reflog is for.", do: (ctx) => ctx.click(ctx.win.getByTitle('Reflog — recover lost commits')) },
        { say: 'Every place your branch has been, in order, with a restore button.', do: (ctx) => ctx.spotlight(ctx.win.locator('.reflog-panel')) },
        { say: 'Find the moment before the mistake, restore, and carry on.', do: async (ctx) => { const before = ctx.win.locator('.reflog-row').nth(1); await ctx.click(before); await ctx.wait(500); await ctx.click(before.locator('button.reflog-btn', { hasText: 'Restore HEAD here' })); await ctx.wait(800); await ctx.click(button(ctx, 'Restore (reset --hard)')); }, zoom: { on: (ctx) => ctx.win.locator('.reflog-row').nth(1), zoom: 1.6 } },
        { say: 'I really wish someone had shown me this when I started. Most git panic ends right here.', do: (ctx) => ctx.click(ctx.win.getByTitle('Reflog — recover lost commits')) },
        { say: 'There is a bisect wizard too. Mark a good commit and a bad one, and it walks you to the commit that broke things.', do: (ctx) => ctx.click(ctx.win.getByTitle('Bisect')) },
        { say: 'And clean, for untracked files, makes you type to confirm. Because that one really does delete things.', do: async (ctx) => { await ctx.click(ctx.win.getByTitle('Bisect')); await ctx.wait(400); await ctx.click(ctx.win.getByTitle('Clean untracked/ignored files')); } },
      ],
    },

    {
      id: 'nothing-hidden',
      title: 'Nothing hidden',
      open: ['pixel-pets'],
      prepare: freshPets,
      lines: [
        { say: 'Remember rule two? Never hide what git is doing.', do: (ctx) => ctx.spotlight(ctx.win.locator('.cdock-body')) },
        { say: 'Watch this panel while I stage a line.', do: async (ctx) => { await ctx.click(ctx.win.locator('.wt-file-path', { hasText: 'src/ui/hud.ts' }).first()); await ctx.wait(1200); await ctx.click(diffRow(ctx, 'pet.mood').locator('td.diff-sign')); } },
        { say: 'There it is. The exact git command that did it, with its output, how long it took, and whether it worked.', do: (ctx) => ctx.highlight(ctx.win.locator('.cdock-cmdline').last(), 'what actually ran'), zoom: { on: (ctx) => ctx.win.locator('.cdock-cmdline').last(), zoom: 1.8, lines: 2 } },
        { say: 'Every button in the app ends up in this log. Nothing happens behind your back.' },
        { say: 'By default it shows the commands that change things. Switch to all commands, and you see every read-only query the graph makes as well.', do: (ctx) => ctx.click(ctx.win.locator('.cdock-btn', { hasText: 'Changes only' })) },
        { say: "And next to it is a real console at the repo root. When the app doesn't cover something, you don't have to leave.", do: async (ctx) => { const input = ctx.win.getByPlaceholder('Run a command at the worktree root…'); await ctx.click(input); await ctx.win.keyboard.type('git log --oneline -3', { delay: 60 }); await ctx.win.keyboard.press('Enter'); } },
        { say: "Honestly, I've learned more git from reading this log than from years of using other clients." },
        { say: "There's a whole episode on just this panel, if you want the details." },
      ],
    },

    {
      id: 'beyond',
      title: 'Beyond one machine',
      open: ['pixel-pets'],
      prepare: freshPets,
      setup: closeConsole,
      lines: [
        { say: 'Rule three is where it grew past a normal git client. Reach my repos wherever they live.', do: (ctx) => ctx.fx('FourApps', { title: 'One protocol, four apps', hub: 'peer\nprotocol', apps: "Desktop app|what you've been watching\nHeadless daemon|git on a box with no screen\nRelay|reach it from anywhere\nPhone companion|read-only, live", reveal: [ctx.when(1, 'the desktop app'), ctx.when(2, 'headless daemon'), ctx.when(3, 'A relay'), ctx.when(4, 'a phone app')].join(','), backdrop: 0.97 }, { lines: 6 }) },
        { say: "Git Gud is really four apps that speak the same protocol. There's the desktop app you've been watching." },
        { say: "There's a headless daemon, for Linux boxes with no screen. My dev server runs it, so I can drive git over there from my desktop." },
        { say: 'A relay, so my machines can find each other from anywhere, not only on the same network.' },
        { say: 'And a phone app, that shows my repos live, read only, wherever I am.' },
        { say: 'They connect over the local network, Tailscale, or the relay. And every device gets its own scope, so the phone can look but not touch.' },
        { say: 'Each of those gets its own episode, because there is a lot in there.' },
      ],
    },

    {
      id: 'gerrit',
      title: 'Gerrit mode',
      open: ['pixel-pets-gerrit'],
      prepare: freshPets,
      setup: closeConsole,
      lines: [
        { say: 'One more, for anyone who reviews code the Android or Chromium way.', do: (ctx) => ctx.highlight(ctx.win.getByText(/looks like it targets a Gerrit server/).first(), '', { lines: 2 }), zoom: { on: (ctx) => ctx.win.getByText(/looks like it targets a Gerrit server/).first(), zoom: 1.6, lines: 2 } },
        { say: 'If your remote is a Gerrit server, Git Gud notices, and offers Gerrit mode.' },
        { say: 'Then pushing for review goes to refs for, with a topic and work in progress, and open changes show up in the graph with every patch set.', do: (ctx) => ctx.click(button(ctx, 'Enable Gerrit mode')) },
        { say: 'Most git clients act like Gerrit does not exist. That gets an episode too.', do: (ctx) => ctx.click(button(ctx, 'Cancel')) },
      ],
    },

    {
      id: 'ai',
      title: 'How I built it',
      open: ['git-gud'],
      prepare: () => execFileSync(BASH, ['-lc', `test -d '${posix(REPOS)}/git-gud' || git clone -q '${posix(HOME)}/Projects/MyProjects/git-gud' '${posix(REPOS)}/git-gud'`], { stdio: 'ignore' }),
      setup: closeConsole,
      lines: [
        { say: "Okay. Here's the part I most want you to see." },
        { say: "This is Git Gud's own history, open in Git Gud. And I didn't type most of this code.", do: (ctx) => ctx.scroll(graph.x, graph.y, 3000, 4000) },
        { say: 'I wrote down what each feature should do, and an AI agent built it.' },
        { say: 'Every feature starts as a spec. Here is the one for that activity log you just saw.', do: (ctx) => ctx.fx('SpecCard', { path: 'openspec/specs/git-activity-log/spec.md', text: '### Requirement: Capture every git invocation\nThe system SHALL record every git command the\napplication runs against the active repository.\n\n#### Scenario: A command is logged\n- WHEN the app runs any git operation\n- THEN an entry appears in the git activity log', charsPerSecond: 45, backdrop: 0.95 }, { lines: 2 }) },
        { say: 'The system shall record every git command the application runs. Then scenarios. When this happens, then that should happen.' },
        { say: 'The agent reads the spec, writes the code and the tests, and I review what comes back.' },
        { say: 'So my job moved. Less typing, more deciding. What gets built, what good looks like, and when to say no.' },
        { say: 'Here are the numbers.', do: (ctx) => ctx.fx('StatCounter', { title: STATS, items: '179|commits\n56|releases\n30|specs\n28000|lines of TypeScript', reveal: [ctx.when(1, 'a hundred'), ctx.when(1, 'fifty six'), ctx.when(1, 'thirty specs'), ctx.when(1, 'around twenty')].join(','), countSeconds: 1.3, backdrop: 0.95 }, { lines: 3 }) },
        { say: 'I started on the third of April. Six months later, that is a hundred and seventy nine commits, fifty six releases, thirty specs, and around twenty eight thousand lines of TypeScript.' },
        { say: 'Most of the recent commits carry a co-authored-by line from Claude.' },
        { say: 'The funny thing is, last year I wrote a blog post called Be The Pilot, Not The Co-Pilot. I uninstalled Copilot, because I felt it was making me worse at my job.', do: (ctx) => ctx.fx('PostCard', { site: "joe's dev blog", title: 'Be The Pilot, Not The Co-Pilot', date: 'February 2025', stamp: 'uninstalled', stampAt: ctx.when(0, 'I uninstalled'), backdrop: 0.95 }, { lines: 2 }) },
        { say: "I still think that was right. The difference is who's flying. Here, I decide where we go, and the agent does the typing." },
        { say: 'Without agents, I think this would have been a year of evenings and weekends. Probably more.' },
      ],
    },

    {
      id: 'outro',
      title: 'Outro',
      open: ['pixel-pets'],
      prepare: freshPets,
      setup: closeConsole,
      lines: [
        { say: "So that's Git Gud. It's free, it's open source, and the link is below.", do: (ctx) => ctx.fx('CardList', { title: 'Coming up', items: 'The command log|every git command, in the open\nGerrit mode|code review the Android way\nThe headless daemon|git on a box with no screen\nThe phone and the relay|my repos, anywhere', reveal: [ctx.when(1, 'The command log'), ctx.when(1, 'Gerrit mode'), ctx.when(1, 'the headless daemon'), ctx.when(1, 'the phone app')].join(','), layout: 'grid', firstNumber: 2, backdrop: 0.95 }, { lines: 2 }) },
        { say: 'Next up, one episode each. The command log, Gerrit mode, the headless daemon, and the phone app with the relay.' },
        { say: "Yeah, that'll do for now. I'm Joe, this is byte my face off, and I'll see you in the next one.", do: (ctx) => ctx.fx('TitleCard', { title: 'byteMyFaceOff', subtitle: 'Git Gud · episode 1', background: '#0B0D14', accentColor: '#F5276C', textColor: '#FFFFFF' }, { seconds: 4.5 }) },
      ],
    },
  ],
};
