export const WORKSHEET_VERSION = 1;
export const WORKSHEET_SET_COUNT = 20;

const BLANK = '□';
const units = n => n % 10;
const tens = n => Math.floor(n / 10) % 10;

function seededNumbers(seed) {
  let state = seed;
  return (min, max) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return min + Math.floor((state / 0x100000000) * (max - min + 1));
  };
}

function pair(random, aRange, bRange, fits) {
  // Each rule has many valid pairs. The bound keeps an invalid future rule from hanging.
  for (let attempt = 0; attempt < 2048; attempt += 1) {
    const a = random(...aRange);
    const b = random(...bRange);
    if (fits(a, b)) return [a, b];
  }
  throw new Error('No numbers satisfy the worksheet rule');
}

function fill(text, answer) {
  const [left, right] = text.split(BLANK);
  return { left, right, answer: String(Number(answer)) };
}

function equation(a, sign, b, result, blank = 'result', reverse = false) {
  const values = { a, b, result };
  const show = key => key === blank ? BLANK : values[key];
  const expression = `${show('a')} ${sign} ${show('b')}`;
  return fill(reverse ? `${show('result')} = ${expression}` : `${expression} = ${show('result')}`, values[blank]);
}

const add = (a, b, blank, reverse) => equation(a, '+', b, a + b, blank, reverse);
const subtract = (a, b, blank, reverse) => equation(a, '−', b, a - b, blank, reverse);
const multiply = (a, b, blank) => equation(a, '×', b, a * b, blank);
const divide = (q, d, blank) => equation(q * d, '÷', d, q, blank);

function pairedSum(random, aRange, bRange, fits) {
  return add(...pair(random, aRange, bRange, fits));
}

function pairedDifference(random, aRange, bRange, fits) {
  return subtract(...pair(random, aRange, bRange, fits));
}

function decimal(a, sign, b, blank) {
  const format = n => (n / 10).toFixed(1);
  const result = sign === '+' ? a + b : a - b;
  return equation(format(a), sign, format(b), format(result), blank);
}

function remainderDivision(q, d, r, blank) {
  const values = { dividend: q * d + r, divisor: d, quotient: q, remainder: r };
  const show = key => key === blank ? BLANK : values[key];
  return fill(`${show('dividend')} ÷ ${show('divisor')} = ${show('quotient')} あまり ${show('remainder')}`, values[blank]);
}

function threeDigitSubtraction(random) {
  // Each digit can be subtracted without borrowing.
  const hundreds = random(3, 9);
  const ten = random(1, 9);
  const one = random(1, 9);
  return [hundreds * 100 + ten * 10 + one,
    random(1, hundreds - 1) * 100 + random(0, ten) * 10 + random(0, one)];
}

function exactDivision(random, dividendRange, quotientRange) {
  return pair(random, quotientRange, [2, 9], (q, d) => q * d >= dividendRange[0] && q * d <= dividendRange[1]);
}

function mixedMultiplication(random, form) {
  const a = form === 'first' ? random(2, 9) * 10 : random(12, 98);
  const b = random(2, 9);
  const c = random(2, 9);
  if (form === 'first') return fill(`${c} + ${a} × ${b} = □`, c + a * b);
  const sign = form === 'minus' ? '−' : '+';
  return fill(`${a} × ${b} ${sign} ${c} = □`, form === 'minus' ? a * b - c : a * b + c);
}

function mixedDivision(random, form) {
  const [q, d] = form === 'plus'
    ? pair(random, [20, 90], [2, 9], (quotient, divisor) => units(quotient) === 0 && quotient * divisor >= 100)
    : exactDivision(random, [100, 899], [24, 89]);
  const n = q * d;
  if (form === 'first') {
    const a = random(q + 1, 99);
    return fill(`${a} − ${n} ÷ ${d} = □`, a - q);
  }
  const b = random(2, 9);
  const sign = form === 'minus' ? '−' : '+';
  return fill(`${n} ÷ ${d} ${sign} ${b} = □`, form === 'minus' ? q - b : q + b);
}

function multiplyThenDivide(random) {
  const singleDigitDivisors = [2, 3, 4, 5, 6, 7, 8, 9];
  const [n, b] = pair(random, [12, 98], [2, 9], (a, multiplier) => (
    singleDigitDivisors.some(d => d !== multiplier && a * multiplier % d === 0)
  ));
  const divisors = singleDigitDivisors.filter(d => d !== b && n * b % d === 0);
  const d = divisors[random(0, divisors.length - 1)];
  return fill(`${n} × ${b} ÷ ${d} = □`, n * b / d);
}

function divideThenMultiply(random) {
  const [q, d] = exactDivision(random, [100, 999], [12, 98]);
  const multiplier = random(2, 9);
  return fill(`${q * d} ÷ ${d} × ${multiplier} = □`, q * multiplier);
}

function twoOperations(random, form) {
  const [a, b] = form === 'division-minus'
    ? pair(random, [12, 29], [2, 5], (n, multiplier) => n * multiplier < 90)
    : [random(12, 98), random(2, 9)];
  const d = random(2, 9);
  const product = a * b;
  const q = form === 'division-minus' ? random(Math.max(50, product + 1), 99)
    : form === 'division-plus' || form === 'multiply-plus' ? random(11, 99)
    : random(11, Math.min(99, product - 1));
  const dividend = q * d;
  if (form === 'division-minus') return fill(`${dividend} ÷ ${d} − ${a} × ${b} = □`, q - product);
  if (form === 'division-plus') return fill(`${dividend} ÷ ${d} + ${a} × ${b} = □`, q + product);
  if (form === 'missing-divisor') return fill(`${a} × ${b} − ${dividend} ÷ □ = ${product - q}`, d);
  const sign = form === 'multiply-plus' ? '+' : '−';
  return fill(`${a} × ${b} ${sign} ${dividend} ÷ ${d} = □`, form === 'multiply-plus' ? product + q : product - q);
}

// The order of these rules defines version 1. Keep it stable so saved results
// can always be reviewed against the same equations.
const sectionRules = [
  ['basics', '10・100と基本の計算', [
    r => { const a = r(1, 9); return add(a, 10 - a, 'b', true); },
    r => { const a = r(1, 9); return add(a, 10 - a, 'b', true); },
    r => { const b = r(1, 9); return add(10 - b, b, 'a', true); },
    r => { const a = 10 * r(1, 9); return add(a, 100 - a, 'b', true); },
    r => { const b = 10 * r(1, 9); return add(100 - b, b, 'a'); },
    r => pairedSum(r, [1, 8], [1, 8], (a, b) => a + b < 10),
    r => add(...pair(r, [1, 9], [1, 9], (a, b) => a + b > 10), 'result', true),
    r => pairedSum(r, [10, 98], [1, 9], (a, b) => units(a) + b < 10),
    r => pairedSum(r, [2, 9], [12, 89], (a, b) => a + units(b) >= 10),
    r => add(...pair(r, [12, 89], [2, 9], (a, b) => units(a) + b >= 10), 'result', true),
    r => { const a = r(2, 9); return subtract(a, r(1, a)); },
    r => { const a = r(2, 9); return subtract(a, r(1, a), 'result', true); },
    r => pairedDifference(r, [20, 99], [2, 9], (a, b) => units(a) < b),
    r => subtract(...pair(r, [20, 99], [2, 9], (a, b) => units(a) < b), 'result', true),
    r => pairedDifference(r, [20, 99], [2, 9], (a, b) => units(a) < b),
  ]],
  ['addition', '2けたのたし算', [
    r => { const a = r(1, 8); return add(a * 10, r(1, 9 - a) * 10); },
    r => { const a = r(2, 9); return add(a * 10, r(11 - a, 9) * 10); },
    r => { const a = r(1, 9) * 10; return add(a, 100 - a, 'result', true); },
    r => { const a = r(2, 9); return add(a * 10, r(11 - a, 9) * 10, 'b'); },
    r => { const b = r(1, 9) * 10; return add(100 - b, b, 'a'); },
    r => pairedSum(r, [11, 88], [11, 88], (a, b) => a + b < 100 && units(a) + units(b) < 10),
    r => { const a = r(11, 89); return add(a, r(1, 9 - tens(a)) * 10); },
    r => pairedSum(r, [12, 98], [12, 98], (a, b) => a + b >= 100 && units(a) + units(b) < 10),
    r => pairedSum(r, [12, 98], [12, 98], (a, b) => a + b >= 100 && units(a) + units(b) >= 10),
    r => pairedSum(r, [12, 98], [12, 98], (a, b) => a + b >= 100 && units(a) + units(b) >= 10),
  ]],
  ['subtraction', '2〜3けたのひき算', [
    r => { const a = r(2, 9); return subtract(a * 10, r(1, a - 1) * 10); },
    r => { const a = r(2, 9); return subtract(a * 10, r(1, a - 1) * 10); },
    r => { const b = r(3, 9); const difference = r(11 - b, 9); return subtract((b + difference) * 10, b * 10, 'a'); },
    r => { const difference = r(6, 8); const b = r(11 - difference, 9); return subtract((b + difference) * 10, b * 10); },
    r => { const difference = r(3, 9); const b = r(11 - difference, 9); return subtract((b + difference) * 10, b * 10, 'b'); },
    r => pairedDifference(r, [21, 99], [11, 89], (a, b) => tens(a) > tens(b) && units(a) >= units(b)),
    r => pairedDifference(r, [21, 98], [12, 89], (a, b) => a > b && units(a) < units(b)),
    r => {
      const [a, b] = pair(r, [11, 19], [12, 99], (ten, n) => ten * 10 - n >= 60 && ten * 10 - n < 100 && units(n) !== 0);
      return subtract(a * 10, b);
    },
    r => pairedDifference(r, [200, 998], [12, 99], (a, b) => units(a) < units(b) && tens(a) <= tens(b)),
    r => subtract(...threeDigitSubtraction(r), 'b'),
  ]],
  ['multiplication', '2けたのかけ算', [
    r => multiply(r(2, 9) * 10, r(2, 9)),
    r => multiply(r(12, 98), r(2, 9)),
    r => multiply(r(12, 98), r(2, 9)),
    r => { const b = r(2, 8); return multiply(r(11, Math.floor(99 / b)), b); },
    r => multiply(r(12, 98), r(2, 9)),
    r => multiply(r(12, 98), r(2, 9)),
    r => multiply(r(12, 98), r(2, 9)),
    r => multiply(r(12, 98), r(2, 9)),
    r => multiply(...pair(r, [21, 98], [2, 9], (a, b) => a * b >= 100), 'b'),
    r => multiply(...pair(r, [21, 98], [2, 9], (a, b) => a * b >= 100), 'a'),
  ]],
  ['division', 'わり算', [
    r => divide(10 * r(2, 9), r(5, 9)),
    r => divide(...exactDivision(r, [22, 99], [11, 45])),
    r => divide(...exactDivision(r, [22, 99], [11, 45])),
    r => divide(...exactDivision(r, [100, 899], [12, 98])),
    r => divide(...exactDivision(r, [100, 899], [12, 98]), 'a'),
    r => divide(...exactDivision(r, [100, 699], [12, 79])),
    r => divide(r(11, 19), r(5, 8)),
    r => divide(...exactDivision(r, [100, 899], [12, 98])),
    r => divide(...exactDivision(r, [100, 899], [12, 98])),
    r => divide(...exactDivision(r, [22, 99], [11, 49])),
  ]],
  ['three-digits', '3けたのたし算・ひき算', [
    r => { const a = r(2, 8); return add(a * 100, r(101, 999 - a * 100)); },
    r => pairedSum(r, [111, 889], [110, 890], (a, b) => units(b) === 0 && a + b < 1000 && tens(a) + tens(b) < 10),
    r => { const total = r(1001, 1009); const a = r(311, 789); return add(a, total - a); },
    r => { const a = r(101, 399); return add(a, 500 - a, 'b'); },
    r => { const b = r(101, 899); return add(1000 - b, b, 'a'); },
    r => { const a = r(3, 9) * 100; return subtract(a, r(101, a - 101)); },
    r => subtract(...threeDigitSubtraction(r)),
    r => pairedDifference(r, [201, 998], [109, 898], (a, b) => (
      Math.floor(a / 100) > Math.floor(b / 100) && units(a) < units(b) && tens(a) <= tens(b)
    )),
    r => { const a = r(301, 998); const difference = 100 * r(1, Math.floor((a - 100) / 100)); return subtract(a, a - difference, 'b'); },
    r => { const difference = r(101, 899); return subtract(1000, 1000 - difference, 'b'); },
  ]],
  ['decimals', '小数のたし算・ひき算', [
    r => { const a = 10 * r(1, 8) + r(6, 9); return decimal(a, '+', r(11 - units(a), 9)); },
    r => { const a = r(22, 98); return decimal(a, '+', r(Math.max(11, 101 - a), 99)); },
    r => decimal(r(111, 889), '+', r(11, 98)),
    r => {
      const [a, b] = pair(r, [111, 899], [111, 899], (a, b) => units(a) + units(b) >= 10);
      return decimal(a, '+', b);
    },
    r => { const [a, b] = pair(r, [111, 889], [111, 889], (x, y) => x + y < 1000); return decimal(a, '+', b, 'b'); },
    r => { const [a, b] = pair(r, [21, 98], [12, 89], (x, y) => x > y && units(x) < units(y)); return decimal(a, '−', b); },
    r => { const [a, b] = pair(r, [211, 998], [111, 898], (x, y) => (
      Math.floor(x / 100) > Math.floor(y / 100) && tens(x) >= tens(y) && units(x) >= units(y)
    )); return decimal(a, '−', b); },
    r => { const [a, b] = pair(r, [211, 998], [112, 898], (x, y) => (
      Math.floor(x / 100) > Math.floor(y / 100) && tens(x) < tens(y) && units(x) >= units(y)
    )); return decimal(a, '−', b); },
    r => { const a = r(211, 998); return decimal(a, '−', a - r(71, 99), 'b'); },
    r => { const a = r(411, 998); return decimal(a, '−', a - r(112, Math.min(499, a - 111)), 'b'); },
  ]],
  ['large-multiply-divide', '大きな数とあまりのあるわり算', [
    r => multiply(r(1, 4) * 100 + r(1, 4) * 10 + r(1, 4), 2),
    r => multiply(r(1, 9) * 100 + r(1, 9), r(3, 9)),
    r => multiply(r(112, 898), r(3, 9)),
    r => { const d = r(2, 4); const digit = Math.floor(9 / d); return divide(r(1, digit) * 100 + r(0, digit) * 10 + r(1, digit), d); },
    r => divide(r(1, 9) * 100 + r(1, 9), r(3, 9)),
    r => divide(...exactDivision(r, [1000, 8999], [101, 998])),
    r => {
      const [h, d] = pair(r, [2, 8], [3, 9], (a, b) => (a * 100) % b !== 0 && Math.floor(a * 100 / b) < 100);
      return remainderDivision(Math.floor(h * 100 / d), d, (h * 100) % d, 'quotient');
    },
    r => { const d = r(3, 9); return remainderDivision(r(34, 94), d, r(1, d - 1), 'remainder'); },
    r => { const d = r(3, 9); return remainderDivision(r(34, 94), d, r(1, d - 1), 'divisor'); },
    r => { const d = r(3, 6); return remainderDivision(r(112, Math.floor(999 / d) - 1), d, r(1, d - 1), 'dividend'); },
  ]],
  ['order', '計算の順じょ', [
    r => mixedMultiplication(r, 'plus'),
    r => mixedMultiplication(r, 'first'),
    r => mixedMultiplication(r, 'minus'),
    r => mixedDivision(r, 'minus'),
    r => mixedDivision(r, 'first'),
    r => mixedDivision(r, 'plus'),
    multiplyThenDivide,
    divideThenMultiply,
    multiplyThenDivide,
    divideThenMultiply,
    r => twoOperations(r, 'multiply-plus'),
    r => twoOperations(r, 'division-minus'),
    r => twoOperations(r, 'multiply-minus'),
    r => twoOperations(r, 'division-plus'),
    r => twoOperations(r, 'missing-divisor'),
  ]],
];

let end = 0;
export const WORKSHEET_SECTIONS = Object.freeze(sectionRules.map(([id, label, rules]) => {
  const start = end + 1;
  end += rules.length;
  return Object.freeze({ id, label, start, end });
}));

function buildWorksheets() {
  const worksheets = [];
  for (let index = 0; index < WORKSHEET_SET_COUNT; index += 1) {
    const random = seededNumbers(41239 + index * 80669);
    const seen = new Set();
    const set = sectionRules.flatMap(([sectionId, , rules], sectionIndex) => rules.map((rule, offset) => {
      const number = WORKSHEET_SECTIONS[sectionIndex].start + offset;
      const previous = worksheets[index - 1]?.[number - 1];
      for (let attempt = 0; attempt < 256; attempt += 1) {
        const problem = rule(random);
        const signature = `${problem.left}□${problem.right}`;
        if (seen.has(signature) || (previous?.left === problem.left && previous.right === problem.right)) continue;
        seen.add(signature);
        return Object.freeze({ number, sectionId, ...problem });
      }
      throw new Error(`Could not choose a distinct problem for question ${number}`);
    }));
    worksheets.push(Object.freeze(set));
  }
  return worksheets;
}

const worksheets = buildWorksheets();
const emptyWorksheet = Object.freeze([]);

export function getWorksheet(setNumber) {
  return Number.isInteger(setNumber) ? worksheets[setNumber - 1] ?? emptyWorksheet : emptyWorksheet;
}
