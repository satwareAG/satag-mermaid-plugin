/**
 * satware® AI mermaid - primary function (loaded by TypingMind from GitHub).
 *
 * render_mermaid_diagram: builds a standalone HTML document that renders a
 * Mermaid v11 diagram via CDN ESM import. Zoom controls, SVG/PNG export,
 * icon packs, and a visible parse-error panel are part of the page.
 *
 * Fleet conformance: input coercion + try/catch, invalid input returns
 * { isError: true, error } instead of throwing. The mermaid source is
 * intentionally NOT HTML-escaped (mermaid v11 reads innerHTML; escaping
 * would break entity handling) - see docs/source-analysis.md.
 */

function render_mermaid_diagram(params) {
  try {
    const title = params && params.title != null ? String(params.title).trim() : '';
    const rawSource = params && params.source != null ? String(params.source) : '';
    if (!title) {
      return { isError: true, error: 'Parameter "title" is required and must not be empty.' };
    }
    if (!rawSource.trim()) {
      return { isError: true, error: 'Parameter "source" is required and must contain Mermaid diagram source text.' };
    }

    function htmlEscape(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Convert escaped newlines (common in LLM output) to real newlines for mermaid parsing
    const processedSource = rawSource.replace(/\\n/g, '\n');
    const escapedTitle = htmlEscape(title);
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_');

    const htmlString = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapedTitle}</title>
<style>
*,*::before,*::after{box-sizing:border-box}
body{min-height:100vh;margin:0;display:flex;flex-direction:column;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fafafa}
.container{width:100%;max-width:1200px;margin:0 auto;padding:0 20px}
header{background:#fff;padding:16px 0;box-shadow:0 1px 3px rgba(0,0,0,.1);position:sticky;top:0;z-index:100}
header .container{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
h2{margin:0;color:#1a1a1a;font-size:1.5rem;font-weight:600}
main{flex:1;padding:20px 0;overflow:hidden}
.controls{display:flex;gap:8px;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border:1px solid #d1d5db;border-radius:6px;background:#fff;color:#374151;font-size:.875rem;font-weight:500;cursor:pointer;transition:all .15s ease}
.btn:hover{background:#f3f4f6;border-color:#9ca3af}
.btn:active{background:#e5e7eb}
.btn svg{width:16px;height:16px}
.btn-group{display:flex;border-radius:6px;overflow:hidden}
.btn-group .btn{border-radius:0;margin-left:-1px}
.btn-group .btn:first-child{border-radius:6px 0 0 6px;margin-left:0}
.btn-group .btn:last-child{border-radius:0 6px 6px 0}
.zoom-level{min-width:48px;text-align:center;font-variant-numeric:tabular-nums}
.diagram-wrapper{position:relative;overflow:auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;min-height:400px}
.diagram-container{transform-origin:0 0;transition:transform .2s ease;padding:20px;display:inline-block;min-width:100%}
.mermaid{width:100%}
#error-log{margin-top:16px;padding:12px 16px;border:1px solid #fca5a5;background:#fef2f2;border-radius:6px;display:none}
#error-log.has-errors{display:block}
#error-log h3{margin:0 0 8px;font-size:.875rem;color:#b91c1c}
#error-content{margin:0;font-size:.75rem;color:#7f1d1d;white-space:pre-wrap;font-family:ui-monospace,monospace}
@media(max-width:640px){
  .container{padding:0 12px}
  h2{font-size:1.25rem}
  header .container{justify-content:center}
  .controls{justify-content:center}
  .btn{padding:6px 10px;font-size:.8rem}
}
</style>
</head>
<body>
<header>
    <div class="container">
        <h2>${escapedTitle}</h2>
        <div class="controls">
            <div class="btn-group">
                <button class="btn" id="zoom-out" title="Zoom Out">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M8 11h6"/></svg>
                </button>
                <button class="btn" id="zoom-reset" title="Reset Zoom">
                    <span class="zoom-level">100%</span>
                </button>
                <button class="btn" id="zoom-in" title="Zoom In">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/></svg>
                </button>
            </div>
            <div class="btn-group">
                <button class="btn" id="download-svg" title="Download SVG">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                    SVG
                </button>
                <button class="btn" id="download-png" title="Download PNG">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                    PNG
                </button>
            </div>
        </div>
    </div>
</header>
<main>
    <div class="container">
        <div class="diagram-wrapper" id="diagram-wrapper">
            <div class="diagram-container" id="diagram-container">
                <pre class="mermaid">
${processedSource}
</pre>
            </div>
        </div>
        <div id="error-log">
            <h3>Parse Errors:</h3>
            <pre id="error-content"></pre>
        </div>
    </div>
</main>
<script type="module">
    import zenuml from 'https://cdn.jsdelivr.net/npm/@mermaid-js/mermaid-zenuml@0.2.3/dist/mermaid-zenuml.esm.min.mjs';
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11.17.0/dist/mermaid.esm.min.mjs';

    mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose'
    });

    await mermaid.registerExternalDiagrams([zenuml]);
    await mermaid.registerIconPacks(['logos', 'simple-icons', 'mdi', 'fa6-solid', 'fa6-regular', 'fa6-brands'].map((name) => ({
        name,
        loader: async () => {
            const response = await fetch('https://unpkg.com/@iconify-json/' + name + '@1/icons.json');
            return response.ok ? response.json() : null;
        }
    })));

    mermaid.parseError = function (err, hash) {
        const errorLog = document.getElementById('error-log');
        const errorContent = document.getElementById('error-content');
        errorContent.textContent = typeof err === 'object' ? JSON.stringify(err, null, 2) : err;
        errorLog.classList.add('has-errors');
    };

    await mermaid.run();

    // Zoom controls
    let currentZoom = 1;
    const zoomStep = 0.25;
    const minZoom = 0.25;
    const maxZoom = 4;
    const container = document.getElementById('diagram-container');
    const zoomDisplay = document.querySelector('.zoom-level');

    function updateZoom(newZoom) {
        currentZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
        container.style.transform = \`scale(\${currentZoom})\`;
        zoomDisplay.textContent = Math.round(currentZoom * 100) + '%';
    }

    document.getElementById('zoom-in').addEventListener('click', () => updateZoom(currentZoom + zoomStep));
    document.getElementById('zoom-out').addEventListener('click', () => updateZoom(currentZoom - zoomStep));
    document.getElementById('zoom-reset').addEventListener('click', () => updateZoom(1));

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === '=' || e.key === '+') { e.preventDefault(); updateZoom(currentZoom + zoomStep); }
            if (e.key === '-') { e.preventDefault(); updateZoom(currentZoom - zoomStep); }
            if (e.key === '0') { e.preventDefault(); updateZoom(1); }
        }
    });

    // Download functions
    function getSvgElement() {
        return document.querySelector('.mermaid svg');
    }

    function downloadSvg() {
        const svg = getSvgElement();
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = '${safeTitle}.svg';
        link.click();
        URL.revokeObjectURL(url);
    }

    async function downloadPng() {
        const svg = getSvgElement();
        if (!svg) return;

        // Clone SVG and inline all styles to avoid cross-origin issues
        const clone = svg.cloneNode(true);
        const styles = getComputedStyle(svg);

        // Set explicit dimensions
        const bbox = svg.getBBox();
        const width = svg.width.baseVal.value || bbox.width + 40;
        const height = svg.height.baseVal.value || bbox.height + 40;

        clone.setAttribute('width', width);
        clone.setAttribute('height', height);

        // Remove external references that cause tainting
        clone.querySelectorAll('image').forEach(img => {
            const href = img.getAttribute('href') || img.getAttribute('xlink:href');
            if (href && href.startsWith('http')) {
                img.remove(); // Remove external images
            }
        });

        const svgData = new XMLSerializer().serializeToString(clone);
        const svgBase64 = btoa(unescape(encodeURIComponent(svgData)));
        const dataUrl = 'data:image/svg+xml;base64,' + svgBase64;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            const scale = 2;
            canvas.width = width * scale;
            canvas.height = height * scale;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0);

            try {
                canvas.toBlob((blob) => {
                    if (!blob) return;
                    const pngUrl = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = pngUrl;
                    link.download = '${safeTitle}.png';
                    link.click();
                    URL.revokeObjectURL(pngUrl);
                }, 'image/png');
            } catch (e) {
                // Fallback: download SVG if PNG fails
                console.warn('PNG export failed, downloading SVG instead:', e);
                downloadSvg();
            }
        };

        img.onerror = () => {
            console.warn('PNG conversion failed, downloading SVG instead');
            downloadSvg();
        };

        img.src = dataUrl;
    }

    document.getElementById('download-svg').addEventListener('click', downloadSvg);
    document.getElementById('download-png').addEventListener('click', downloadPng);
</script>
</body>
</html>
    `;
    return htmlString;
  } catch (err) {
    return { isError: true, error: String(err && err.message ? err.message : err) };
  }
}
