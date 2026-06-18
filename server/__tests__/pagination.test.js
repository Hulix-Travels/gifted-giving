const { parsePagination, MAX_LIMIT } = require('../utils/pagination');

describe('parsePagination', () => {
  test('uses defaults when query is empty', () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 10, skip: 0 });
  });

  test('respects page and limit', () => {
    expect(parsePagination({ page: '3', limit: '25' })).toEqual({
      page: 3,
      limit: 25,
      skip: 50
    });
  });

  test('caps limit at MAX_LIMIT', () => {
    expect(parsePagination({ limit: '9999' }).limit).toBe(MAX_LIMIT);
  });

  test('enforces minimum page and limit of 1', () => {
    expect(parsePagination({ page: '0', limit: '-5' })).toEqual({
      page: 1,
      limit: 1,
      skip: 0
    });
  });
});
