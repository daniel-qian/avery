#!/usr/bin/env node
// freeze.mjs — deterministic SHA-256 stamper for the frozen eval scenario set (feat-012).
//
// What it does (node builtins only, no deps, idempotent):
//   1. Scans ./cases/SCN-*.md and extracts each file's `<!-- META {json} -->` block.
//   2. Per scenario, computes evidenceHash = sha256(canonicalJSON({brief, evidence, kind,
//      expectedShape})) — the four fields that define the *frozen* situation.
//   3. Writes ./scenarios.json — the aggregated, machine-ingestible manifest (feat-011 runner
//      contract) with evidenceHash stamped in.
//   4. Writes ./frozen.lock.json — { count, algorithm, setDigest, note } where
//      setDigest = sha256(join(sorted perScenarioHash)). The set digest is the anti-cherry-pick
//      guarantee: we cannot quietly drop a case Avery lost without it changing.
//
// Deterministic by construction: no Date.now(), no randomness, stable key order, sorted inputs.
// Re-running produces byte-identical output — `git diff` after a second run proves the freeze.
//
//   Run:  node docs/strategy/coldstart-deliverables/eval-scenarios/freeze.mjs
//   The git commit that lands scenarios.json + frozen.lock.json IS the freeze hash.

import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const CASES_DIR = join(HERE, 'cases')

const sha256 = (s) => createHash('sha256').update(s, 'utf8').digest('hex')

// Recursive canonical JSON: object keys sorted, arrays kept in order (order is meaningful for
// evidence). Guarantees a stable byte string to hash regardless of source key order.
function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']'
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map((k) => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}'
  }
  return JSON.stringify(value)
}

function extractMeta(md, file) {
  const m = md.match(/<!--\s*META\s*([\s\S]*?)-->/)
  if (!m) throw new Error(`No <!-- META --> block in ${file}`)
  try {
    return JSON.parse(m[1].trim())
  } catch (e) {
    throw new Error(`Bad META JSON in ${file}: ${e.message}`)
  }
}

// ── load + sort by id ───────────────────────────────────────────────────────
const files = readdirSync(CASES_DIR).filter((f) => /^SCN-.*\.md$/.test(f)).sort()
const scenarios = files
  .map((f) => extractMeta(readFileSync(join(CASES_DIR, f), 'utf8'), f))
  .sort((a, b) => a.id.localeCompare(b.id))

// ── stamp evidenceHash (the 4 frozen fields) ────────────────────────────────
const FIELD_ORDER = ['id', 'title', 'brief', 'evidence', 'kind', 'expectedShape',
  'authored', 'source', 'runnable', 'anonymized', 'redLineTrap', 'evidenceHash']

const stamped = scenarios.map((s) => {
  const evidenceHash = 'sha256:' + sha256(canonical({
    brief: s.brief, evidence: s.evidence, kind: s.kind, expectedShape: s.expectedShape,
  }))
  const out = {}
  for (const k of FIELD_ORDER) out[k] = k === 'evidenceHash' ? evidenceHash : s[k]
  return out
})

// ── set digest = sha256 over the sorted per-scenario hashes ──────────────────
const perHash = stamped.map((s) => s.evidenceHash).sort()
const setDigest = 'sha256:' + sha256(perHash.join('\n'))

// ── compose deterministic summary counts ────────────────────────────────────
const tally = (key) => stamped.reduce((acc, s) => ((acc[s[key]] = (acc[s[key]] || 0) + 1), acc), {})
const sortObj = (o) => Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]))

const scenariosDoc = {
  algorithm: 'sha256',
  hashedFields: ['brief', 'evidence', 'kind', 'expectedShape'],
  count: stamped.length,
  runnableCount: stamped.filter((s) => s.runnable).length,
  bySource: sortObj(tally('source')),
  byKind: sortObj(tally('kind')),
  setDigest,
  scenarios: stamped,
}

const lockDoc = {
  count: stamped.length,
  runnableCount: stamped.filter((s) => s.runnable).length,
  algorithm: 'sha256',
  hashedFields: ['brief', 'evidence', 'kind', 'expectedShape'],
  setDigest,
  note: 'Frozen eval scenario set (feat-012). The git commit that lands this file is the freeze '
    + 'hash; setDigest covers every scenario, so a case cannot be quietly dropped or edited '
    + 'without the digest changing. Re-run freeze.mjs to verify (output is byte-identical).',
}

const write = (name, obj) => writeFileSync(join(HERE, name), JSON.stringify(obj, null, 2) + '\n')
write('scenarios.json', scenariosDoc)
write('frozen.lock.json', lockDoc)

console.log(`froze ${stamped.length} scenarios (${scenariosDoc.runnableCount} runnable)`)
console.log(`bySource ${JSON.stringify(scenariosDoc.bySource)}  byKind ${JSON.stringify(scenariosDoc.byKind)}`)
console.log(`setDigest ${setDigest}`)
