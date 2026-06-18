const { pickProgramFields, PROGRAM_WRITABLE_FIELDS } = require('../utils/programFields');

describe('pickProgramFields', () => {
  test('returns only allowlisted fields', () => {
    const body = {
      name: 'Education Fund',
      currentAmount: 99999,
      createdBy: 'hacker-id',
      status: 'active'
    };

    const picked = pickProgramFields(body);

    expect(picked).toEqual({
      name: 'Education Fund',
      status: 'active'
    });
    expect(picked.currentAmount).toBeUndefined();
    expect(picked.createdBy).toBeUndefined();
  });

  test('PROGRAM_WRITABLE_FIELDS excludes financial rollup fields', () => {
    expect(PROGRAM_WRITABLE_FIELDS).not.toContain('currentAmount');
    expect(PROGRAM_WRITABLE_FIELDS).not.toContain('createdBy');
    expect(PROGRAM_WRITABLE_FIELDS).not.toContain('slug');
  });
});
