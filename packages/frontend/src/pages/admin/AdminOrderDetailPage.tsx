import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Skeleton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { formatPriceHuf } from "@webshop/shared";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { OrderStatusChip } from "../../components/admin/OrderStatusChip";
import { useAdminOrder, useShipOrder } from "../../hooks/useAdminOrders";
import { formatDateHu } from "../../utils/formatDateHu";

export const AdminOrderDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: order, isLoading } = useAdminOrder(id ?? "");
  const shipOrder = useShipOrder();
  const [isShipDialogOpen, setIsShipDialogOpen] = useState(false);
  const [isSuccessSnackbarOpen, setIsSuccessSnackbarOpen] = useState(false);

  const handleOpenShipDialog = () => {
    setIsShipDialogOpen(true);
  };

  const handleCloseShipDialog = () => {
    if (!shipOrder.isPending) {
      setIsShipDialogOpen(false);
    }
  };

  const handleCloseSuccessSnackbar = () => {
    setIsSuccessSnackbarOpen(false);
  };

  const handleConfirmShipOrder = async () => {
    if (!order) {
      return;
    }

    await shipOrder.mutateAsync(order.id);
    setIsShipDialogOpen(false);
    setIsSuccessSnackbarOpen(true);
  };

  return (
    <Box>
      <Stack
        alignItems={{ md: "center", xs: "flex-start" }}
        direction={{ md: "row", xs: "column" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Stack alignItems={{ sm: "center", xs: "flex-start" }} direction={{ sm: "row", xs: "column" }} spacing={2}>
          <Button onClick={() => navigate("/admin/megrendelesek")} startIcon={<ArrowBackIcon />} variant="text">
            Vissza
          </Button>
          <Stack alignItems={{ sm: "center", xs: "flex-start" }} direction={{ sm: "row", xs: "column" }} spacing={1.5}>
            {isLoading ? (
              <>
                <Skeleton width={260} />
                <Skeleton width={90} />
              </>
            ) : (
              <>
                <Typography component="h1" variant="h4">
                  Megrendelés #{order?.orderNumber}
                </Typography>
                {order ? <OrderStatusChip status={order.status} /> : null}
              </>
            )}
          </Stack>
        </Stack>

        <Stack direction={{ sm: "row", xs: "column" }} spacing={1.5}>
          {order?.status === "paid" ? (
            <Button onClick={handleOpenShipDialog} startIcon={<LocalShippingIcon />} variant="contained">
              Szállítás indítása
            </Button>
          ) : null}
          <Button disabled startIcon={<DownloadIcon />} variant="outlined">
            Számla letöltése
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ md: 8, xs: 12 }}>
          <TableContainer component={Card}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Termék</TableCell>
                  <TableCell align="right">Egységár</TableCell>
                  <TableCell align="right">Mennyiség</TableCell>
                  <TableCell align="right">Összesen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton width="70%" />
                        </TableCell>
                        <TableCell align="right">
                          <Skeleton sx={{ ml: "auto" }} width={80} />
                        </TableCell>
                        <TableCell align="right">
                          <Skeleton sx={{ ml: "auto" }} width={30} />
                        </TableCell>
                        <TableCell align="right">
                          <Skeleton sx={{ ml: "auto" }} width={90} />
                        </TableCell>
                      </TableRow>
                    ))
                  : order?.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell align="right">{formatPriceHuf(item.productPriceHuf)}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{formatPriceHuf(item.lineTotalHuf)}</TableCell>
                      </TableRow>
                    ))}
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography fontWeight={600}>Részösszeg:</Typography>
                  </TableCell>
                  <TableCell align="right">
                    {isLoading ? <Skeleton sx={{ ml: "auto" }} width={90} /> : formatPriceHuf(order?.subtotalHuf ?? 0)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography fontWeight={600}>Szállítás:</Typography>
                  </TableCell>
                  <TableCell align="right">
                    {isLoading ? <Skeleton sx={{ ml: "auto" }} width={90} /> : formatPriceHuf(order?.shippingCostHuf ?? 0)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography fontWeight={700}>Összesen:</Typography>
                  </TableCell>
                  <TableCell align="right">
                    {isLoading ? (
                      <Skeleton sx={{ ml: "auto" }} width={90} />
                    ) : (
                      <Typography fontWeight={700}>{formatPriceHuf(order?.totalHuf ?? 0)}</Typography>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid size={{ md: 4, xs: 12 }}>
          <Stack spacing={2}>
            <Card>
              <CardContent>
                <Typography gutterBottom variant="h6">
                  Vevő adatai
                </Typography>
                {isLoading ? (
                  <>
                    <Skeleton width="70%" />
                    <Skeleton width="80%" />
                    <Skeleton width="55%" />
                  </>
                ) : (
                  <Stack spacing={0.5}>
                    <Typography>{order?.customerName}</Typography>
                    <Typography>{order?.customerEmail}</Typography>
                    <Typography>{order?.customerPhone}</Typography>
                  </Stack>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography gutterBottom variant="h6">
                  Szállítási cím
                </Typography>
                {isLoading ? (
                  <>
                    <Skeleton width="70%" />
                    <Skeleton width="85%" />
                    <Skeleton width="60%" />
                  </>
                ) : (
                  <Stack spacing={0.5}>
                    <Typography>Név: {order?.shippingName}</Typography>
                    <Typography>{order?.shippingZip} {order?.shippingCity}</Typography>
                    <Typography>{order?.shippingAddress}</Typography>
                  </Stack>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography gutterBottom variant="h6">
                  Számlázási cím
                </Typography>
                {isLoading ? (
                  <>
                    <Skeleton width="70%" />
                    <Skeleton width="85%" />
                    <Skeleton width="60%" />
                  </>
                ) : (
                  <Stack spacing={0.5}>
                    <Typography>Név: {order?.billingName}</Typography>
                    <Typography>{order?.billingZip} {order?.billingCity}</Typography>
                    <Typography>{order?.billingAddress}</Typography>
                    {order?.billingTaxNumber ? <Typography>Adószám: {order.billingTaxNumber}</Typography> : null}
                  </Stack>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography gutterBottom variant="h6">
                  Állapot
                </Typography>
                {isLoading ? (
                  <>
                    <Skeleton width="65%" />
                    <Skeleton width="65%" />
                    <Skeleton width="90%" />
                  </>
                ) : (
                  <Stack spacing={0.5}>
                    <Typography>Létrehozva: {order ? formatDateHu(order.createdAt) : "-"}</Typography>
                    <Typography>Frissítve: {order ? formatDateHu(order.updatedAt) : "-"}</Typography>
                    {order?.note ? (
                      <>
                        <Typography sx={{ fontStyle: "italic" }}>Megjegyzés:</Typography>
                        <Typography sx={{ fontStyle: "italic" }}>{order.note}</Typography>
                      </>
                    ) : null}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Dialog onClose={handleCloseShipDialog} open={isShipDialogOpen}>
        <DialogTitle>Szállítás indítása</DialogTitle>
        <DialogContent>
          <Typography>Biztosan el lett küldve a csomag?</Typography>
        </DialogContent>
        <DialogActions>
          <Button disabled={shipOrder.isPending} onClick={handleCloseShipDialog}>
            Mégse
          </Button>
          <Button disabled={shipOrder.isPending} onClick={handleConfirmShipOrder} variant="contained">
            {shipOrder.isPending ? <CircularProgress size={20} /> : "Igen, kiszállítva"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar autoHideDuration={3000} onClose={handleCloseSuccessSnackbar} open={isSuccessSnackbarOpen}>
        <Alert onClose={handleCloseSuccessSnackbar} severity="success" sx={{ width: "100%" }} variant="filled">
          Rendelés sikeresen frissítve!
        </Alert>
      </Snackbar>
    </Box>
  );
};
