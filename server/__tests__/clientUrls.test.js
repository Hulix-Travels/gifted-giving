const { buildClientUrl } = require('../utils/clientUrls');

describe('buildClientUrl', () => {
  const originalClientUrl = process.env.CLIENT_URL;

  afterEach(() => {
    if (originalClientUrl) {
      process.env.CLIENT_URL = originalClientUrl;
    } else {
      delete process.env.CLIENT_URL;
    }
  });

  test('puts token in hash fragment', () => {
    process.env.CLIENT_URL = 'https://www.giftedgivings.com';
    const url = buildClientUrl('/verify-email', 'abc123');
    expect(url).toBe('https://www.giftedgivings.com/verify-email#token=abc123');
    expect(url).not.toContain('?token=');
  });

  test('encodes special characters in token', () => {
    const url = buildClientUrl('/reset-password', 'a+b/c=');
    expect(url).toContain('#token=a');
    expect(url).not.toContain('?token=');
  });
});
