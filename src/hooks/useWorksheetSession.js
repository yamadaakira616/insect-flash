import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WORKSHEET_SET_COUNT, WORKSHEET_SECTIONS, WORKSHEET_VERSION } from '../utils/worksheetQuestions.js';
import {
  WORKSHEET_LIMIT_SECONDS, WORKSHEET_MODE_LABELS, cleanWorksheetAnswer,
  gradeWorksheet, isWorksheetAnswered, questionsForSession,
} from '../utils/worksheetProgress.js';

const DRAFT_KEY = 'sticker-atelier-worksheet-draft-v1';
const HISTORY_KEY = 'sticker-atelier-worksheet-history-v1';

function readStored(key) {
  return JSON.parse(localStorage.getItem(key));
}

function loadHistory() {
  const history = readStored(HISTORY_KEY);
  if (history === null) return [];
  if (!Array.isArray(history)) throw new Error('Invalid worksheet history');
  return history.filter(record => record?.id && Array.isArray(record.items));
}

function readWorksheetHistory() {
  try {
    return loadHistory();
  } catch {
    return [];
  }
}

function restoreSession() {
  try {
    const draft = readStored(DRAFT_KEY);
    if (!draft || !draft.id || !draft.answers || !draft.skipped || !Array.isArray(draft.sectionIds)) return null;
    if (!Object.hasOwn(WORKSHEET_MODE_LABELS, draft.mode) || !Number.isFinite(draft.startedAt)) return null;
    if (draft.mode === 'test' && !Number.isFinite(draft.deadline)) return null;
    if (draft.mode !== 'test' && draft.deadline !== null) return null;
    if (!Number.isInteger(draft.setNumber) || draft.setNumber < 1 || draft.setNumber > WORKSHEET_SET_COUNT) return null;
    const count = questionsForSession(draft).length;
    if (!count || !Number.isInteger(draft.index) || draft.index < 0 || draft.index >= count) return null;
    if (readWorksheetHistory().some(record => record.id === draft.id)) return null;
    return draft;
  } catch {
    return null;
  }
}

function updateDraft(draft) {
  if (draft) localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  else localStorage.removeItem(DRAFT_KEY);
}

export function useWorksheetSession() {
  const [session, setSession] = useState(restoreSession);
  const latest = useRef(session);
  const [history, setHistory] = useState(readWorksheetHistory);
  const [result, setResult] = useState(null);
  const [storageError, setStorageError] = useState(false);
  const [now, setNow] = useState(Date.now);
  const questions = useMemo(() => questionsForSession(session), [session?.version, session?.mode, session?.setNumber, session?.sectionIds]);

  const saveDraft = useCallback((draft) => {
    latest.current = draft;
    setSession(draft);
    try {
      updateDraft(draft);
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, []);

  const finish = useCallback((time) => {
    const draft = latest.current;
    if (!draft) return;
    let record = gradeWorksheet(draft, questionsForSession(draft), time);
    let nextHistory = [record];
    latest.current = null;
    setSession(null);
    try {
      const stored = loadHistory();
      const existing = stored.find(item => item.id === draft.id);
      record = existing ?? record;
      nextHistory = existing ? stored : [record, ...stored];
      if (!existing) localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
      if (readStored(DRAFT_KEY)?.id === draft.id) updateDraft(null);
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
    setResult(record);
    setHistory(previous => {
      const savedIds = new Set(nextHistory.map(item => item.id));
      return [...nextHistory, ...previous.filter(item => !savedIds.has(item.id))];
    });
  }, []);

  useEffect(() => {
    const deadline = session?.deadline;
    if (deadline == null) return;
    let lastRemaining = null;
    function tick() {
      const time = Date.now();
      if (latest.current?.deadline !== deadline) return;
      const remaining = Math.max(0, Math.ceil((deadline - time) / 1000));
      if (remaining !== lastRemaining) {
        lastRemaining = remaining;
        setNow(time);
      }
      if (remaining === 0) finish(time);
    }
    const timer = window.setInterval(tick, 200);
    document.addEventListener('visibilitychange', tick);
    tick();
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [session?.deadline, session?.id, finish]);

  function start({ mode, setNumber, sectionIds = [] }) {
    if (!Object.hasOwn(WORKSHEET_MODE_LABELS, mode)) return;
    if (!Number.isInteger(setNumber) || setNumber < 1 || setNumber > WORKSHEET_SET_COUNT) return;
    const sections = mode === 'practice'
      ? WORKSHEET_SECTIONS.filter(section => sectionIds.includes(section.id)).map(section => section.id)
      : [];
    if (mode === 'practice' && !sections.length) return;
    const startedAt = Date.now();
    const id = globalThis.crypto?.randomUUID?.() ?? `${startedAt}-${Math.random().toString(36).slice(2)}`;
    setResult(null);
    setNow(startedAt);
    saveDraft({
      id, version: WORKSHEET_VERSION, mode, setNumber, sectionIds: sections, startedAt,
      deadline: mode === 'test' ? startedAt + WORKSHEET_LIMIT_SECONDS * 1000 : null,
      index: 0, answers: {}, skipped: {},
    });
  }

  function changeDraft(change) {
    const draft = latest.current;
    if (!draft) return;
    const time = Date.now();
    if (draft.deadline !== null && time >= draft.deadline) {
      finish(time);
      return;
    }
    const updated = change(draft);
    if (updated !== draft) saveDraft(updated);
  }

  function setAnswer(raw) {
    const value = cleanWorksheetAnswer(raw);
    if (value.length > 12 || !/^[0-9]*(?:\.[0-9]*)?$/.test(value)) return;
    changeDraft(draft => {
      const { number } = questions[draft.index];
      return {
        ...draft,
        answers: { ...draft.answers, [number]: value },
        skipped: { ...draft.skipped, [number]: false },
      };
    });
  }

  function goTo(index) {
    if (!Number.isInteger(index) || index < 0 || index >= questions.length) return;
    changeDraft(draft => ({ ...draft, index }));
  }

  function unansweredAfter(draft) {
    const isOpen = ({ number }) => !isWorksheetAnswered(draft.answers[number]);
    const next = questions.findIndex((question, index) => index > draft.index && isOpen(question));
    return next >= 0 ? next : questions.findIndex((question, index) => index < draft.index && isOpen(question));
  }

  function moveForward(draft) {
    if (draft.index < questions.length - 1) return draft.index + 1;
    const next = unansweredAfter(draft);
    return next >= 0 ? next : draft.index;
  }

  const answeredCount = questions.filter(({ number }) => isWorksheetAnswered(session?.answers[number])).length;
  const remainingSeconds = session?.deadline == null ? null : Math.max(0, Math.ceil((session.deadline - now) / 1000));

  return {
    session, questions, history, active: !!session, result, remainingSeconds, answeredCount, storageError,
    start, setAnswer, goTo,
    next: () => changeDraft(draft => ({ ...draft, index: moveForward(draft) })),
    skip: () => changeDraft(draft => {
      const number = questions[draft.index].number;
      return { ...draft, index: moveForward(draft), skipped: { ...draft.skipped, [number]: true } };
    }),
    nextUnanswered: () => changeDraft(draft => {
      const next = unansweredAfter(draft);
      return next >= 0 ? { ...draft, index: next } : draft;
    }),
    submit: () => finish(Date.now()),
    clear: () => {
      if (latest.current) saveDraft(null);
      setResult(null);
    },
  };
}
