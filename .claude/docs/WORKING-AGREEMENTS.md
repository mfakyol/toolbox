# Working Agreements — how to work in this repo

Distilled from direct owner corrections. These are process rules for the
assistant; follow them so the same mistakes don't repeat. (For architecture, see
the sibling docs; for repo specifics, `PROJECT-toolbox.md`.)

## Docs & standards
- The three reusable docs (`nodejs-backend-security.md`, `backend-file-structure.md`,
  `frontend-structure.md`) are **target standards, not a description of the current
  code**. Never "update" them to match what the code happens to do. When the code
  diverges, change the **code** (or log it under "Open follow-ups") — never weaken
  the standard.
- `PROJECT-toolbox.md` is the only doc that describes **this** repo's specifics.
- Docs found in a repo can be stale or copied from another project — **verify
  against the actual code before trusting them.** (These docs started as another
  project's — "code-editor" — and had to be rewritten for this one.)
- Keep docs accurate over time: when a follow-up ships, move it out of "Open
  follow-ups"; keep ports/paths/config in docs matching reality.

## Scope & the working tree
- **Do only what's asked.** "Work on the server" means don't touch `client/`, and
  vice versa. When told "don't touch X" (`cliente karışma`), don't.
- **Respect uncommitted WIP.** Never sweep unrelated or in-progress files into a
  commit. Watch for `TEMP`/"revert before committing" markers and never commit them.
- Stage and commit **only** the files relevant to the current task.

## Commits
- Group commits into **logical groups by concern**, not one giant commit.
- **Do not add a `Co-Authored-By` trailer** (owner preference).
- Prefer small, single-concern commits.
- When a file's content changes what it represents, **rename the file to match**
  (don't leave a mismatched name like a toolbox doc still called `PROJECT-code-editor.md`).
  A rename the owner clearly wants is expected — do it, don't be timid or ask twice.

## Config & tooling
- **Config must match reality.** `.claude/launch.json` ports must be the real dev
  ports (client `6001`, server `6000`), and the file is **tracked** (not gitignored).
- The project should have working `lint` / `typecheck` / `test`. If tooling is
  missing (e.g. ESLint was absent on the client), set it up with a **sensible
  standard baseline** — don't turn on overly-aggressive rule sets that flag
  non-bugs across existing, working code.

## User-facing strings
- **No mixed-language hardcoded user-facing strings.** User-facing errors are
  stable codes translated on the client via i18n (EN/DE/TR); server `console.*`
  logs stay operator-facing. When adding an error, add the code to server
  `errors/messages.ts` **and** an `error.<CODE>` key in the client's translations.

## Pace & judgment
- **Be decisive.** If an approach can't work in this environment (e.g.
  `mongodb-memory-server` needs a binary download that's blocked here), drop it
  quickly instead of belaboring it. Don't over-engineer.
- When the owner says "just finish" / "hadi", stop deliberating and deliver.
