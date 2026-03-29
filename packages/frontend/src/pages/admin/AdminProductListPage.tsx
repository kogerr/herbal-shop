import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import InventoryIcon from "@mui/icons-material/Inventory";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { formatPriceHuf, type Product } from "@webshop/shared";
import { useEffect, useMemo, useState, type FocusEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useAdminProducts, useUpdateProduct } from "../../hooks/useAdminProducts";

type StockDraftMap = Record<string, string>;

const getStockColor = (value: number): "error" | "warning" | "primary" => {
  if (value === 0) {
    return "error";
  }

  if (value <= 5) {
    return "warning";
  }

  return "primary";
};

const getCategoryLabel = (product: Product): string => {
  if ("category" in product && product.category && typeof product.category === "object" && "name" in product.category) {
    const categoryName = product.category.name;

    if (typeof categoryName === "string" && categoryName.length > 0) {
      return categoryName;
    }
  }

  return product.categoryId;
};

export const AdminProductListPage = () => {
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useAdminProducts();
  const updateProduct = useUpdateProduct();

  const [stockDraftById, setStockDraftById] = useState<StockDraftMap>({});

  useEffect(() => {
    setStockDraftById((previous) => {
      const next: StockDraftMap = {};

      for (const product of products) {
        next[product.id] = previous[product.id] ?? String(product.stock);
      }

      return next;
    });
  }, [products]);

  const stockById = useMemo(() => {
    return products.reduce<Record<string, number>>((accumulator, product) => {
      accumulator[product.id] = product.stock;
      return accumulator;
    }, {});
  }, [products]);

  const handleStockInputChange = (productId: string, value: string) => {
    setStockDraftById((previous) => ({
      ...previous,
      [productId]: value,
    }));
  };

  const handleStockBlur = (product: Product, event: FocusEvent<HTMLInputElement>) => {
    const rawValue = event.target.value.trim();
    const parsedValue = Number.parseInt(rawValue, 10);
    const normalizedStock = Number.isNaN(parsedValue) ? product.stock : Math.max(0, parsedValue);

    if (normalizedStock !== product.stock) {
      updateProduct.mutate({
        id: product.id,
        body: { stock: normalizedStock },
      });
    }

    setStockDraftById((previous) => ({
      ...previous,
      [product.id]: String(normalizedStock),
    }));
  };

  const handleToggleVisibility = (product: Product) => {
    updateProduct.mutate({
      id: product.id,
      body: { isActive: !product.isActive },
    });
  };

  if (isLoading) {
    return (
      <Box>
        <Stack alignItems={{ xs: "stretch", sm: "center" }} direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
          <Typography component="h1" variant="h4">
            Termékek
          </Typography>
          <Button component={Link} startIcon={<AddIcon />} to="/admin/termekek/uj" variant="contained">
            Új termék
          </Button>
        </Stack>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Kép</TableCell>
                <TableCell>Név</TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Kategória*</TableCell>
                <TableCell>Ár</TableCell>
                <TableCell>Készlet</TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Állapot*</TableCell>
                <TableCell align="right">Műveletek</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell>
                    <Skeleton height={48} variant="rounded" width={48} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={180} />
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <Skeleton width={120} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={90} />
                  </TableCell>
                  <TableCell>
                    <Skeleton height={40} variant="rounded" width={90} />
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <Skeleton width={80} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton sx={{ ml: "auto" }} width={120} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  if (products.length === 0) {
    return (
      <Box>
        <Stack alignItems={{ xs: "stretch", sm: "center" }} direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
          <Typography component="h1" variant="h4">
            Termékek
          </Typography>
          <Button component={Link} startIcon={<AddIcon />} to="/admin/termekek/uj" variant="contained">
            Új termék
          </Button>
        </Stack>

        <Paper sx={{ p: 6, textAlign: "center" }}>
          <InventoryIcon color="disabled" sx={{ fontSize: 56, mb: 2 }} />
          <Typography sx={{ mb: 1 }} variant="h6">
            Még nincs egyetlen termék sem.
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Kezdésként hozz létre egy új terméket.
          </Typography>
          <Button component={Link} startIcon={<AddIcon />} to="/admin/termekek/uj" variant="contained">
            Új termék
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Stack alignItems={{ xs: "stretch", sm: "center" }} direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Typography component="h1" variant="h4">
          Termékek
        </Typography>
        <Button component={Link} startIcon={<AddIcon />} to="/admin/termekek/uj" variant="contained">
          Új termék
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Kép</TableCell>
              <TableCell>Név</TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Kategória*</TableCell>
              <TableCell>Ár</TableCell>
              <TableCell>Készlet</TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Állapot*</TableCell>
              <TableCell align="right">Műveletek</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => {
              const draftValue = stockDraftById[product.id] ?? String(product.stock);
              const numericDraftValue = Number.parseInt(draftValue, 10);
              const stockColor = getStockColor(Number.isNaN(numericDraftValue) ? stockById[product.id] ?? product.stock : Math.max(0, numericDraftValue));

              return (
                <TableRow hover key={product.id}>
                  <TableCell>
                    <Box
                      aria-hidden
                      sx={{
                        alignItems: "center",
                        backgroundColor: "action.hover",
                        borderRadius: 1,
                        color: "text.disabled",
                        display: "flex",
                        height: 48,
                        justifyContent: "center",
                        width: 48,
                      }}
                    >
                      <InventoryIcon fontSize="small" />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={700}>{product.name}</Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{getCategoryLabel(product)}</TableCell>
                  <TableCell>{formatPriceHuf(product.priceHuf)}</TableCell>
                  <TableCell>
                    <TextField
                      color={stockColor}
                      inputProps={{ min: 0 }}
                      onBlur={(event: FocusEvent<HTMLInputElement>) => handleStockBlur(product, event)}
                      onChange={(event) => handleStockInputChange(product.id, event.target.value)}
                      size="small"
                      sx={{ width: 96 }}
                      type="number"
                      value={draftValue}
                    />
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <Chip color={product.isActive ? "success" : "default"} label={product.isActive ? "Aktív" : "Inaktív"} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      <IconButton
                        aria-label={product.isActive ? "Deaktiválás" : "Aktiválás"}
                        onClick={() => handleToggleVisibility(product)}
                        size="small"
                      >
                        {product.isActive ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </IconButton>
                      <IconButton aria-label="Szerkesztés" onClick={() => navigate(`/admin/termekek/${product.id}/szerkesztes`)} size="small">
                        <EditIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
