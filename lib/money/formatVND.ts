/** Formate un montant VND entier en chaîne lisible, ex. 2400000 -> "2.400.000₫". */
export function formatVND(amount: number): string {
  const rounded = Math.round(amount);
  const negative = rounded < 0;
  const digits = Math.abs(rounded).toString();
  const withDots = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${negative ? "-" : ""}${withDots}₫`;
}
