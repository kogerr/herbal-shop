import ArrowBack from "@mui/icons-material/ArrowBack";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Skeleton,
  Snackbar,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAdminProducts, useCreateProduct, useUpdateProduct } from "../../hooks/useAdminProducts";
import { useCategories } from "../../hooks/useCategories";
import { generateSlug } from "../../utils/generateSlug";

type ProductForm = {
  categoryId: string;
  description: string;
  images: string[];
  ingredients: string;
  isActive: boolean;
  name: string;
  priceHuf: number | "";
  slug: string;
  stock: number | "";
  weight: number | "";
};

type FormErrors = Partial<Record<keyof ProductForm, string>>;

const DEFAULT_FORM: ProductForm = {
  categoryId: "",
  description: "",
  images: [""],
  ingredients: "",
  isActive: true,
  name: "",
  priceHuf: "",
  slug: "",
  stock: "",
  weight: "",
};

export const AdminProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { data: products = [], isLoading: isProductsLoading } = useAdminProducts();
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  const [form, setForm] = useState<ProductForm>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccessSnackbarOpen, setIsSuccessSnackbarOpen] = useState(false);

  const editingProduct = isEditMode ? products.find((product) => product.id === id) : undefined;

  useEffect(() => {
    if (editingProduct) {
      setForm({
        categoryId: editingProduct.categoryId,
        description: editingProduct.description,
        images: editingProduct.images.length > 0 ? editingProduct.images : [""],
        ingredients: editingProduct.ingredients,
        isActive: editingProduct.isActive,
        name: editingProduct.name,
        priceHuf: editingProduct.priceHuf,
        slug: editingProduct.slug,
        stock: editingProduct.stock,
        weight: editingProduct.weight,
      });
      setSlugManuallyEdited(editingProduct.slug !== generateSlug(editingProduct.name));
      setErrors({});
    }
  }, [editingProduct]);

  const handleFieldChange = <K extends keyof ProductForm>(field: K, value: ProductForm[K]) => {
    setForm((previousForm) => ({ ...previousForm, [field]: value }));
    setErrors((previousErrors) => {
      if (!previousErrors[field]) {
        return previousErrors;
      }

      return { ...previousErrors, [field]: undefined };
    });
  };

  const handleNameChange = (name: string) => {
    setForm((previousForm) => ({
      ...previousForm,
      name,
      slug: slugManuallyEdited ? previousForm.slug : generateSlug(name),
    }));
    setErrors((previousErrors) => {
      if (!previousErrors.name && !previousErrors.slug) {
        return previousErrors;
      }

      return { ...previousErrors, name: undefined, slug: undefined };
    });
  };

  const handleSlugChange = (slug: string) => {
    setSlugManuallyEdited(true);
    handleFieldChange("slug", slug);
  };

  const validateForm = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (form.name.trim().length === 0) {
      nextErrors.name = "Kötelező mező";
    } else if (form.name.trim().length > 200) {
      nextErrors.name = "Maximum 200 karakter";
    }

    if (form.slug.trim().length === 0) {
      nextErrors.slug = "Kötelező mező";
    } else if (!/^[a-z0-9-]+$/.test(form.slug.trim())) {
      nextErrors.slug = "Csak kisbetűk, számok és kötőjel használható";
    }

    if (form.description.trim().length === 0) {
      nextErrors.description = "Kötelező mező";
    }

    if (form.ingredients.trim().length === 0) {
      nextErrors.ingredients = "Kötelező mező";
    }

    if (typeof form.priceHuf !== "number" || form.priceHuf <= 0) {
      nextErrors.priceHuf = "Az ár nem lehet nulla vagy negatív";
    }

    if (typeof form.stock !== "number" || form.stock < 0) {
      nextErrors.stock = "A készlet nem lehet negatív";
    }

    if (typeof form.weight !== "number" || form.weight <= 0) {
      nextErrors.weight = "A súly nem lehet nulla vagy negatív";
    }

    if (form.categoryId.trim().length === 0) {
      nextErrors.categoryId = "Válassz kategóriát";
    }

    return nextErrors;
  };

  const handleSubmit = async () => {
    const nextErrors = validateForm();
    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const payload = {
      ...form,
      description: form.description.trim(),
      ingredients: form.ingredients.trim(),
      name: form.name.trim(),
      priceHuf: Number(form.priceHuf),
      slug: form.slug.trim(),
      stock: Number(form.stock),
      weight: Number(form.weight),
    };

    try {
      if (isEditMode && id) {
        await updateProduct.mutateAsync({ body: payload, id });
      } else {
        await createProduct.mutateAsync(payload);
      }

      setIsSuccessSnackbarOpen(true);
      setTimeout(() => {
        navigate("/admin/termekek");
      }, 1000);
    } catch {
      setSubmitError("Nem sikerült menteni a terméket.");
    }
  };

  const renderLoadingSkeleton = () => {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: 9 }).map((_, index) => (
          <Grid key={index} size={{ xs: 12 }}>
            <Skeleton height={56} variant="rectangular" />
          </Grid>
        ))}
        <Grid size={{ xs: 12 }}>
          <Skeleton height={38} variant="rectangular" width={60} />
        </Grid>
      </Grid>
    );
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Button onClick={() => navigate("/admin/termekek")} startIcon={<ArrowBack />} variant="outlined">
          Vissza
        </Button>
      </Box>

      <Typography component="h1" gutterBottom variant="h4">
        {isEditMode ? "Termék szerkesztése" : "Új termék"}
      </Typography>

      {submitError ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      ) : null}

      <Paper sx={{ mb: 3, p: 3 }}>
        {isEditMode && isProductsLoading ? (
          renderLoadingSkeleton()
        ) : (
          <Grid container spacing={3}>
            <Grid size={{ sm: 6, xs: 12 }}>
              <TextField
                data-test-id="productNameInput"
                error={Boolean(errors.name)}
                fullWidth
                helperText={errors.name}
                label="Név"
                onChange={(event) => handleNameChange(event.target.value)}
                required
                value={form.name}
              />
            </Grid>

            <Grid size={{ sm: 6, xs: 12 }}>
              <TextField
                data-test-id="productSlugInput"
                error={Boolean(errors.slug)}
                fullWidth
                helperText={errors.slug ?? "Automatikusan generálódik a névből"}
                label="Slug (URL)"
                onChange={(event) => handleSlugChange(event.target.value)}
                required
                value={form.slug}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                data-test-id="productDescriptionInput"
                error={Boolean(errors.description)}
                fullWidth
                helperText={errors.description}
                label="Leírás"
                multiline
                onChange={(event) => handleFieldChange("description", event.target.value)}
                required
                rows={4}
                value={form.description}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                data-test-id="productIngredientsInput"
                error={Boolean(errors.ingredients)}
                fullWidth
                helperText={errors.ingredients}
                label="Összetevők"
                multiline
                onChange={(event) => handleFieldChange("ingredients", event.target.value)}
                required
                rows={3}
                value={form.ingredients}
              />
            </Grid>

            <Grid size={{ md: 3, sm: 6, xs: 12 }}>
              <TextField
                data-test-id="productPriceInput"
                error={Boolean(errors.priceHuf)}
                fullWidth
                helperText={errors.priceHuf}
                label="Ár"
                onChange={(event) =>
                  handleFieldChange("priceHuf", event.target.value === "" ? "" : Number(event.target.value))
                }
                required
                slotProps={{
                  htmlInput: { min: 1 },
                  input: {
                    endAdornment: <InputAdornment position="end">Ft</InputAdornment>,
                  },
                }}
                type="number"
                value={form.priceHuf}
              />
            </Grid>

            <Grid size={{ md: 3, sm: 6, xs: 12 }}>
              <TextField
                data-test-id="productStockInput"
                error={Boolean(errors.stock)}
                fullWidth
                helperText={errors.stock}
                label="Készlet"
                onChange={(event) =>
                  handleFieldChange("stock", event.target.value === "" ? "" : Number(event.target.value))
                }
                required
                slotProps={{
                  htmlInput: { min: 0 },
                }}
                type="number"
                value={form.stock}
              />
            </Grid>

            <Grid size={{ md: 3, sm: 6, xs: 12 }}>
              <TextField
                data-test-id="productWeightInput"
                error={Boolean(errors.weight)}
                fullWidth
                helperText={errors.weight}
                label="Súly"
                onChange={(event) =>
                  handleFieldChange("weight", event.target.value === "" ? "" : Number(event.target.value))
                }
                required
                slotProps={{
                  htmlInput: { min: 1 },
                  input: {
                    endAdornment: <InputAdornment position="end">g</InputAdornment>,
                  },
                }}
                type="number"
                value={form.weight}
              />
            </Grid>

            <Grid size={{ md: 3, sm: 6, xs: 12 }}>
              <TextField
                data-test-id="productCategorySelect"
                error={Boolean(errors.categoryId)}
                fullWidth
                helperText={errors.categoryId}
                label="Kategória"
                onChange={(event) => handleFieldChange("categoryId", event.target.value)}
                required
                select
                value={form.categoryId}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                data-test-id="productImageInput"
                fullWidth
                helperText="A termék fő képének URL-je"
                label="Kép URL"
                onChange={(event) => handleFieldChange("images", [event.target.value])}
                value={form.images[0] ?? ""}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isActive}
                    data-test-id="productActiveSwitch"
                    onChange={(event) => handleFieldChange("isActive", event.target.checked)}
                  />
                }
                label="Aktív"
              />
            </Grid>
          </Grid>
        )}
      </Paper>

      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button onClick={() => navigate("/admin/termekek")} variant="outlined">
          Mégse
        </Button>
        <Button data-test-id="productSaveButton" disabled={isSubmitting} onClick={handleSubmit} variant="contained">
          {isSubmitting ? <CircularProgress color="inherit" size={24} /> : "Mentés"}
        </Button>
      </Box>

      <Snackbar
        autoHideDuration={4000}
        onClose={() => setIsSuccessSnackbarOpen(false)}
        open={isSuccessSnackbarOpen}
      >
        <Alert severity="success">Termék sikeresen mentve!</Alert>
      </Snackbar>
    </Box>
  );
};
