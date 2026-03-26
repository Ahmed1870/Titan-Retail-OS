export const validateSlug = (slug: string): boolean => /^[a-z0-9-]+$/.test(slug);
export const validatePhone = (phone: string): boolean => /^01[0125][0-9]{8}$/.test(phone);

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(amount);
};

export const calculateTax = (subtotal: number, rate: number = 0.14): number => {
  return Number((subtotal * rate).toFixed(2));
};
