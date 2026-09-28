export const ABACUS_SESSION_KEY = 'insect-flash-abacus-session-v1';
export const ABACUS_COUNTDOWN_MS = 3000;
export const ABACUS_MINUTE_MS = 60000;

export function localDayKey(date = new Date()) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const pad = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function expectedSum(reached) {
  return Number.isInteger(reached) && reached >= 0 && reached <= 100
    ? reached * (reached + 1) / 2
    : null;
}

export function questionFor(number) {
  if (!Number.isInteger(number) || number < 1 || number > 100) return null;
  return {
    number,
    previous: expectedSum(number - 1),
    add: number,
    answer: expectedSum(number),
  };
}

export function parseStudyNumber(value, { min = 0, max = 5050 } = {}) {
  const text = String(value ?? '')
    .replace(/[０-９]/g, character => String.fromCharCode(character.charCodeAt(0) - 65248))
    .trim();
  if (!text) return { valid: false, error: '数字を入力してください。' };
  if (!/^\d+$/.test(text)) return { valid: false, error: '0以上の整数を入力してください。' };
  const number = Number(text);
  if (!Number.isSafeInteger(number) || number < min || number > max) {
    return { valid: false, error: `${min}〜${max}の数字を入力してください。` };
  }
  return { valid: true, value: number };
}

export function remainingSeconds(deadline, now = Date.now()) {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

export function newAbacusSession(mode, now = Date.now(), id = globalThis.crypto?.randomUUID?.() ?? `${now}-${Math.random()}`) {
  if (!['practice', 'minute'].includes(mode)) throw new Error('Unsupported abacus study mode');
  return {
    id,
    mode,
    status: mode === 'practice' ? 'practice' : 'countdown',
    startedAt: now,
    countdownEndsAt: mode === 'minute' ? now + ABACUS_COUNTDOWN_MS : null,
    deadline: mode === 'minute' ? now + ABACUS_COUNTDOWN_MS + ABACUS_MINUTE_MS : null,
    questionNo: 1,
    reached: 0,
    attempts: 0,
    mistakes: 0,
    correct: 0,
    endReason: null,
    remainingSeconds: 0,
    result: null,
    reported: false,
  };
}

export function checkPracticeAnswer(session, raw) {
  if (session?.mode !== 'practice' || session.status !== 'practice') return { valid: false, error: '練習中ではありません。' };
  const parsed = parseStudyNumber(raw);
  if (!parsed.valid) return parsed;
  const question = questionFor(session.questionNo);
  if (!question) return { valid: false, error: '問題が見つかりません。' };
  const correct = parsed.value === question.answer;
  const next = {
    ...session,
    attempts: session.attempts + 1,
    mistakes: session.mistakes + (correct ? 0 : 1),
    correct: session.correct + (correct ? 1 : 0),
    reached: session.reached + (correct ? 1 : 0),
    questionNo: session.questionNo + (correct ? 1 : 0),
  };
  return { valid: true, correct, expected: question.answer, session: next };
}

export function practiceResult(session, now = Date.now()) {
  if (session?.mode !== 'practice') return null;
  return {
    id: session.id,
    mode: 'practice',
    reached: session.reached,
    attempts: session.attempts,
    mistakes: session.mistakes,
    correct: session.correct,
    verified: true,
    completed: session.reached === 100,
    remainingSeconds: 0,
    endedOn: localDayKey(new Date(now)),
    startedAt: new Date(session.startedAt).toISOString(),
    finishedAt: new Date(now).toISOString(),
  };
}

export function checkMinuteAnswer(session, reachedRaw, sumRaw, now = Date.now()) {
  if (session?.mode !== 'minute' || session.status !== 'minute_answer') {
    return { valid: false, errors: { general: '答えを入力する時間ではありません。' } };
  }
  const reached = parseStudyNumber(reachedRaw, { min: 0, max: 100 });
  const sum = parseStudyNumber(sumRaw, { min: 0, max: 5050 });
  const errors = {};
  if (!reached.valid) errors.reached = reached.error;
  if (!sum.valid) errors.sum = sum.error;
  if (Object.keys(errors).length) return { valid: false, errors };
  const expected = expectedSum(reached.value);
  const verified = sum.value === expected;
  return {
    valid: true,
    expected,
    result: {
      id: session.id,
      mode: 'minute',
      reached: reached.value,
      attempts: 1,
      mistakes: verified ? 0 : 1,
      correct: verified ? 1 : 0,
      verified,
      completed: session.endReason !== 'early',
      remainingSeconds: session.remainingSeconds,
      endedOn: localDayKey(new Date(now)),
      startedAt: new Date(session.startedAt).toISOString(),
      finishedAt: new Date(now).toISOString(),
      answer: sum.value,
      expected,
      endReason: session.endReason ?? 'time_up',
    },
  };
}

export function restoreAbacusSession(raw, now = Date.now()) {
  if (!raw || typeof raw !== 'object' || typeof raw.id !== 'string' || !raw.id
    || !['practice', 'minute'].includes(raw.mode)
    || !['practice', 'countdown', 'minute_running', 'minute_answer', 'result'].includes(raw.status)
    || !Number.isFinite(raw.startedAt)
    || !Number.isInteger(raw.reached) || raw.reached < 0 || raw.reached > 100
    || !Number.isInteger(raw.questionNo) || raw.questionNo < 1 || raw.questionNo > 101
    || ![raw.attempts, raw.mistakes, raw.correct].every(value => Number.isInteger(value) && value >= 0)
    || raw.attempts !== raw.mistakes + raw.correct
    || (raw.mode === 'practice' && raw.correct !== raw.reached)) return null;
  if (raw.mode === 'practice' && !['practice', 'result'].includes(raw.status)) return null;
  if (raw.mode === 'minute' && !['countdown', 'minute_running', 'minute_answer', 'result'].includes(raw.status)) return null;
  if (raw.mode === 'minute' && (!Number.isFinite(raw.countdownEndsAt) || !Number.isFinite(raw.deadline)
    || raw.deadline - raw.countdownEndsAt !== ABACUS_MINUTE_MS)) return null;
  if (raw.mode === 'practice' && raw.questionNo !== raw.reached + 1) return null;
  if (raw.status === 'result' && (!raw.result || raw.result.id !== raw.id || raw.result.mode !== raw.mode)) return null;
  if (raw.mode === 'practice' && raw.status === 'practice' && raw.reached === 100) {
    return { ...raw, status: 'result', result: practiceResult(raw, now), reported: false };
  }
  if (raw.status === 'countdown' && now >= raw.countdownEndsAt) {
    if (now >= raw.deadline) return { ...raw, status: 'minute_answer', endReason: 'time_up', remainingSeconds: 0 };
    return { ...raw, status: 'minute_running' };
  }
  if (raw.status === 'minute_running' && now >= raw.deadline) {
    return { ...raw, status: 'minute_answer', endReason: 'time_up', remainingSeconds: 0 };
  }
  return raw;
}

export function loadAbacusSession(storage, now = Date.now()) {
  try {
    const raw = (storage ?? globalThis.localStorage)?.getItem(ABACUS_SESSION_KEY);
    return raw ? restoreAbacusSession(JSON.parse(raw), now) : null;
  } catch {
    return null;
  }
}

export function hasResumableAbacusSession(storage, now = Date.now()) {
  const session = loadAbacusSession(storage, now);
  return Boolean(session && (session.status !== 'result' || !session.reported));
}
