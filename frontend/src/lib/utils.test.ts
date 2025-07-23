import { cn } from './utils';

describe('cn', () => {
  it('menggabungkan class string biasa', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('mengabaikan falsy value', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b');
  });

  it('menggabungkan object conditional', () => {
    expect(cn('a', { b: true, c: false })).toBe('a b');
  });

  it('menggabungkan array', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c');
  });
}); 