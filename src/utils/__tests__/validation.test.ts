import { isValidEmail, isValidPassword } from '../validation';

describe('validation', () => {
  it('accepts normal emails and rejects broken ones', () => {
    expect(isValidEmail('a@example.com')).toBe(true);
    expect(isValidEmail('  a@example.com ')).toBe(true);
    expect(isValidEmail('a@example')).toBe(false);
    expect(isValidEmail('a b@example.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('requires at least 6 password characters', () => {
    expect(isValidPassword('12345')).toBe(false);
    expect(isValidPassword('123456')).toBe(true);
  });
});
