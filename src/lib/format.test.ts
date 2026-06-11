import { describe, it, expect } from 'vitest';
import { formatCompact } from './format';

describe('formatCompact', () => {
  it('1000未満はそのまま表示する', () => {
    expect(formatCompact(999)).toBe('999');
  });

  it('1000以上は k 表記にする', () => {
    expect(formatCompact(70274)).toBe('70K');
  });

  it('100万以上は M 表記にする', () => {
    expect(formatCompact(1500000)).toBe('1.5M');
  });

  it('0 を表示できる', () => {
    expect(formatCompact(0)).toBe('0');
  });
});
