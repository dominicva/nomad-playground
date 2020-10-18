import { trips } from "../src/server/index";

describe('Check trips data type is indeed object', () => {
  test('Testing trips data container', () => {
    const tripsDataType = typeof trips;
    expect(tripsDataType).toBe('object');
  });
});
