import { getWorksheet, WORKSHEET_VERSION } from './worksheetQuestions.js';

export const WORKSHEET_LIMIT_SECONDS = 300;

export const WORKSHEET_MODE_LABELS = {
  test: '5分テスト',
  untimed: '時間無制限',
  practice: '練習',
};

export function cleanWorksheetAnswer(value) {
  return String(value ?? '').normalize('NFKC').trim();
}

export function isWorksheetAnswered(value) {
  return /^(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)$/.test(cleanWorksheetAnswer(value));
}

export function questionsForSession(session) {
  if (!session || session.version !== WORKSHEET_VERSION) return [];
  const questions = getWorksheet(session.setNumber);
  return session.mode === 'practice'
    ? questions.filter(question => session.sectionIds.includes(question.sectionId))
    : questions;
}

export function gradeWorksheet(session, questions, now) {
  const timedOut = session.deadline !== null && now >= session.deadline;
  const endedAt = timedOut ? session.deadline : now;
  const items = questions.map(question => {
    const answer = cleanWorksheetAnswer(session.answers[question.number]);
    const given = isWorksheetAnswered(answer) ? answer : '';
    const status = !given ? 'unanswered' : Number(given) === Number(question.answer) ? 'correct' : 'incorrect';
    return { ...question, given, status };
  });
  const correct = items.filter(item => item.status === 'correct').length;
  const incorrect = items.filter(item => item.status === 'incorrect').length;

  return {
    id: session.id,
    mode: session.mode,
    setNumber: session.setNumber,
    sectionIds: session.sectionIds,
    endedAt,
    elapsedSeconds: Math.max(0, Math.floor((endedAt - session.startedAt) / 1000)),
    timedOut,
    total: items.length,
    score: items.length ? Math.round(correct * 100 / items.length) : 0,
    correct,
    incorrect,
    unanswered: items.length - correct - incorrect,
    items,
  };
}
