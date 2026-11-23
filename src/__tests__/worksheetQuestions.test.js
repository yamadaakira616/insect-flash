import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { getWorksheet, WORKSHEET_SECTIONS, WORKSHEET_SET_COUNT, WORKSHEET_VERSION } from '../utils/worksheetQuestions.js';

const worksheetBank = Array.from({ length: WORKSHEET_SET_COUNT }, (_, index) => getWorksheet(index + 1));
const printed = question => `${question.left}□${question.right}`;

// Numbers denote the digits before the decimal point. "d" adds one decimal place.
const formats = [
  // 1–15: complements, then one- and two-digit arithmetic.
  '2 = 1 + □', '2 = 1 + □', '2 = □ + 1', '3 = 2 + □', '□ + 2 = 3',
  '1 + 1 = □', '□ = 1 + 1', '2 + 1 = □', '1 + 2 = □', '□ = 2 + 1',
  '1 − 1 = □', '□ = 1 − 1', '2 − 1 = □', '□ = 2 − 1', '2 − 1 = □',
  // 16–35: two- and three-digit addition/subtraction, including missing terms.
  '2 + 2 = □', '2 + 2 = □', '□ = 2 + 2', '2 + □ = 3', '□ + 2 = 3',
  '2 + 2 = □', '2 + 2 = □', '2 + 2 = □', '2 + 2 = □', '2 + 2 = □',
  '2 − 2 = □', '2 − 2 = □', '□ − 2 = 2', '3 − 2 = □', '3 − □ = 2',
  '2 − 2 = □', '2 − 2 = □', '3 − 2 = □', '3 − 2 = □', '3 − □ = 3',
  // 36–55: two-digit multiplication and exact division.
  ...Array(8).fill('2 × 1 = □'), '2 × □ = 3', '□ × 1 = 3',
  '3 ÷ 1 = □', '2 ÷ 1 = □', '2 ÷ 1 = □', '3 ÷ 1 = □', '□ ÷ 1 = 2',
  '3 ÷ 1 = □', '[23] ÷ 1 = □', '3 ÷ 1 = □', '3 ÷ 1 = □', '2 ÷ 1 = □',
  // 56–75: three-digit arithmetic and tenths.
  '3 + 3 = □', '3 + 3 = □', '3 + 3 = □', '3 + □ = 3', '□ + 3 = 4',
  '3 − 3 = □', '3 − 3 = □', '3 − 3 = □', '3 − □ = 3', '4 − □ = 3',
  '1d + 1d = □', '1d + 1d = □', '2d + 1d = □', '2d + 2d = □', '2d + □ = 2d',
  '1d − 1d = □', '2d − 2d = □', '2d − 2d = □', '2d − □ = 1d', '2d − □ = 2d',
  // 76–85: larger products/quotients and each of the four remainder blanks.
  '3 × 1 = □', '3 × 1 = □', '3 × 1 = □', '3 ÷ 1 = □', '[34] ÷ 1 = □', '4 ÷ 1 = □',
  '3 ÷ 1 = □ あまり 1', '3 ÷ 1 = 2 あまり □', '3 ÷ □ = 2 あまり 1', '□ ÷ 1 = 3 あまり 1',
  // 86–100: order of operations, including the final missing divisor.
  '2 × 1 + 1 = □', '1 + 2 × 1 = □', '2 × 1 − 1 = □',
  '3 ÷ 1 − 1 = □', '2 − 3 ÷ 1 = □', '3 ÷ 1 + 1 = □',
  '2 × 1 ÷ 1 = □', '3 ÷ 1 × 1 = □', '2 × 1 ÷ 1 = □', '3 ÷ 1 × 1 = □',
  '2 × 1 + [23] ÷ 1 = □', '3 ÷ 1 − 2 × 1 = □', '2 × 1 − [23] ÷ 1 = □',
  '[23] ÷ 1 + 2 × 1 = □', '2 × 1 − [23] ÷ □ = [123]',
].map(format => new RegExp(`^${format.replaceAll('+', '\\+')}$`));

function formatOf(question) {
  return printed(question).replace(/\d+(?:\.\d+)?/g, number => {
    const [whole, decimal] = number.split('.');
    return `${whole.length}${decimal ? 'd' : ''}`;
  });
}

function evaluate(expression) {
  const [initial, ...tokens] = expression.trim().split(' ');
  let sum = 0;
  let term = Number(initial);
  for (let index = 0; index < tokens.length; index += 2) {
    const sign = tokens[index];
    const next = Number(tokens[index + 1]);
    if (sign === '×') {
      term *= next;
    } else if (sign === '÷') {
      if (next === 0 || term % next !== 0) return Number.NaN;
      term /= next;
    } else {
      sum += term;
      term = sign === '−' ? -next : next;
    }
  }
  return sum + term;
}

describe('worksheet patterns', () => {
  it('has 20 stable 100-question sets with no repeated printed question within a set or at the same position in consecutive sets', () => {
    expect(WORKSHEET_SET_COUNT).toBe(20);
    expect(WORKSHEET_VERSION).toBe(1);
    expect(formats).toHaveLength(100);
    expect(getWorksheet(0)).toEqual([]);
    expect(getWorksheet(21)).toEqual([]);
    expect(getWorksheet(1.5)).toEqual([]);
    expect(createHash('sha256').update(JSON.stringify(worksheetBank)).digest('hex'))
      .toBe('57aa49b15a863fbd87b609352eb8a0d3e06fd5a8e43ba008f9b7c0ef969eeebd');

    worksheetBank.forEach((worksheet, setIndex) => {
      expect(worksheet).toHaveLength(100);
      expect(new Set(worksheet.map(printed)).size).toBe(100);
      worksheet.forEach((question, index) => {
        const number = index + 1;
        const section = WORKSHEET_SECTIONS.find(({ start, end }) => number >= start && number <= end);
        expect(question.number).toBe(number);
        expect(question.sectionId).toBe(section.id);
        expect(formatOf(question), `Set ${setIndex + 1} Q${number}: ${printed(question)}`).toMatch(formats[index]);
        if (setIndex > 0) expect(printed(question)).not.toBe(printed(worksheetBank[setIndex - 1][index]));
      });
    });
  });

  it('solves every printed equation using the stored answer, including decimals and division remainders', () => {
    worksheetBank.flat().forEach(question => {
      expect(question.answer).toMatch(/^\d+(?:\.\d)?$/);
      const equation = `${question.left}${question.answer}${question.right}`;
      if (equation.includes('あまり')) {
        const [, dividend, divisor, quotient, remainder] = equation.match(/^(\d+) ÷ (\d+) = (\d+) あまり (\d+)$/);
        const [n, d, q, r] = [dividend, divisor, quotient, remainder].map(Number);
        expect(d).toBeGreaterThan(0);
        expect(r).toBeGreaterThan(0);
        expect(r).toBeLessThan(d);
        expect(n).toBe(d * q + r);
      } else {
        const [left, right] = equation.split(' = ');
        expect(evaluate(left), equation).toBeCloseTo(evaluate(right), 10);
      }
    });
  });
});
