#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

const stdin = await readStdin();
const input = parseJsonOrNull(stdin);

if (!input) {
  process.exit(0);
}

if (input.tool_name && !isGitCommitInput(input)) {
  process.exit(0);
}

const context = collectGitContext();
if (!context.inGitRepo) {
  process.exit(0);
}

const lines = [
  '[agent-context]',
  `root: ${context.root}`,
  `branch: ${context.branch || '<detached>'}`,
  `upstream: ${context.upstream || '<none>'}`,
  `worktree: ${context.worktree}`,
  `dirty: ${context.dirtyCount}`,
];

if (context.branch === 'main' && isGitCommitInput(input)) {
  lines.push('note: this repo often uses main as a local fast lane; verify this commit belongs on main before continuing.');
}

if (context.untrackedAgentState.length > 0) {
  lines.push(`agent-state: ${context.untrackedAgentState.join(', ')}`);
}

console.log(lines.join('\n'));
process.exit(0);

async function readStdin() {
  if (process.stdin.isTTY) return '';

  let data = '';
  for await (const chunk of process.stdin) {
    data += chunk;
  }
  return data;
}

function parseJsonOrNull(value) {
  if (!value.trim()) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function isGitCommitInput(value) {
  const command = value?.tool_input?.command;
  return typeof command === 'string' && /\bgit\s+commit\b/.test(command);
}

function collectGitContext() {
  const root = git(['rev-parse', '--show-toplevel']);
  if (!root) return { inGitRepo: false };

  const branch = git(['branch', '--show-current']);
  const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  const worktree = git(['rev-parse', '--show-prefix']) ? 'subdir' : 'root';
  const status = git(['status', '--short']) || '';
  const dirtyLines = status.split('\n').filter(Boolean);
  const untrackedAgentState = dirtyLines
    .filter((line) => /^\?\?\s+\.claude\/|^\?\?\s+\.codex\//.test(line))
    .map((line) => line.replace(/^\?\?\s+/, ''));

  return {
    inGitRepo: true,
    root,
    branch,
    upstream,
    worktree,
    dirtyCount: dirtyLines.length,
    untrackedAgentState,
  };
}

function git(args) {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}
