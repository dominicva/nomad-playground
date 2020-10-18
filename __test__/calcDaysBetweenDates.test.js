import { calcDaysBetweenDates } from '../src/client/js/app';

// particularly useful for edge cases 
// i.e. dates one day apart or both same day
describe('Testing util function that calculates num days between two dates', () => {
  test('Testing calcDaysBetweenDates function', () => {
    const result = calcDaysBetweenDates('01/01/2020', '01/02/2020');
    const expected = 1;
    expect(result).toBe(expected);
  });
});
