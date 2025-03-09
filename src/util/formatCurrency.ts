export function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/,/g, ".");
}
