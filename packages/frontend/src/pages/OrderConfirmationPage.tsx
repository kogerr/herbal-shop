import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { Box, Button, Chip, Divider, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { formatPriceHuf } from "@webshop/shared";
import { Link } from "react-router";
import { fetchOrder } from "../api/orders";
import { PageContainer } from "../components/layout/PageContainer";

type LastOrderSession = {
  accessToken: string;
  orderId: string;
};

const parseLastOrderSession = (): LastOrderSession | null => {
  const rawLastOrder = sessionStorage.getItem("last-order");

  if (!rawLastOrder) {
    return null;
  }

  try {
    const parsedLastOrder = JSON.parse(rawLastOrder) as unknown;

    if (
      typeof parsedLastOrder === "object" &&
      parsedLastOrder !== null &&
      "orderId" in parsedLastOrder &&
      "accessToken" in parsedLastOrder &&
      typeof parsedLastOrder.orderId === "string" &&
      typeof parsedLastOrder.accessToken === "string"
    ) {
      return {
        accessToken: parsedLastOrder.accessToken,
        orderId: parsedLastOrder.orderId,
      };
    }

    return null;
  } catch {
    return null;
  }
};

export const OrderConfirmationPage = () => {
  const lastOrder = parseLastOrderSession();

  const { data: order, isLoading } = useQuery({
    enabled: Boolean(lastOrder),
    queryFn: () => fetchOrder(lastOrder!.orderId, lastOrder!.accessToken),
    queryKey: ["order", lastOrder?.orderId],
  });

  return (
    <PageContainer>
      <Box sx={{ py: 4, textAlign: "center" }} data-test-id="orderConfirmation">
        <CheckCircleIcon sx={{ color: "success.main", fontSize: 64, mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Köszönjük a rendelését!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          A rendelés részleteit az alábbiakban találja.
        </Typography>

        {isLoading ? (
          <Paper sx={{ maxWidth: 600, mx: "auto", p: 4, textAlign: "left" }}>
            <Skeleton variant="text" width="50%" height={40} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="60%" sx={{ mb: 2 }} />
            <Divider sx={{ my: 2 }} />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="75%" />
            <Skeleton variant="text" width="65%" sx={{ mb: 2 }} />
            <Divider sx={{ my: 2 }} />
            <Skeleton variant="text" width="45%" />
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="50%" />
          </Paper>
        ) : order ? (
          <Paper sx={{ maxWidth: 600, mx: "auto", p: 4, textAlign: "left" }}>
            <Typography variant="h5" gutterBottom>
              Rendelés részletei
            </Typography>

            <Box
              sx={{
                alignItems: { sm: "center", xs: "flex-start" },
                display: "flex",
                flexDirection: { sm: "row", xs: "column" },
                gap: 1,
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography variant="body1" fontWeight={600}>
                Rendelési szám: {order.orderNumber}
              </Typography>
              <Chip label="Feldolgozás alatt" color="warning" size="small" />
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1.5} sx={{ mb: 2 }}>
              {order.items.map((item) => (
                <Box
                  key={item.id}
                  sx={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}
                >
                  <Typography color="text.secondary">
                    {item.productName} × {item.quantity}
                  </Typography>
                  <Typography fontWeight={600}>{formatPriceHuf(item.lineTotalHuf)}</Typography>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1} sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">Részösszeg</Typography>
                <Typography>{formatPriceHuf(order.subtotalHuf)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">Szállítás</Typography>
                <Typography>
                  {order.shippingCostHuf === 0 ? "Ingyenes" : formatPriceHuf(order.shippingCostHuf)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6">Összesen</Typography>
                <Typography variant="h6">{formatPriceHuf(order.totalHuf)}</Typography>
              </Box>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Szállítási cím
            </Typography>
            <Typography color="text.secondary">{order.shippingName}</Typography>
            <Typography color="text.secondary">
              {order.shippingZip} {order.shippingCity}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {order.shippingAddress}
            </Typography>

            <Stack direction={{ sm: "row", xs: "column" }} spacing={2}>
              <Button variant="outlined" disabled startIcon={<ReceiptIcon />}>
                Számla letöltése
              </Button>
              <Button variant="contained" component={Link} to="/termekek">
                Tovább vásárolok
              </Button>
            </Stack>
          </Paper>
        ) : (
          <Paper sx={{ maxWidth: 600, mx: "auto", p: 4 }}>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              A rendelés adatai jelenleg nem érhetők el.
            </Typography>
            <Button variant="contained" component={Link} to="/termekek">
              Tovább vásárolok
            </Button>
          </Paper>
        )}
      </Box>
    </PageContainer>
  );
};
