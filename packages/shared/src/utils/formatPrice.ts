const formatter = new Intl.NumberFormat("hu-HU", {
  currency: "HUF",
  maximumFractionDigits: 0,
  style: "currency",
});

export const formatPriceHuf = (amountHuf: number): string => formatter.format(amountHuf);
