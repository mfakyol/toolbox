# Engineering Docs

Reference docs for how this codebase is built. Read the relevant one before making
structural or security decisions.

## Reusable across projects (copy these into any repo's `.claude/docs/`)
- [`nodejs-backend-security.md`](nodejs-backend-security.md) — Node/Express security checklist.
- [`backend-file-structure.md`](backend-file-structure.md) — layered backend structure standards.
- [`frontend-structure.md`](frontend-structure.md) — React client structure & component/security standards.

## Project-specific (do not copy blindly)
- [`PROJECT-toolbox.md`](PROJECT-toolbox.md) — decisions unique to this repo
  (auth model & kill-switch, one-time secret / file-transfer internals, topology,
  client shape, follow-ups).

## How to work here
- [`WORKING-AGREEMENTS.md`](WORKING-AGREEMENTS.md) — process rules from owner
  feedback (scope, commits, docs-are-standards, config accuracy). Read before
  editing or committing.
