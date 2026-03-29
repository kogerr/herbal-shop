import { createOrderSchema, type CreateOrderInput } from "@webshop/shared";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { createOrder } from "../api/orders";
import { PageContainer } from "../components/layout/PageContainer";
import { PriceDisplay } from "../components/product/PriceDisplay";
import { useCartStore } from "../stores/cartStore";

type AddressFields = {
  address: string;
  city: string;
  name: string;
  zip: string;
};

type BillingFields = AddressFields & {
  taxNumber: string;
};

type ShippingMethod = "foxpost" | "gls";

type FieldErrors = {
  billingAddress?: string;
  billingCity?: string;
  billingName?: string;
  billingTaxNumber?: string;
  billingZip?: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  form?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingName?: string;
  shippingZip?: string;
};

const SHIPPING_COST_HUF = 1_490;

const EMPTY_ADDRESS_FIELDS: AddressFields = {
  address: "",
  city: "",
  name: "",
  zip: "",
};

const EMPTY_BILLING_FIELDS: BillingFields = {
  ...EMPTY_ADDRESS_FIELDS,
  taxNumber: "",
};

const mapIssueToField = (issuePath: (string | number)[]): keyof FieldErrors | undefined => {
  const [root, nested] = issuePath;

  if (root === "customerName") {
    return "customerName";
  }

  if (root === "customerEmail") {
    return "customerEmail";
  }

  if (root === "customerPhone") {
    return "customerPhone";
  }

  if (root === "shipping") {
    if (nested === "name") {
      return "shippingName";
    }

    if (nested === "zip") {
      return "shippingZip";
    }

    if (nested === "city") {
      return "shippingCity";
    }

    if (nested === "address") {
      return "shippingAddress";
    }
  }

  if (root === "billing") {
    if (nested === "name") {
      return "billingName";
    }

    if (nested === "zip") {
      return "billingZip";
    }

    if (nested === "city") {
      return "billingCity";
    }

    if (nested === "address") {
      return "billingAddress";
    }

    if (nested === "taxNumber") {
      return "billingTaxNumber";
    }
  }

  return undefined;
};

const getRequiredCompleted = (
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  shipping: AddressFields,
  sameAsShipping: boolean,
  billing: BillingFields,
) => {
  const baseCompleted =
    customerName.trim().length > 0 &&
    customerEmail.trim().length > 0 &&
    customerPhone.trim().length > 0 &&
    shipping.name.trim().length > 0 &&
    shipping.zip.trim().length > 0 &&
    shipping.city.trim().length > 0 &&
    shipping.address.trim().length > 0;

  if (sameAsShipping) {
    return baseCompleted;
  }

  return (
    baseCompleted &&
    billing.name.trim().length > 0 &&
    billing.zip.trim().length > 0 &&
    billing.city.trim().length > 0 &&
    billing.address.trim().length > 0
  );
};

export const CheckoutPage = () => {
  const { clearCart, items, subtotal } = useCartStore();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shipping, setShipping] = useState<AddressFields>(EMPTY_ADDRESS_FIELDS);
  const [billing, setBilling] = useState<BillingFields>(EMPTY_BILLING_FIELDS);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("gls");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  const shippingCost = subtotal >= 15_000 ? 0 : SHIPPING_COST_HUF;

  const isRequiredCompleted = useMemo(
    () => getRequiredCompleted(customerName, customerEmail, customerPhone, shipping, sameAsShipping, billing),
    [billing, customerEmail, customerName, customerPhone, sameAsShipping, shipping],
  );

  useEffect(() => {
    if (items.length === 0 && !isOrderPlaced) {
      navigate("/kosar", { replace: true });
    }
  }, [isOrderPlaced, items.length, navigate]);

  const clearError = (field: keyof FieldErrors) => {
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const handleShippingField = (field: keyof AddressFields, value: string) => {
    setShipping((previous) => ({ ...previous, [field]: value }));

    if (field === "name") {
      clearError("shippingName");
    }

    if (field === "zip") {
      clearError("shippingZip");
    }

    if (field === "city") {
      clearError("shippingCity");
    }

    if (field === "address") {
      clearError("shippingAddress");
    }
  };

  const handleBillingField = (field: keyof BillingFields, value: string) => {
    setBilling((previous) => ({ ...previous, [field]: value }));

    if (field === "name") {
      clearError("billingName");
    }

    if (field === "zip") {
      clearError("billingZip");
    }

    if (field === "city") {
      clearError("billingCity");
    }

    if (field === "address") {
      clearError("billingAddress");
    }

    if (field === "taxNumber") {
      clearError("billingTaxNumber");
    }
  };

  const handleSubmit = async () => {
    setErrors({});

    const orderPayload: CreateOrderInput = {
      billing: sameAsShipping
        ? { ...shipping, taxNumber: undefined }
        : {
            address: billing.address,
            city: billing.city,
            name: billing.name,
            taxNumber: billing.taxNumber.trim() || undefined,
            zip: billing.zip,
          },
      customerEmail,
      customerName,
      customerPhone,
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      note: note.trim() || undefined,
      shipping,
    };

    const validation = createOrderSchema.safeParse(orderPayload);

    if (!validation.success) {
      const nextErrors: FieldErrors = {};

      validation.error.issues.forEach((issue) => {
        const mappedField = mapIssueToField(issue.path);

        if (mappedField) {
          nextErrors[mappedField] = issue.message;
        }
      });

      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createOrder(orderPayload);
      const { accessToken, orderId } = response;
      sessionStorage.setItem("last-order", JSON.stringify({ accessToken, orderId }));
      setIsOrderPlaced(true);
      clearCart();
      navigate(`/rendeles-visszaigazolas/${orderId}`);
    } catch {
      setErrors({ form: "A rendelés elküldése sikertelen. Kérjük, próbálja újra." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <Typography variant="h3" component="h1" gutterBottom>
        Fizetés
      </Typography>
      <Grid container spacing={4} data-test-id="checkoutForm">
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="h5" gutterBottom>
            Kapcsolattartási adatok
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                error={Boolean(errors.customerName)}
                fullWidth
                helperText={errors.customerName}
                label="Név"
                onChange={(event) => {
                  setCustomerName(event.target.value);
                  clearError("customerName");
                }}
                required
                value={customerName}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                error={Boolean(errors.customerEmail)}
                fullWidth
                helperText={errors.customerEmail}
                label="E-mail"
                onChange={(event) => {
                  setCustomerEmail(event.target.value);
                  clearError("customerEmail");
                }}
                required
                type="email"
                value={customerEmail}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                error={Boolean(errors.customerPhone)}
                fullWidth
                helperText={errors.customerPhone ?? "+36 vagy 06 előtaggal"}
                label="Telefon"
                onChange={(event) => {
                  setCustomerPhone(event.target.value);
                  clearError("customerPhone");
                }}
                required
                value={customerPhone}
              />
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ mt: 4 }} gutterBottom>
            Szállítási cím
          </Typography>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                error={Boolean(errors.shippingName)}
                fullWidth
                helperText={errors.shippingName}
                label="Név"
                onChange={(event) => handleShippingField("name", event.target.value)}
                required
                value={shipping.name}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                error={Boolean(errors.shippingZip)}
                fullWidth
                helperText={errors.shippingZip ?? "4 számjegy"}
                inputProps={{ maxLength: 4 }}
                label="Irányítószám"
                onChange={(event) => handleShippingField("zip", event.target.value)}
                required
                value={shipping.zip}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                error={Boolean(errors.shippingCity)}
                fullWidth
                helperText={errors.shippingCity}
                label="Város"
                onChange={(event) => handleShippingField("city", event.target.value)}
                required
                value={shipping.city}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                error={Boolean(errors.shippingAddress)}
                fullWidth
                helperText={errors.shippingAddress}
                label="Utca, házszám"
                onChange={(event) => handleShippingField("address", event.target.value)}
                required
                value={shipping.address}
              />
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ mt: 4 }} gutterBottom>
            Számlázási cím
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={sameAsShipping}
                onChange={(event) => {
                  setSameAsShipping(event.target.checked);
                }}
              />
            }
            label="Megegyezik a szállítási címmel"
          />

          {!sameAsShipping && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={12}>
                <TextField
                  error={Boolean(errors.billingName)}
                  fullWidth
                  helperText={errors.billingName}
                  label="Név"
                  onChange={(event) => handleBillingField("name", event.target.value)}
                  required
                  value={billing.name}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  error={Boolean(errors.billingZip)}
                  fullWidth
                  helperText={errors.billingZip ?? "4 számjegy"}
                  inputProps={{ maxLength: 4 }}
                  label="Irányítószám"
                  onChange={(event) => handleBillingField("zip", event.target.value)}
                  required
                  value={billing.zip}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  error={Boolean(errors.billingCity)}
                  fullWidth
                  helperText={errors.billingCity}
                  label="Város"
                  onChange={(event) => handleBillingField("city", event.target.value)}
                  required
                  value={billing.city}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  error={Boolean(errors.billingAddress)}
                  fullWidth
                  helperText={errors.billingAddress}
                  label="Utca, házszám"
                  onChange={(event) => handleBillingField("address", event.target.value)}
                  required
                  value={billing.address}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  error={Boolean(errors.billingTaxNumber)}
                  fullWidth
                  helperText={errors.billingTaxNumber ?? "Cég esetén (opcionális)"}
                  label="Adószám"
                  onChange={(event) => handleBillingField("taxNumber", event.target.value)}
                  value={billing.taxNumber}
                />
              </Grid>
            </Grid>
          )}

          <Typography variant="h5" sx={{ mt: 4 }} gutterBottom>
            Szállítási mód
          </Typography>
          <RadioGroup
            onChange={(event) => {
              const nextMethod = event.target.value as ShippingMethod;
              setShippingMethod(nextMethod);
            }}
            value={shippingMethod}
          >
            <Paper
              onClick={() => setShippingMethod("gls")}
              sx={{
                border: 1,
                borderColor: shippingMethod === "gls" ? "primary.main" : "divider",
                cursor: "pointer",
                mb: 1,
                p: 2,
              }}
            >
              <FormControlLabel
                control={<Radio />}
                label={
                  <Box>
                    <Typography fontWeight={600}>GLS futárszolgálat</Typography>
                    <Typography color="text.secondary" variant="body2">
                      1-3 munkanap
                    </Typography>
                  </Box>
                }
                value="gls"
              />
            </Paper>
            <Paper
              onClick={() => setShippingMethod("foxpost")}
              sx={{
                border: 1,
                borderColor: shippingMethod === "foxpost" ? "primary.main" : "divider",
                cursor: "pointer",
                mb: 1,
                p: 2,
              }}
            >
              <FormControlLabel
                control={<Radio />}
                label={
                  <Box>
                    <Typography fontWeight={600}>Foxpost csomagpont</Typography>
                    <Typography color="text.secondary" variant="body2">
                      1-2 munkanap
                    </Typography>
                  </Box>
                }
                value="foxpost"
              />
            </Paper>
          </RadioGroup>

          <TextField
            fullWidth
            label="Megjegyzés"
            multiline
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            sx={{ mt: 4 }}
            value={note}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, position: { md: "sticky" }, top: { md: 80 } }}>
            <Typography variant="h5" gutterBottom>
              Rendelés összegzése
            </Typography>
            {items.map((item) => (
              <Box key={item.product.id} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">
                  {item.product.name} × {item.quantity}
                </Typography>
                <PriceDisplay amount={item.product.priceHuf * item.quantity} variant="body2" />
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography>Részösszeg</Typography>
              <PriceDisplay amount={subtotal} />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography>Szállítás</Typography>
              <PriceDisplay amount={shippingCost} />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6">Összesen</Typography>
              <PriceDisplay amount={subtotal + shippingCost} variant="h6" />
            </Box>

            {errors.form && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errors.form}
              </Alert>
            )}

            <Button
              data-test-id="placeOrderButton"
              disabled={!isRequiredCompleted || isSubmitting}
              fullWidth
              onClick={handleSubmit}
              size="large"
              sx={{ mt: 3 }}
              variant="contained"
            >
              {isSubmitting ? <CircularProgress size={24} /> : "Megrendelés elküldése"}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </PageContainer>
  );
};
