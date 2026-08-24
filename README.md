# satware® AI mermaid

**Mermaid diagrams directly in the chat** - a TypingMind JavaScript plugin
for `chat.satware.ai` and `chat.demo.satware.ai`. Runs entirely in the
browser: no server process, no MCP dependency, no authentication.

Renders the full Mermaid v11 surface: flowcharts, sequence diagrams, ER
models, Gantt charts, timelines, pie charts, mindmaps, plus beta types
(xychart, sankey, architecture, block, radar, packet). ZenUML and six
Iconify icon packs (logos, simple-icons, mdi, Font Awesome 6) are available
in diagram labels.

## Features

- **Interactive rendering**: zoom 25-400% (buttons or Ctrl +/-/0), sticky
  header, responsive layout
- **Export**: SVG and PNG download (2x scale, white background, SVG
  fallback if PNG conversion fails)
- **Visible errors**: invalid Mermaid syntax surfaces in a parse-error
  panel instead of a silently blank diagram
- **LLM-friendly**: literal `\n` sequences in model output are converted
  to real newlines before parsing; a strict syntax guide rides along as
  dynamic context so the model emits valid Mermaid v11 source
- **Pinned CDN**: `mermaid@11.17.0`, `@mermaid-js/mermaid-zenuml@0.2.3`
  (reproducible rendering)

## Tool

### render_mermaid_diagram

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | yes | Short diagram title (shown in header, used for export filenames) |
| `source` | string | yes | Raw Mermaid v11 source text; must start with the exact diagram-type prefix |

## Installation

### English

Import in TypingMind's plugin manager:

```
https://github.com/satwareAG/satag-mermaid-plugin
```

The plugin activates by default - no settings, no credentials.

### Deutsch

Die oben stehende GitHub-URL im TypingMind-Plugin-Manager importieren.
Das Plugin ist standardmässig aktiviert - keine Einstellungen, keine
Zugangsdaten.

## Development

```bash
node --check implementation.js     # JS syntax
python3 -m json.tool plugin.json   # JSON validity
node tests/run-tests.js            # test suite (32 tests, zero deps)
```

`npm test` does not work - `package.json` intentionally has no scripts.

## License

MIT - see [LICENSE](LICENSE).
