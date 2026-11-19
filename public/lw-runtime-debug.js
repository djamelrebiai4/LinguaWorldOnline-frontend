/* Safe fallback: always dismiss the level loading overlay if the scene misses its ready event. */
(function () {
  'use strict';

  const settleLoadingOverlay = () => {
    window.dispatchEvent(new Event('level-loading-end'));
  };

  const fallbackTimer = window.setTimeout(settleLoadingOverlay, 15000);

  const observer = new MutationObserver(() => {
    if (document.querySelector('canvas') && document.querySelector('.loading-screen') && performance.now() > 12000) {
      settleLoadingOverlay();
    }
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('level-loading-end', () => {
    window.clearTimeout(fallbackTimer);
    observer.disconnect();
  }, { once: true });
})();

/* Temporary opt-in boot diagnostics. Enable with ?debug=1. */
(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  if (params.get('debug') !== '1') return;

  const prefix = '[LW boot]';
  const startedAt = performance.now();
  const root = document.getElementById('root');
  let mutationCount = 0;
  let lastSnapshot = '';

  const snapshot = () => {
    const appRoot = document.getElementById('root');
    const canvases = document.querySelectorAll('canvas');
    const summary = {
      readyState: document.readyState,
      rootChildren: appRoot?.childElementCount ?? null,
      rootText: appRoot?.textContent.trim().slice(0, 100) ?? null,
      canvasCount: canvases.length,
      canvases: [...canvases].slice(0, 3).map((canvas) => ({
        width: canvas.width,
        height: canvas.height,
        cssWidth: Math.round(canvas.getBoundingClientRect().width),
        cssHeight: Math.round(canvas.getBoundingClientRect().height)
      }))
    };
    return summary;
  };

  console.info(prefix, 'diagnostics enabled', {
    href: window.location.href,
    userAgent: navigator.userAgent,
    startedAt: new Date().toISOString()
  });

  window.addEventListener('error', (event) => {
    const target = event.target;
    if (target && target !== window) {
      console.error(prefix, 'resource failed', {
        tag: target.tagName,
        url: target.src || target.href || null
      });
      return;
    }
    console.error(prefix, 'uncaught error', {
      message: event.message,
      filename: event.filename,
      line: event.lineno,
      column: event.colno,
      error: event.error?.stack || event.error || null
    });
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    console.error(prefix, 'unhandled promise rejection', event.reason?.stack || event.reason);
  });

  document.addEventListener('DOMContentLoaded', () => {
    console.info(prefix, 'DOMContentLoaded', snapshot());
  }, { once: true });

  if (root) {
    new MutationObserver((records) => {
      mutationCount += records.length;
    }).observe(root, { childList: true, subtree: true });
  } else {
    console.error(prefix, '#root is missing before app startup');
  }

  new MutationObserver((records) => {
    mutationCount += records.length;
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['title']
  });

  try {
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.warn(prefix, 'long task', {
          startMs: Math.round(entry.startTime),
          durationMs: Math.round(entry.duration)
        });
      });
    }).observe({ type: 'longtask', buffered: true });
  } catch (error) {
    console.info(prefix, 'long-task observer unavailable', error.message);
  }

  let samples = 0;
  const timer = window.setInterval(() => {
    const current = snapshot();
    const signature = JSON.stringify(current);
    if (signature !== lastSnapshot || mutationCount > 0) {
      console.info(prefix, 'progress', {
        elapsedMs: Math.round(performance.now() - startedAt),
        mutationsSincePreviousSample: mutationCount,
        ...current
      });
    }
    lastSnapshot = signature;
    mutationCount = 0;
    samples += 1;

    if (samples >= 15) {
      window.clearInterval(timer);
      console.info(prefix, 'resource summary', performance.getEntriesByType('resource')
        .filter((entry) => /localhost:8765/.test(entry.name) && /\.js(?:$|\?)/.test(entry.name))
        .map((entry) => ({
          name: entry.name,
          durationMs: Math.round(entry.duration),
          transferBytes: entry.transferSize || null
        })));
      console.info(prefix, 'diagnostics complete', snapshot());
    }
  }, 1000);
})();