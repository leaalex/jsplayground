/**
 * Composable for running JavaScript code in a sandboxed iframe
 * and capturing console output.
 */
export function useCodeRunner(onLogs) {
  let iframe = null

  function runCode(code) {
    if (!iframe) {
      iframe = document.createElement('iframe')
      iframe.setAttribute('sandbox', 'allow-scripts')
      iframe.style.display = 'none'
      document.body.appendChild(iframe)
    }

    const escapedCode = code
      .replace(/\\/g, '\\\\')
      .replace(/<\/script>/gi, '<\\/script>')
      .replace(/<!--/g, '\\u003C\\u0021--')

    const messageHandler = (event) => {
      if (event.data?.type === 'jsplayground-console') {
        window.removeEventListener('message', messageHandler)
        onLogs(event.data.logs)
      }
    }
    window.addEventListener('message', messageHandler)

    const html = `<!DOCTYPE html>
<html>
<head>
<script>
const __capturedLogs = [];
const __originalLog = console.log;
const __originalError = console.error;
const __originalWarn = console.warn;
console.log = function(...args) { __capturedLogs.push({ type: 'log', args: args }); __originalLog.apply(console, args); };
console.error = function(...args) { __capturedLogs.push({ type: 'error', args: args }); __originalError.apply(console, args); };
console.warn = function(...args) { __capturedLogs.push({ type: 'warn', args: args }); __originalWarn.apply(console, args); };
window.addEventListener('error', function(e) { __capturedLogs.push({ type: 'error', args: [e.message] }); });
<\/script>
</head>
<body>
<script>
try {
${escapedCode}
} catch (err) {
  __capturedLogs.push({ type: 'error', args: [err.message] });
}
const serialized = __capturedLogs.map(function(l) {
  return {
    type: l.type,
    args: l.args.map(function(a) {
      if (typeof a === 'object' && a !== null) {
        try { return JSON.stringify(a, null, 2); } catch (e) { return String(a); }
      }
      return String(a);
    }).join(' ')
  };
});
window.parent.postMessage({ type: 'jsplayground-console', logs: serialized }, '*');
<\/script>
</body>
</html>`

    iframe.srcdoc = html
  }

  return { runCode }
}
