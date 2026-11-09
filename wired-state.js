(() => {
  'use strict';
  const key = 'occult_state';
  const prefix = 'occult-local:';
  const today = stamp => new Date(stamp).toLocaleDateString('en-CA');
  let envelope = {};
  try { if (window.name.startsWith(prefix)) envelope = JSON.parse(window.name.slice(prefix.length)); } catch {}
  let raw;
  try { raw = JSON.parse(localStorage.getItem(key)); } catch {}
  raw ||= envelope.state;
  const now = Date.now();
  const validNumber = value => Number.isSafeInteger(value) && value >= 0;
  let state = {
    firstVisit: Number.isFinite(raw?.firstVisit) ? raw.firstVisit : now,
    lastVisit: Number.isFinite(raw?.lastVisit) ? raw.lastVisit : now,
    visits: validNumber(raw?.visits) ? raw.visits : 0,
    gate: validNumber(raw?.gate) ? Math.min(7, raw.gate) : 0,
    answers: {},
    visitorNo: validNumber(raw?.visitorNo) && raw.visitorNo >= 100 && raw.visitorNo <= 999 ? raw.visitorNo : 100 + Math.floor(Math.random() * 900),
    opened: raw?.opened === true,
    returningDay: raw?.returningDay === true,
    returned: raw?.returned === true,
    returnVariation: [0, 1].includes(raw?.returnVariation) ? raw.returnVariation : -1
  };
  for (let i = 0; i <= 7; i++) {
    const id = 'g' + String(i).padStart(2, '0');
    if (typeof raw?.answers?.[id] === 'string') state.answers[id] = raw.answers[id].slice(0, 64);
  }
  if (validNumber(raw?.displayVisitorNo) && raw.displayVisitorNo >= 100 && raw.displayVisitorNo <= 999) state.displayVisitorNo = raw.displayVisitorNo;
  const otherDay = today(state.lastVisit) !== today(now);
  if (!envelope.session || otherDay) { state.visits++; state.returningDay = Boolean(raw && otherDay); }
  state.lastVisit = now;
  let traces = [];
  try { traces = JSON.parse(localStorage.getItem('occult_traces')) || []; } catch { traces = envelope.traces || []; }
  if (!Array.isArray(traces)) traces = [];
  traces = traces.filter(item => typeof item?.message === 'string' && typeof item?.date === 'string').slice(-40).map(item => ({ message: item.message.slice(0, 200), date: item.date }));
  function save() {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
    try { localStorage.setItem('occult_traces', JSON.stringify(traces)); } catch {}
    try { window.name = prefix + JSON.stringify({ state, traces, session: true }); } catch {}
  }
  function differentNumber(number) { return 100 + ((number - 100 + 1 + Math.floor(Math.random() * 899)) % 900); }
  window.OccultStore = Object.freeze({
    get state() { return state; },
    get traces() { return traces; },
    save, differentNumber,
    addTrace(message) { traces.push({ message, date: new Date().toISOString() }); traces = traces.slice(-40); save(); },
    returnToZero() {
      state.returnVariation = state.returnVariation === 0 ? 1 : state.returnVariation === 1 ? 0 : Math.floor(Math.random() * 2);
      state.returned = true; save();
    },
    forget() {
      try { localStorage.removeItem(key); localStorage.removeItem('occult_traces'); } catch {}
      try { window.name = ''; } catch {}
      state = { firstVisit: Date.now(), lastVisit: Date.now(), visits: 1, gate: 0, answers: {}, visitorNo: 100 + Math.floor(Math.random() * 900), opened: false, returned: false, returnVariation: -1 };
      traces = [];
      // Deliberately do not persist again until the next answer or access.
    }
  });
  save();
})();
