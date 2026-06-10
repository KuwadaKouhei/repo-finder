export const formatCompact = (n: number): string =>
  new Intl.NumberFormat('en', { notation: 'compact' }).format(n);
