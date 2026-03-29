import { ORDER_STATUS_CONFIG } from "@webshop/shared";
import { Chip } from "@mui/material";
import type { OrderStatus } from "@webshop/shared";

type Props = {
  status: OrderStatus;
};

export const OrderStatusChip = ({ status }: Props) => {
  const config = ORDER_STATUS_CONFIG[status];

  return <Chip label={config.label} color={config.color} size="small" />;
};
