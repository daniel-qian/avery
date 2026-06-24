#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

function gitRoot() {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return process.cwd();
  }
}

const root = gitRoot();
const hookConfigs = [
  '.claude/settings.json',
  '.codex/hooks.json',
].map((relPath) => ({
  relPath,
  absPath: path.join(root, relPath),
}));

function readJsonConfig(config) {
  if (!existsSync(config.absPath)) return { missing: true, handlers: [] };

  try {
    const parsed = JSON.parse(readFileSync(config.absPath, 'utf8'));
    return { missing: false, handlers: collectCommandHandlers(parsed, config.relPath) };
  } catch (error) {
    return {
      missing: false,
      warning: `${config.relPath}: could not parse JSON (${error.message})`,
      handlers: [],
    };
  }
}

function collectCommandHandlers(value, source, trail = []) {
  const handlers = [];

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      handlers.push(...collectCommandHandlers(item, source, [...trail, String(index)]));
    });
    return handlers;
  }

  if (!value || typeof value !== 'object') return handlers;

  if (value.type === 'command') {
    for (const key of ['command', 'commandWindows', 'command_windows']) {
      if (typeof value[key] === 'string' && value[key].trim()) {
        handlers.push({
          source,
          location: trail.join('.') || '<root>',
          key,
          command: value[key],
        });
      }
    }
  }

  for (const [key, child] of Object.entries(value)) {
    handlers.push(...collectCommandHandlers(child, source, [...trail, key]));
  }

  return handlers;
}

function normalizeCommand(command) {
  return command
    .replaceAll('\\', '/')
    .replaceAll('$(git rev-parse --show-toplevel)', root.replaceAll('\\', '/'))
    .replaceAll('${CLAUDE_PROJECT_DIR}', root.replaceAll('\\', '/'))
    .replaceAll('$CLAUDE_PROJECT_DIR', root.replaceAll('\\', '/'))
    .replaceAll('%CLAUDE_PROJECT_DIR%', root.replaceAll('\\', '/'))
    .replaceAll('${CODEX_PROJECT_DIR}', root.replaceAll('\\', '/'))
    .replaceAll('$CODEX_PROJECT_DIR', root.replaceAll('\\', '/'));
}

function stripTrailingJunk(candidate) {
  return candidate.replace(/[),;}\]]+$/g, '');
}

function repoTargetsFromCommand(command) {
  const normalized = normalizeCommand(command);
  const targets = new Set();
  const rootSlash = root.replaceAll('\\', '/');

  const absolutePattern = new RegExp(`${escapeRegExp(rootSlash)}/([^\\s"'<>]+)`, 'g');
  for (const match of normalized.matchAll(absolutePattern)) {
    targets.add(stripTrailingJunk(match[1]));
  }

  const relativePattern = /(?:^|[\s"'=])((?:\.claude|\.codex|scripts)\/[^\s"'<>]+)/g;
  for (const match of normalized.matchAll(relativePattern)) {
    targets.add(stripTrailingJunk(match[1]));
  }

  return [...targets]
    .map((target) => target.replace(/^\.\//, ''))
    .filter((target) => !target.endsWith('/'));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasGitHistory(relPath) {
  try {
    const output = execFileSync('git', ['log', '--all', '--format=%H', '-n', '1', '--', relPath], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return output.length > 0;
  } catch {
    return false;
  }
}

console.log('Hook liveness audit');
console.log(`root: ${root}`);

const configs = hookConfigs.map(readJsonConfig);
const foundConfigs = configs.filter((config) => !config.missing);

for (const warning of configs.map((config) => config.warning).filter(Boolean)) {
  console.warn(`WARN ${warning}`);
}

if (foundConfigs.length === 0) {
  console.log('OK no project hook configs found');
  process.exit(0);
}

const handlers = foundConfigs.flatMap((config) => config.handlers);
if (handlers.length === 0) {
  console.log('OK hook configs found, but no command handlers found');
  process.exit(0);
}

const checks = [];
for (const handler of handlers) {
  const targets = repoTargetsFromCommand(handler.command);
  if (targets.length === 0) continue;

  for (const relPath of targets) {
    checks.push({
      ...handler,
      relPath,
      absPath: path.join(root, relPath),
    });
  }
}

if (checks.length === 0) {
  console.log('OK command handlers found, but none point at repo-local script paths');
  process.exit(0);
}

let failures = 0;

for (const check of checks) {
  const exists = existsSync(check.absPath);
  const history = exists && hasGitHistory(check.relPath);
  const status = exists && history ? 'OK' : 'FAIL';
  console.log(`${status} ${check.relPath} (${check.source} ${check.key} at ${check.location})`);

  if (!exists) {
    console.log(`  missing file: ${check.absPath}`);
    failures += 1;
  } else if (!history) {
    console.log(`  no git history: git log --all -- ${check.relPath}`);
    failures += 1;
  }
}

if (failures > 0) {
  console.error(`Hook liveness audit failed: ${failures} issue(s)`);
  process.exit(1);
}

console.log('OK all repo-local hook command targets exist and have git history');

