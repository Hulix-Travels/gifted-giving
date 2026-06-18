const { generateAccessToken, isTokenSessionValid } = require('../utils/jwtTokens');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../utils/jwtSecret');

describe('jwtTokens', () => {
  test('isTokenSessionValid matches user tokenVersion', () => {
    const user = { _id: 'abc', tokenVersion: 2 };
    expect(isTokenSessionValid(user, { tv: 2 })).toBe(true);
    expect(isTokenSessionValid(user, { tv: 1 })).toBe(false);
    expect(isTokenSessionValid(user, {})).toBe(false);
  });

  test('generateAccessToken embeds tokenVersion', () => {
    const user = { _id: 'user123', tokenVersion: 3 };
    const token = generateAccessToken(user);
    const decoded = jwt.verify(token, getJwtSecret());
    expect(decoded.userId).toBe('user123');
    expect(decoded.tv).toBe(3);
  });
});
