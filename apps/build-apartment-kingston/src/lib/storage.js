// One localStorage entry per variable, namespaced under 'bak.' so they don't
// collide with other apps hosted on the same origin or with App.svelte's
// 'app-stage' key.
//
// Cross-model sharing is automatic: any two models that read/write the same
// key see the same value. Variables that should NOT be shared (e.g. M4's
// interest rate vs M2/M3's) just use distinct keys (e.g. 'interestRateSocial').

const PREFIX = 'bak.';

export function loadVar(key, defaultValue) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? defaultValue : JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

export function saveVar(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {}
}

export function clearAll() {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(PREFIX) || /^model\d+-inputs$/.test(key)) {
        localStorage.removeItem(key);
      }
    }
  } catch {}
}

// Cleanup legacy per-model buckets — no longer read by new code.
try {
  for (const k of ['model1-inputs', 'model2-inputs', 'model3-inputs', 'model4-inputs']) {
    localStorage.removeItem(k);
  }
} catch {}
