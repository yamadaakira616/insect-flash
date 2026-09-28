// 公益社団法人全国珠算教育連盟。日本珠算連盟・日本フラッシュ暗算検定協会とは別基準。
// 出典・確認範囲は docs/exam-alignment.md を参照（2026-09-28確認）。
// 7級は6級と桁数・口数・秒数が同じでも出題範囲の確認が必要なため未対応。
export const EXAM_STANDARDS = [
  [10, '10級', 1, 4, 4], [14, '9級', 1, 5, 5], [17, '8級', 1, 6, 6],
  [25, '6級', 2, 3, 3], [28, '5級', 2, 4, 4], [31, '4級', 2, 5, 4],
  [35, '3級', 2, 6, 5], [40, '2級', 2, 8, 7], [44, '1級', 2, 10, 8],
  [52, '初段', 3, 4, 4], [54, '二段', 3, 5, 4], [56, '三段', 3, 6, 4],
  [58, '四段', 3, 7, 4], [59, '五段', 3, 8, 4],
].map(([level, grade, digits, count, totalSeconds]) => ({ level, grade, digits, count, totalSeconds }));

export const EXAM_QUESTIONS = 15;
export const EXAM_PASS_COUNT = 10;
export const ANSWER_SECONDS = 10;
export const EXAM_BY_LEVEL = Object.fromEntries(EXAM_STANDARDS.map(item => [item.level, item]));
