import { Typography } from "@mui/material";
import type { TypographyProps } from "@mui/material";
import { formatPriceHuf } from "@webshop/shared";

type Props = {
  amount: number;
  variant?: TypographyProps["variant"];
};

export const PriceDisplay = ({ amount, variant = "body1" }: Props) => {
  return (
    <Typography variant={variant} color="primary" fontWeight={600} data-test-id="priceDisplay">
      {formatPriceHuf(amount)}
    </Typography>
  );
};
