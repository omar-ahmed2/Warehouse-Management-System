export const formatCurrency = (amount: number, currency = 'ج.م') => {
  return `${amount.toLocaleString('ar-EG')} ${currency}`;
};
