# Changelog

All notable changes to **satware(R) AI mermaid** are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-08-24

### Added
- Canonical fleet repo for the mermaid plugin, unifying the tenant exports
  from `chat.satware.ai` and `chat.demo.satware.ai` (verified byte-identical;
  see `docs/source-analysis.md`, Gitea-only)
- Hybrid plugin pattern: `implementation.js` (primary function, loaded by
  TypingMind from the GitHub mirror) + `plugin.json` with embedded
  `pluginFunctions[0].code`; tests enforce byte-identity between both copies
- TDD test suite (`tests/run-tests.js`, 32 tests, zero dependencies):
  functional, error-contract, schema-conformance, sync, and version checks
- CI auto-mirror workflow (`.gitea/workflows/mirror-to-github.yml`):
  privacy scan + tests + version-consistency gates before GitHub push
- Bilingual (EN + DE) `overviewMarkdown`; when-to-use preamble on the
  dynamicContextEndpoints syntax guide (production guide content preserved)

### Changed
- Adopted the newer embedded code variant (zoom controls 25-400% with
  Ctrl +/-/0 shortcuts, SVG/PNG download at 2x scale, pinned
  `mermaid@11.17.0` and `@mermaid-js/mermaid-zenuml@0.2.3`, newline
  unescaping for LLM input, responsive CSS) as the single implementation;
  dropped the stale top-level v1 code (dead `htmlEncode`, unpinned CDN)
- `plugin.json` field fixes: `isServerPlugin` true -> false, `githubURL`
  -> `github.com/satwareAG/satag-mermaid-plugin`, `version` 2 (integer)
  -> `"1.0.0"` (SemVer), top-level `code` -> empty string
- Fleet error contract: input coercion + try/catch; missing/empty `title`
  or `source` returns `{ isError: true, error }` instead of throwing
- Diagram title is HTML-escaped in `<title>`/`<h2>` and sanitized for
  download filenames; mermaid source stays unescaped (mermaid v11 reads
  innerHTML - escaping would break entity handling)

### Removed
- Non-standard export artifact keys: `context` (duplicate of the syntax
  guide), `org`, `output`, `iconURL`
