import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptIcon from "@mui/icons-material/Receipt";
import {
  Box,
  Button,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { formatPriceHuf } from "@webshop/shared";
import { Link, useNavigate } from "react-router";
import { fetchAdminStats } from "../../api/admin";
import { OrderStatusChip } from "../../components/admin/OrderStatusChip";
import { StatCard } from "../../components/admin/StatCard";
import { useAdminOrders } from "../../hooks/useAdminOrders";
import { formatDateHu } from "../../utils/formatDateHu";

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { data: ordersData, isLoading: isOrdersLoading } = useAdminOrders(undefined, 1);
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryFn: fetchAdminStats,
    queryKey: ["admin", "stats"],
  });

  return (
    <Box>
      <Typography component="h1" gutterBottom variant="h4">
        Irányítópult
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {isStatsLoading ? (
          [
            { key: "totalOrders", label: "Összes megrendelés" },
            { key: "pendingOrders", label: "Függőben lévő" },
            { key: "todayRevenue", label: "Mai bevétel" },
            { key: "activeProducts", label: "Aktív termékek" },
          ].map((card) => (
            <Grid key={card.key} size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 3 }}>
                <Skeleton height={48} sx={{ mb: 2 }} variant="rounded" width={48} />
                <Typography color="text.secondary" variant="body2">
                  {card.label}
                </Typography>
                <Skeleton height={42} width="40%" />
              </Paper>
            </Grid>
          ))
        ) : (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard icon={<ReceiptIcon />} label="Összes megrendelés" value={stats?.totalOrders ?? 0} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard icon={<HourglassEmptyIcon />} label="Függőben lévő" value={stats?.pendingOrders ?? 0} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard icon={<AttachMoneyIcon />} label="Mai bevétel" value={formatPriceHuf(stats?.todayRevenue ?? 0)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard icon={<InventoryIcon />} label="Aktív termékek" value={stats?.activeProducts ?? 0} />
            </Grid>
          </>
        )}
      </Grid>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 4 }}>
        <Button component={Link} to="/admin/termekek" variant="contained">
          Termékek kezelése
        </Button>
        <Button component={Link} to="/admin/megrendelesek" variant="outlined">
          Összes megrendelés lista
        </Button>
      </Stack>

      <Typography component="h2" sx={{ mb: 2 }} variant="h5">
        Legutóbbi rendelések
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rendelési szám</TableCell>
              <TableCell>Vevő</TableCell>
              <TableCell>Dátum</TableCell>
              <TableCell>Állapot</TableCell>
              <TableCell align="right">Összeg</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isOrdersLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton width={120} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={160} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={110} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={90} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton sx={{ ml: "auto" }} width={90} />
                    </TableCell>
                  </TableRow>
                ))
              : ordersData?.orders.map((order) => (
                  <TableRow
                    hover
                    key={order.id}
                    onClick={() => navigate(`/admin/megrendelesek/${order.id}`)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{formatDateHu(order.createdAt)}</TableCell>
                    <TableCell>
                      <OrderStatusChip status={order.status} />
                    </TableCell>
                    <TableCell align="right">{formatPriceHuf(order.totalHuf)}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
