import ReceiptIcon from "@mui/icons-material/Receipt";
import {
  Box,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { formatPriceHuf, type OrderStatus } from "@webshop/shared";
import { useState } from "react";
import { useNavigate } from "react-router";
import { OrderStatusChip } from "../../components/admin/OrderStatusChip";
import { useAdminOrders } from "../../hooks/useAdminOrders";
import { formatDateHu } from "../../utils/formatDateHu";

type StatusFilterOption = {
  label: string;
  value: "all" | OrderStatus;
};

const STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
  { label: "Mind", value: "all" },
  { label: "Függőben", value: "pending" },
  { label: "Fizetve", value: "paid" },
  { label: "Kiszállítva", value: "shipped" },
  { label: "Kézbesítve", value: "delivered" },
  { label: "Lemondva", value: "cancelled" },
];

export const AdminOrderListPage = () => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<"all" | OrderStatus>("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { data: ordersData, isLoading } = useAdminOrders(selectedStatus === "all" ? undefined : selectedStatus, page + 1);

  const orders = ordersData?.orders ?? [];

  const handleStatusSelect = (status: "all" | OrderStatus) => {
    setSelectedStatus(status);
    setPage(0);
  };

  const handlePageChange = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Typography component="h1" gutterBottom variant="h4">
        Megrendelések
      </Typography>

      <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mb: 3 }} useFlexGap>
        {STATUS_FILTER_OPTIONS.map((option) => {
          const isActive = option.value === selectedStatus;

          return (
            <Chip
              clickable
              color={isActive ? "primary" : "default"}
              key={option.value}
              label={option.label}
              onClick={() => handleStatusSelect(option.value)}
              variant={isActive ? "filled" : "outlined"}
            />
          );
        })}
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rendelési szám</TableCell>
              <TableCell>Vevő</TableCell>
              <TableCell sx={{ display: { md: "table-cell", xs: "none" } }}>E-mail*</TableCell>
              <TableCell sx={{ display: { md: "table-cell", xs: "none" } }}>Dátum*</TableCell>
              <TableCell>Állapot</TableCell>
              <TableCell align="right">Összeg</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell>
                    <Skeleton width={140} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={130} />
                  </TableCell>
                  <TableCell sx={{ display: { md: "table-cell", xs: "none" } }}>
                    <Skeleton width={180} />
                  </TableCell>
                  <TableCell sx={{ display: { md: "table-cell", xs: "none" } }}>
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
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <TableRow
                  hover
                  key={order.id}
                  onClick={() => navigate(`/admin/megrendelesek/${order.id}`)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell sx={{ display: { md: "table-cell", xs: "none" } }}>{order.customerEmail}</TableCell>
                  <TableCell sx={{ display: { md: "table-cell", xs: "none" } }}>{formatDateHu(order.createdAt)}</TableCell>
                  <TableCell>
                    <OrderStatusChip status={order.status} />
                  </TableCell>
                  <TableCell align="right">{formatPriceHuf(order.totalHuf)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell align="center" colSpan={6} sx={{ py: 8 }}>
                  <Stack alignItems="center" spacing={1}>
                    <ReceiptIcon color="disabled" sx={{ fontSize: 40 }} />
                    <Typography variant="body1">
                      {selectedStatus === "all"
                        ? "Még nincsenek megrendelések."
                        : "Nincs találat a kiválasztott állapotra."}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={ordersData?.total ?? 0}
          labelDisplayedRows={({ count, from, to }) => `${from}–${to} / ${count === -1 ? `több mint ${to}` : count}`}
          labelRowsPerPage="Sorok száma oldalanként:"
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </TableContainer>
    </Box>
  );
};
