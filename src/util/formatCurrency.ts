export function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/,/g, ".");
}

export const formatCurrencyRp = (value: number) => {
  return `Rp ${formatCurrency(value)}`;
};

export function formatCurrencyShort(value: number): string {
  if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1).replace(/\.0$/, "")}m`;
  } else if (value >= 1000 && value < 1000000) {
    return `Rp ${(value / 1000).toFixed(0)}rb`;
  } else {
    return `Rp ${value.toLocaleString("id-ID")}`;
  }
}
