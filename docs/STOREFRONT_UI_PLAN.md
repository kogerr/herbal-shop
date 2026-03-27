# Storefront UI Implementation Plan

---

## Table of Contents

1. [Shared Constants & Patterns](#shared-constants--patterns)
2. [Header](#header)
3. [Footer](#footer)
4. [CartDrawer](#cartdrawer)
5. [Home Page](#home-page)
6. [Product List Page](#product-list-page)
7. [Product Detail Page](#product-detail-page)
8. [Cart Page](#cart-page)
9. [Checkout Page](#checkout-page)
10. [Order Confirmation Page](#order-confirmation-page)
11. [404 Page](#404-page)
12. [File Structure](#file-structure)

---

## Shared Constants & Patterns

### Shipping Threshold

```ts
const FREE_SHIPPING_THRESHOLD = 15_000;
const SHIPPING_COST_HUF = 1_490;
```

### Snackbar Pattern

Use a Zustand notification store or lift Snackbar state to AppLayout.

```tsx
<Snackbar open={open} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
  <Alert severity="success" variant="filled" onClose={handleClose}>
    {message}
  </Alert>
</Snackbar>
```

### Skeleton Card (reusable for product loading states)

```tsx
<Card>
  <Skeleton variant="rectangular" height={200} />
  <CardContent>
    <Skeleton variant="text" width="70%" />
    <Skeleton variant="text" width="40%" />
    <Skeleton variant="rectangular" height={36} sx={{ mt: 2 }} />
  </CardContent>
</Card>
```

### SEO Head Pattern (per page)

```tsx
<Helmet>
  <title>{pageTitle} — Herbal Shop</title>
  <meta name="description" content={description} />
</Helmet>
```

| Page | Title |
|---|---|
| Home | "Herbal Shop — Természetes kenőcsök" |
| Product List | "Termékek — Herbal Shop" |
| Product Detail | "{productName} — Herbal Shop" |
| Cart | "Kosár — Herbal Shop" |
| Checkout | "Fizetés — Herbal Shop" |
| Confirmation | "Rendelés visszaigazolás — Herbal Shop" |

---

## Header

### Desktop (md+)

```
┌──────────────────────────────────────────────────────────────┐
│  Herbal Shop              Termékek          🛒 (3)           │
│  (Lora h6, link)          (text Button)     (Badge+Icon)     │
└──────────────────────────────────────────────────────────────┘
```

### Mobile (xs/sm)

```
┌──────────────────────────────────────────────────────────────┐
│  ☰   Herbal Shop                                  🛒 (3)    │
└──────────────────────────────────────────────────────────────┘
```

### Component Tree

```tsx
<AppBar position="sticky">
  <Toolbar sx={{ justifyContent: "space-between" }}>
    {/* Left side */}
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <IconButton
        aria-label="Menü"
        onClick={handleOpenMobileNav}
        sx={{ display: { xs: "flex", md: "none" } }}
      >
        <MenuIcon />
      </IconButton>
      <Typography
        variant="h6"
        component={Link}
        to="/"
        sx={{ color: "primary.main", fontFamily: "'Lora', serif", fontWeight: 700, textDecoration: "none" }}
      >
        Herbal Shop
      </Typography>
    </Box>

    {/* Right side */}
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Button
        component={Link}
        to="/termekek"
        color="primary"
        sx={{ display: { xs: "none", md: "flex" } }}
      >
        Termékek
      </Button>
      <IconButton aria-label="Kosár" onClick={handleOpenCartDrawer} data-test-id="cartBadge">
        <Badge badgeContent={totalItems} color="secondary" max={99}>
          <ShoppingCartIcon />
        </Badge>
      </IconButton>
    </Box>
  </Toolbar>
</AppBar>
```

### Mobile Nav Drawer

```tsx
<Drawer
  anchor="left"
  open={mobileNavOpen}
  onClose={handleCloseMobileNav}
  sx={{ display: { xs: "block", md: "none" } }}
>
  <Box sx={{ width: 250, p: 2 }}>
    <Typography variant="h6" sx={{ fontFamily: "'Lora', serif", fontWeight: 700, color: "primary.main", mb: 2 }}>
      Herbal Shop
    </Typography>
    <Divider />
    <List>
      <ListItemButton component={Link} to="/termekek" onClick={handleCloseMobileNav}>
        <ListItemText primary="Termékek" />
      </ListItemButton>
      <ListItemButton component={Link} to="/kosar" onClick={handleCloseMobileNav}>
        <ListItemText primary="Kosár" />
      </ListItemButton>
    </List>
    <Divider />
    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
      info@herbalshop.hu
    </Typography>
  </Box>
</Drawer>
```

### Icons

- `MenuIcon` — hamburger
- `ShoppingCartIcon` — cart
- `CloseIcon` — drawer close

### data-test-id values

- `cartBadge` — cart icon button

---

## Footer

### Desktop

```
┌──────────────────────────────────────────────────────────────┐
│  bgcolor: primary.light                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Herbal Shop   │  │ Információk  │  │ Kapcsolat    │       │
│  │ Természetes   │  │ Termékek     │  │ info@...     │       │
│  │ kenőcsök...   │  │ Szállítás    │  │ +36 ...      │       │
│  │               │  │ ÁSZF         │  │              │       │
│  │               │  │ Adatvédelem  │  │              │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ─────────────────────────────────────────────────────       │
│  © 2026 Herbal Shop — Természetes kenőcsök                   │
└──────────────────────────────────────────────────────────────┘
```

### Mobile

All 3 columns stack vertically (xs: 12).

### Component Tree

```tsx
<Box component="footer" sx={{ bgcolor: "primary.light", mt: 4, py: 6 }}>
  <Container maxWidth="lg">
    <Grid container spacing={4}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Typography variant="h6" sx={{ fontFamily: "'Lora', serif", fontWeight: 700 }}>
          Herbal Shop
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Természetes kenőcsök, kézzel készítve, prémium gyógynövényes összetevőkből.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>Információk</Typography>
        <Typography variant="body2"><Link component={RouterLink} to="/termekek">Termékek</Link></Typography>
        <Typography variant="body2"><Link component={RouterLink} to="/szallitas">Szállítás és fizetés</Link></Typography>
        <Typography variant="body2"><Link component={RouterLink} to="/aszf">ÁSZF</Link></Typography>
        <Typography variant="body2"><Link component={RouterLink} to="/adatvedelem">Adatvédelem</Link></Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>Kapcsolat</Typography>
        <Typography variant="body2" color="text.secondary">info@herbalshop.hu</Typography>
        <Typography variant="body2" color="text.secondary">+36 30 123 4567</Typography>
      </Grid>
    </Grid>
    <Divider sx={{ my: 3 }} />
    <Typography variant="body2" color="text.secondary" align="center">
      © 2026 Herbal Shop — Természetes kenőcsök, kézzel készítve
    </Typography>
  </Container>
</Box>
```

---

## CartDrawer

### Desktop

```
                              ┌────────────────────────┐
                              │ Kosár (3)          ✕   │
                              ├────────────────────────┤
                              │ [img] Levendulás...    │
                              │       3 490 Ft   -1+   │
                              │ ───────────────────    │
                              │ [img] Mentás hűsí...   │
                              │       2 990 Ft   -1+   │
                              │                        │
                              │                        │
                              ├────────────────────────┤
                              │ Összesen: 6 480 Ft     │
                              │ [Kosár megtekintése]   │
                              │ [Fizetés           ]   │
                              └────────────────────────┘
```

### Mobile

Full viewport width (xs: "100vw").

### Component Tree

```tsx
<Drawer anchor="right" open={cartDrawerOpen} onClose={handleCloseCartDrawer}>
  <Box sx={{ width: { xs: "100vw", sm: 400 }, display: "flex", flexDirection: "column", height: "100%" }}>
    {/* Header */}
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, borderBottom: 1, borderColor: "divider" }}>
      <Typography variant="h6">Kosár ({totalItems})</Typography>
      <IconButton aria-label="Bezárás" onClick={handleCloseCartDrawer}>
        <CloseIcon />
      </IconButton>
    </Box>

    {/* Items (scrollable) */}
    <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
      {items.length === 0 ? (
        <EmptyState message="A kosár üres" />
      ) : (
        <Stack divider={<Divider />} spacing={2}>
          {items.map((item) => (
            <Box key={item.product.id} sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ width: 60, height: 60, bgcolor: "grey.200", borderRadius: 1, flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600}>{item.product.name}</Typography>
                <PriceDisplay amount={item.product.priceHuf} variant="body2" />
                <QuantitySelector value={item.quantity} onChange={(v) => updateQuantity(item.product.id, v)} />
              </Box>
              <IconButton aria-label="Törlés" size="small" onClick={() => removeItem(item.product.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>
      )}
    </Box>

    {/* Footer */}
    {items.length > 0 && (
      <Box sx={{ borderTop: 1, borderColor: "divider", p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>Összesen:</Typography>
          <PriceDisplay amount={subtotal} variant="subtitle1" />
        </Box>
        <Button variant="contained" fullWidth component={Link} to="/kosar" onClick={handleCloseCartDrawer}>
          Kosár megtekintése
        </Button>
        <Button variant="outlined" fullWidth sx={{ mt: 1 }} component={Link} to="/penztar" onClick={handleCloseCartDrawer}>
          Fizetés
        </Button>
      </Box>
    )}
  </Box>
</Drawer>
```

### data-test-id values

- `cartDrawer` — drawer root

---

## Home Page

**Route:** `/`

### Desktop

```
┌──────────────────────────────────────────────────────────────┐
│  [Header]                                                    │
├──────────────────────────────────────────────────────────────┤
│  bgcolor: primary.light, py: 12                              │
│  ┌─────────────────────────┐  ┌─────────────────────────┐   │
│  │ h2: Természetes kenőcsök│  │                         │   │
│  │ h5: Prémium minőségű... │  │   [Hero image / illust] │   │
│  │ [Termékek megtekintése] │  │                         │   │
│  └─────────────────────────┘  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────┤
│  h4: Kiemelt termékek                                        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐               │
│  │Product │ │Product │ │Product │ │Product │               │
│  │Card    │ │Card    │ │Card    │ │Card    │               │
│  └────────┘ └────────┘ └────────┘ └────────┘               │
│                              [Összes termék →]               │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐  ┌─────────────────────────┐   │
│  │                         │  │ h4: A történetünk       │   │
│  │   [Brand image]         │  │ body1: Kézzel készített │   │
│  │                         │  │ gyógynövényes kenőcsök..│   │
│  └─────────────────────────┘  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ 🌿           │ │ 🤝           │ │ 🇭🇺           │        │
│  │ 100%         │ │ Kézzel       │ │ Magyar       │        │
│  │ természetes  │ │ készített    │ │ termék       │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
├──────────────────────────────────────────────────────────────┤
│  [Footer]                                                    │
└──────────────────────────────────────────────────────────────┘
```

### Mobile

Hero: single column (text above, image below or hidden). Products: 1 column. Brand story: stacked. Trust signals: stacked.

### Component Tree

```tsx
<Box>
  {/* Hero */}
  <Box sx={{ bgcolor: "primary.light", py: { xs: 6, md: 12 } }}>
    <Container maxWidth="lg">
      <Grid container spacing={4} alignItems="center">
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Természetes kenőcsök, kézzel készítve
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4, fontFamily: "'Inter', sans-serif" }}>
            Prémium minőségű gyógynövényes termékek, természetes összetevőkkel
          </Typography>
          <Button variant="contained" size="large" component={Link} to="/termekek">
            Termékek megtekintése
          </Button>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }} sx={{ display: { xs: "none", md: "block" } }}>
          <Box sx={{ bgcolor: "grey.200", borderRadius: 3, height: 350, width: "100%" }} />
        </Grid>
      </Grid>
    </Container>
  </Box>

  {/* Featured Products */}
  <Container maxWidth="lg" sx={{ py: 6 }}>
    <Typography variant="h4" gutterBottom>Kiemelt termékek</Typography>
    {isLoading ? (
      <Grid container spacing={3}>
        {[0, 1, 2, 3].map((i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <SkeletonProductCard />
          </Grid>
        ))}
      </Grid>
    ) : (
      <Grid container spacing={3}>
        {products?.slice(0, 4).map((product) => (
          <Grid key={product.id} size={{ xs: 12, sm: 6, md: 3 }}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    )}
    <Box sx={{ textAlign: "center", mt: 3 }}>
      <Button variant="text" component={Link} to="/termekek" endIcon={<ArrowForwardIcon />}>
        Összes termék
      </Button>
    </Box>
  </Container>

  {/* Brand Story */}
  <Box sx={{ bgcolor: "background.paper", py: 6 }}>
    <Container maxWidth="lg">
      <Grid container spacing={4} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ bgcolor: "grey.200", borderRadius: 3, height: 300, width: "100%" }} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h4" gutterBottom>A történetünk</Typography>
          <Typography variant="body1" color="text.secondary">
            Kézzel készített gyógynövényes kenőcseink a természet erejét hozzák el Önnek.
            Minden termékünk gondosan válogatott, természetes összetevőkből készül,
            hagyományos receptúrák alapján.
          </Typography>
        </Grid>
      </Grid>
    </Container>
  </Box>

  {/* Trust Signals */}
  <Container maxWidth="lg" sx={{ py: 6 }}>
    <Grid container spacing={3}>
      {TRUST_SIGNALS.map((signal) => (
        <Grid key={signal.label} size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <signal.icon sx={{ fontSize: 48, color: "primary.main" }} />
            <Typography variant="h6" sx={{ mt: 1 }}>{signal.label}</Typography>
            <Typography variant="body2" color="text.secondary">{signal.description}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Container>
</Box>
```

### Trust Signals Data

```ts
const TRUST_SIGNALS = [
  { icon: SpaOutlined, label: "100% természetes", description: "Csak természetes összetevőket használunk" },
  { icon: HandshakeOutlined, label: "Kézzel készített", description: "Minden termék kézzel, kis tételben készül" },
  { icon: FlagOutlined, label: "Magyar termék", description: "Büszkén készítjük Magyarországon" },
];
```

### Loading State

Replace the 4 ProductCards with 4 SkeletonProductCard components in the same Grid layout.

### Icons

- `SpaOutlined`, `HandshakeOutlined`, `FlagOutlined` — trust signals
- `ArrowForwardIcon` — "Összes termék" link

---

## Product List Page

**Route:** `/termekek`

### Desktop

```
┌──────────────────────────────────────────────────────────────┐
│  h3: Termékek                                                │
│                                                              │
│  [Mind] [Fájdalomcsillapító] [Bőrápoló] [Izom...]  Rendezés:│
│   ^^^filled                  ^^^outlined            [▼ Ár ↑]│
│                                                              │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐               │
│  │Product │ │Product │ │Product │ │Product │               │
│  │Card    │ │Card    │ │Card    │ │Card    │               │
│  └────────┘ └────────┘ └────────┘ └────────┘               │
│  ┌────────┐ ┌────────┐                                      │
│  │Product │ │Product │                                      │
│  │Card    │ │Card    │                                      │
│  └────────┘ └────────┘                                      │
└──────────────────────────────────────────────────────────────┘
```

### Mobile

Chips wrap. Sort select goes below chips. Products: 1 column.

### Component Tree

```tsx
<PageContainer>
  <Typography variant="h3" component="h1" gutterBottom>Termékek</Typography>

  {/* Filter/Sort bar */}
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 3 }}>
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
      <Chip
        label="Mind"
        variant={!selectedCategory ? "filled" : "outlined"}
        color="primary"
        onClick={() => setSelectedCategory(null)}
      />
      {categories.map((cat) => (
        <Chip
          key={cat.slug}
          label={cat.name}
          variant={selectedCategory === cat.slug ? "filled" : "outlined"}
          color="primary"
          onClick={() => setSelectedCategory(cat.slug)}
        />
      ))}
    </Stack>
    <TextField
      select
      size="small"
      label="Rendezés"
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      sx={{ minWidth: 180 }}
    >
      <MenuItem value="name-asc">Név (A-Z)</MenuItem>
      <MenuItem value="price-asc">Ár (növekvő)</MenuItem>
      <MenuItem value="price-desc">Ár (csökkenő)</MenuItem>
    </TextField>
  </Box>

  {/* Product grid */}
  {isLoading ? (
    <Grid container spacing={3}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <SkeletonProductCard />
        </Grid>
      ))}
    </Grid>
  ) : !products?.length ? (
    <EmptyState icon={<SearchOffIcon fontSize="inherit" />} message="Nem található termék" action={{ label: "Szűrők törlése", onClick: handleClearFilters }} />
  ) : (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <ProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  )}
</PageContainer>
```

### Responsive Breakpoints

| Breakpoint | Columns | Chip layout | Sort |
|---|---|---|---|
| xs (0-599) | 1 | Wrap | Below chips, full width |
| sm (600-899) | 2 | Row | Inline right |
| md (900-1199) | 3 | Row | Inline right |
| lg (1200+) | 4 | Row | Inline right |

### data-test-id values

- `productCard` — each product card (existing)

---

## Product Detail Page

**Route:** `/termekek/:slug`

### Desktop

```
┌──────────────────────────────────────────────────────────────┐
│  Főoldal > Termékek > Levendulás nyugtató kenőcs             │
│                                                              │
│  ┌─────────────────────┐  ┌─────────────────────────────┐   │
│  │                     │  │ h3: Levendulás nyugtató     │   │
│  │                     │  │     kenőcs                   │   │
│  │   [Product Image]   │  │ h4: 3 490 Ft (green)        │   │
│  │                     │  │ [✓ Készleten] (green chip)   │   │
│  │                     │  │                              │   │
│  │                     │  │ body1: Nyugtató hatású...    │   │
│  │                     │  │                              │   │
│  │                     │  │ h6: Összetevők               │   │
│  │                     │  │ body1: Levendulaolaj, méh... │   │
│  └─────────────────────┘  │                              │   │
│                           │ [-] 1 [+]  [🛒 Kosárba]     │   │
│                           └─────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Mobile

Image full width on top, info below. All stacked.

### Component Tree

```tsx
<PageContainer>
  {/* Breadcrumbs */}
  <Breadcrumbs sx={{ mb: 3 }}>
    <Link component={RouterLink} to="/" underline="hover" color="text.secondary">Főoldal</Link>
    <Link component={RouterLink} to="/termekek" underline="hover" color="text.secondary">Termékek</Link>
    <Typography color="text.primary">{product.name}</Typography>
  </Breadcrumbs>

  <Grid container spacing={4}>
    {/* Image */}
    <Grid size={{ xs: 12, md: 6 }}>
      {product.images[0] ? (
        <Box component="img" src={product.images[0]} alt={product.name}
          sx={{ width: "100%", height: "auto", maxHeight: 500, objectFit: "cover", borderRadius: 3 }} />
      ) : (
        <Box sx={{ bgcolor: "grey.200", borderRadius: 3, height: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ImageOutlinedIcon sx={{ fontSize: 80, color: "text.secondary" }} />
        </Box>
      )}
    </Grid>

    {/* Info */}
    <Grid size={{ xs: 12, md: 6 }}>
      <Typography variant="h3" component="h1" gutterBottom>{product.name}</Typography>
      <PriceDisplay amount={product.priceHuf} variant="h4" />

      {/* Stock indicator */}
      {product.stock > 5 ? (
        <Chip icon={<CheckCircleIcon />} label="Készleten" color="success" size="small" variant="outlined" sx={{ mt: 1 }} />
      ) : product.stock > 0 ? (
        <Chip icon={<WarningIcon />} label={`Csak ${product.stock} db maradt`} color="warning" size="small" variant="outlined" sx={{ mt: 1 }} />
      ) : (
        <Chip icon={<CancelIcon />} label="Elfogyott" color="error" size="small" variant="outlined" sx={{ mt: 1 }} />
      )}

      <Typography sx={{ mt: 2 }}>{product.description}</Typography>

      <Typography variant="h6" sx={{ mt: 3 }}>Összetevők</Typography>
      <Typography color="text.secondary">{product.ingredients}</Typography>

      {/* Add to cart */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 4 }}>
        <QuantitySelector value={quantity} onChange={setQuantity} max={product.stock} />
        <Button
          variant="contained"
          size="large"
          onClick={handleAddToCart}
          startIcon={<ShoppingCartIcon />}
          disabled={product.stock === 0}
          data-test-id="addToCartButton"
        >
          Kosárba
        </Button>
      </Box>
    </Grid>
  </Grid>

  {/* Success snackbar */}
  <Snackbar open={showAdded} autoHideDuration={3000} onClose={() => setShowAdded(false)}
    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
    <Alert severity="success" variant="filled">Termék hozzáadva a kosárhoz!</Alert>
  </Snackbar>
</PageContainer>
```

### Loading State

```tsx
<PageContainer>
  <Skeleton variant="text" width={300} sx={{ mb: 3 }} />
  <Grid container spacing={4}>
    <Grid size={{ xs: 12, md: 6 }}>
      <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <Skeleton variant="text" width="80%" height={48} />
      <Skeleton variant="text" width="30%" height={40} />
      <Skeleton variant="text" width="20%" height={32} sx={{ mt: 1 }} />
      <Skeleton variant="text" width="100%" sx={{ mt: 2 }} />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="rectangular" width={200} height={48} sx={{ mt: 4 }} />
    </Grid>
  </Grid>
</PageContainer>
```

### data-test-id values

- `addToCartButton` — add to cart button (existing)
- `priceDisplay` — price (existing)

### Icons

- `CheckCircleIcon`, `WarningIcon`, `CancelIcon` — stock status
- `ShoppingCartIcon` — add to cart button
- `ImageOutlinedIcon` — image placeholder

---

## Cart Page

**Route:** `/kosar`

### Desktop

```
┌──────────────────────────────────────────────────────────────┐
│  h3: Kosár                                                   │
│                                                              │
│  ℹ️ Ingyenes szállítás 15 000 Ft feletti rendelésnél!        │
│                                                              │
│  [img] Levendulás kenőcs    3 490 Ft   [-]1[+]  3 490 Ft  🗑│
│  ───────────────────────────────────────────────────────────  │
│  [img] Mentás balzsam       2 990 Ft   [-]2[+]  5 980 Ft  🗑│
│  ───────────────────────────────────────────────────────────  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Részösszeg:                              9 470 Ft      │  │
│  │ Szállítási költség:                      1 490 Ft      │  │
│  │ ──────────────────────────────────────────             │  │
│  │ Összesen:                               10 960 Ft      │  │
│  │                                                        │  │
│  │ [        Tovább a fizetéshez        ]                  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Mobile

Line items stack: image+name row, then quantity+price+delete row.

### Component Tree

```tsx
<PageContainer>
  <Typography variant="h3" component="h1" gutterBottom>Kosár</Typography>

  {/* Shipping threshold */}
  {subtotal < FREE_SHIPPING_THRESHOLD ? (
    <Alert severity="info" sx={{ mb: 3 }}>
      Ingyenes szállítás {formatPriceHuf(FREE_SHIPPING_THRESHOLD)} feletti rendelésnél!
    </Alert>
  ) : (
    <Alert severity="success" sx={{ mb: 3 }}>Ingyenes szállítás!</Alert>
  )}

  {/* Line items */}
  {items.map((item) => (
    <Box key={item.product.id} data-test-id="cartLineItem">
      <Box sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { sm: "center" },
        gap: 2,
        py: 2
      }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Box sx={{ width: 80, height: 80, bgcolor: "grey.200", borderRadius: 1, flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>{item.product.name}</Typography>
            <PriceDisplay amount={item.product.priceHuf} variant="body2" />
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: { sm: "auto" } }}>
          <QuantitySelector value={item.quantity} onChange={(v) => updateQuantity(item.product.id, v)} />
          <PriceDisplay amount={item.product.priceHuf * item.quantity} />
          <IconButton aria-label="Törlés" onClick={() => removeItem(item.product.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
      <Divider />
    </Box>
  ))}

  {/* Summary */}
  <Paper sx={{ p: 3, mt: 3 }}>
    <Stack spacing={1}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography>Részösszeg</Typography>
        <PriceDisplay amount={subtotal} />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography>Szállítási költség</Typography>
        {shippingCost === 0 ? (
          <Typography color="success.main" fontWeight={600}>Ingyenes</Typography>
        ) : (
          <PriceDisplay amount={shippingCost} />
        )}
      </Box>
      <Divider />
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">Összesen</Typography>
        <PriceDisplay amount={subtotal + shippingCost} variant="h6" />
      </Box>
    </Stack>
    <Button variant="contained" size="large" fullWidth sx={{ mt: 2 }} onClick={() => navigate("/penztar")}>
      Tovább a fizetéshez
    </Button>
  </Paper>
</PageContainer>
```

### Empty State

```tsx
<PageContainer>
  <EmptyState
    icon={<ShoppingCartIcon fontSize="inherit" />}
    message="A kosár üres"
    action={{ label: "Termékek böngészése", onClick: () => navigate("/termekek") }}
  />
</PageContainer>
```

### data-test-id values

- `cartLineItem` — each line item (existing)

---

## Checkout Page

**Route:** `/penztar`

**Guard:** redirect to `/kosar` if cart is empty.

### Desktop

```
┌──────────────────────────────────────────────────────────────┐
│  h3: Fizetés                                                 │
│                                                              │
│  ┌──────────────────────────────┐  ┌──────────────────────┐ │
│  │ h5: Kapcsolattartási adatok  │  │ h5: Rendelés         │ │
│  │ [Név        ] [E-mail     ]  │  │     összegzése       │ │
│  │ [Telefon    ]                │  │                      │ │
│  │                              │  │ Levendulás x1  3490  │ │
│  │ h5: Szállítási cím          │  │ Mentás x2      5980  │ │
│  │ [Név                      ]  │  │ ──────────────────── │ │
│  │ [Irsz ] [Város            ]  │  │ Részösszeg:    9470  │ │
│  │ [Utca, házszám            ]  │  │ Szállítás:     1490  │ │
│  │                              │  │ ──────────────────── │ │
│  │ h5: Számlázási cím         │  │ Összesen:     10960  │ │
│  │ ☑ Megegyezik a szállítási   │  │                      │ │
│  │   címmel                    │  │ [Megrendelés         │ │
│  │                              │  │  elküldése]          │ │
│  │ h5: Szállítási mód         │  └──────────────────────┘ │
│  │ ┌──────────────────────┐    │                           │
│  │ │ ◉ GLS futárszolgálat │    │                           │
│  │ │   1-3 munkanap       │    │                           │
│  │ └──────────────────────┘    │                           │
│  │ ┌──────────────────────┐    │                           │
│  │ │ ○ Foxpost csomagpont │    │                           │
│  │ └──────────────────────┘    │                           │
│  │                              │                           │
│  │ h5: Megjegyzés              │                           │
│  │ [                         ]  │                           │
│  └──────────────────────────────┘                           │
└──────────────────────────────────────────────────────────────┘
```

### Mobile

Single column. Summary section moves below the form (not sticky).

### Component Tree

```tsx
<PageContainer>
  <Typography variant="h3" component="h1" gutterBottom>Fizetés</Typography>
  <Grid container spacing={4}>
    {/* Form column */}
    <Grid size={{ xs: 12, md: 8 }}>
      {/* Customer info */}
      <Typography variant="h5" gutterBottom>Kapcsolattartási adatok</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Név" required error={!!errors.customerName}
            helperText={errors.customerName} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="E-mail" type="email" required error={!!errors.customerEmail}
            helperText={errors.customerEmail} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Telefon" required error={!!errors.customerPhone}
            helperText={errors.customerPhone || "+36 vagy 06 előtaggal"} />
        </Grid>
      </Grid>

      {/* Shipping address */}
      <Typography variant="h5" sx={{ mt: 4 }} gutterBottom>Szállítási cím</Typography>
      <Grid container spacing={2}>
        <Grid size={12}>
          <TextField fullWidth label="Név" required />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth label="Irányítószám" required inputProps={{ maxLength: 4 }}
            helperText="4 számjegy" error={!!errors.shippingZip} />
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField fullWidth label="Város" required />
        </Grid>
        <Grid size={12}>
          <TextField fullWidth label="Utca, házszám" required />
        </Grid>
      </Grid>

      {/* Billing address */}
      <Typography variant="h5" sx={{ mt: 4 }} gutterBottom>Számlázási cím</Typography>
      <FormControlLabel
        control={<Checkbox checked={sameAsShipping} onChange={(e) => setSameAsShipping(e.target.checked)} />}
        label="Megegyezik a szállítási címmel"
      />
      {!sameAsShipping && (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={12}><TextField fullWidth label="Név" required /></Grid>
          <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Irányítószám" required inputProps={{ maxLength: 4 }} /></Grid>
          <Grid size={{ xs: 12, sm: 8 }}><TextField fullWidth label="Város" required /></Grid>
          <Grid size={12}><TextField fullWidth label="Utca, házszám" required /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Adószám" helperText="Cég esetén (opcionális)" /></Grid>
        </Grid>
      )}

      {/* Shipping method */}
      <Typography variant="h5" sx={{ mt: 4 }} gutterBottom>Szállítási mód</Typography>
      <RadioGroup value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)}>
        <Paper sx={{ p: 2, mb: 1, border: 1, borderColor: shippingMethod === "gls" ? "primary.main" : "divider", cursor: "pointer" }}
          onClick={() => setShippingMethod("gls")}>
          <FormControlLabel value="gls" control={<Radio />} label={
            <Box>
              <Typography fontWeight={600}>GLS futárszolgálat</Typography>
              <Typography variant="body2" color="text.secondary">1-3 munkanap</Typography>
            </Box>
          } />
        </Paper>
        <Paper sx={{ p: 2, mb: 1, border: 1, borderColor: shippingMethod === "foxpost" ? "primary.main" : "divider", cursor: "pointer" }}
          onClick={() => setShippingMethod("foxpost")}>
          <FormControlLabel value="foxpost" control={<Radio />} label={
            <Box>
              <Typography fontWeight={600}>Foxpost csomagpont</Typography>
              <Typography variant="body2" color="text.secondary">1-2 munkanap</Typography>
            </Box>
          } />
        </Paper>
      </RadioGroup>

      {/* Note */}
      <TextField fullWidth label="Megjegyzés" multiline rows={3} sx={{ mt: 4 }} />
    </Grid>

    {/* Order summary sidebar */}
    <Grid size={{ xs: 12, md: 4 }}>
      <Paper sx={{ p: 3, position: { md: "sticky" }, top: { md: 80 } }}>
        <Typography variant="h5" gutterBottom>Rendelés összegzése</Typography>
        {items.map((item) => (
          <Box key={item.product.id} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2">{item.product.name} × {item.quantity}</Typography>
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
        <Button
          variant="contained"
          size="large"
          fullWidth
          sx={{ mt: 3 }}
          disabled={!isValid || isSubmitting}
          data-test-id="placeOrderButton"
        >
          {isSubmitting ? <CircularProgress size={24} /> : "Megrendelés elküldése"}
        </Button>
      </Paper>
    </Grid>
  </Grid>
</PageContainer>
```

### Validation (from Zod schema)

| Field | Rule | Error message |
|---|---|---|
| customerName | min 1, max 200 | "Kötelező mező" |
| customerEmail | valid email | "Érvénytelen e-mail cím" |
| customerPhone | regex `^\+?[0-9\s-]{7,15}$` | "Érvénytelen telefonszám" |
| shipping.zip | regex `^[0-9]{4}$` | "Érvénytelen irányítószám" |
| shipping.name | min 1 | "Kötelező mező" |
| shipping.city | min 1 | "Kötelező mező" |
| shipping.address | min 1 | "Kötelező mező" |

### data-test-id values

- `checkoutForm` — form container (existing)
- `placeOrderButton` — submit button (existing)

---

## Order Confirmation Page

**Route:** `/rendeles-visszaigazolas/:id`

### Desktop

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                    ✓ (green, 64px)                           │
│            h3: Köszönjük a rendelését!                       │
│       h6: A rendelés részleteiről e-mailben                  │
│           értesítjük.                                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ h5: Rendelés részletei                                 │  │
│  │ Rendelési szám: HO-20260327-001  [Feldolgozás alatt]  │  │
│  │ ──────────────────────────────────────────             │  │
│  │ Levendulás kenőcs × 1                     3 490 Ft    │  │
│  │ Mentás balzsam × 2                        5 980 Ft    │  │
│  │ ──────────────────────────────────────────             │  │
│  │ Részösszeg:                                9 470 Ft    │  │
│  │ Szállítás:                                 1 490 Ft    │  │
│  │ Összesen:                                 10 960 Ft    │  │
│  │ ──────────────────────────────────────────             │  │
│  │ Szállítási cím:                                        │  │
│  │ Kovács János, 1234 Budapest, Fő utca 1.               │  │
│  │                                                        │  │
│  │ [📄 Számla letöltése]                                  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│              [Tovább vásárolok]                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Component Tree

```tsx
<PageContainer>
  <Box sx={{ textAlign: "center", py: 4 }} data-test-id="orderConfirmation">
    <CheckCircleIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
    <Typography variant="h3" component="h1" gutterBottom>
      Köszönjük a rendelését!
    </Typography>
    <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
      A rendelés részleteiről e-mailben értesítjük.
    </Typography>
  </Box>

  <Paper sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
    <Typography variant="h5" gutterBottom>Rendelés részletei</Typography>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      <Typography>Rendelési szám:</Typography>
      <Typography fontWeight={600}>{order.orderNumber}</Typography>
      <Chip label="Feldolgozás alatt" color="warning" size="small" />
    </Box>
    <Divider sx={{ my: 2 }} />

    {/* Items */}
    {order.items.map((item) => (
      <Box key={item.id} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="body2">{item.productName} × {item.quantity}</Typography>
        <PriceDisplay amount={item.lineTotalHuf} variant="body2" />
      </Box>
    ))}
    <Divider sx={{ my: 2 }} />

    {/* Totals */}
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
      <Typography>Részösszeg</Typography><PriceDisplay amount={order.subtotalHuf} />
    </Box>
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
      <Typography>Szállítás</Typography><PriceDisplay amount={order.shippingCostHuf} />
    </Box>
    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
      <Typography fontWeight={700}>Összesen</Typography><PriceDisplay amount={order.totalHuf} variant="body1" />
    </Box>
    <Divider sx={{ my: 2 }} />

    {/* Shipping address */}
    <Typography variant="subtitle2">Szállítási cím</Typography>
    <Typography variant="body2" color="text.secondary">
      {order.shippingName}, {order.shippingZip} {order.shippingCity}, {order.shippingAddress}
    </Typography>

    {/* Invoice */}
    <Button variant="outlined" startIcon={<ReceiptIcon />} sx={{ mt: 3 }} disabled={!order.invoiceReady}>
      Számla letöltése
    </Button>
  </Paper>

  <Box sx={{ textAlign: "center", mt: 4 }}>
    <Button variant="contained" component={Link} to="/termekek">Tovább vásárolok</Button>
  </Box>
</PageContainer>
```

### Loading State

Skeleton: CheckCircle icon placeholder, Skeleton text lines for heading, Skeleton Paper with text lines.

### data-test-id values

- `orderConfirmation` — page root (existing)

---

## 404 Page

**Route:** `*`

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                  🔍 (80px, text.secondary)                   │
│                       h2: 404                                │
│              h5: Az oldal nem található                      │
│              [Vissza a főoldalra]                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Component Tree

```tsx
<PageContainer>
  <Box sx={{ textAlign: "center", py: 8 }}>
    <SearchOffIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
    <Typography variant="h2" component="h1" gutterBottom>404</Typography>
    <Typography variant="h5" color="text.secondary" gutterBottom>
      Az oldal nem található
    </Typography>
    <Button variant="contained" component={Link} to="/">Vissza a főoldalra</Button>
  </Box>
</PageContainer>
```

---

## File Structure

```
packages/frontend/src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx          (update: add CartDrawer + Snackbar)
│   │   ├── Header.tsx             (update: add mobile nav + cart drawer trigger)
│   │   ├── Footer.tsx             (update: 3-column layout)
│   │   ├── PageContainer.tsx      (existing, no changes)
│   │   ├── CartDrawer.tsx         (NEW)
│   │   └── MobileNavDrawer.tsx    (NEW)
│   ├── product/
│   │   ├── ProductCard.tsx        (update: hover effect)
│   │   ├── PriceDisplay.tsx       (existing, no changes)
│   │   ├── QuantitySelector.tsx   (existing, no changes)
│   │   ├── CategoryFilter.tsx     (NEW)
│   │   └── SkeletonProductCard.tsx (NEW)
│   └── shared/
│       ├── LoadingSpinner.tsx     (existing, keep as fallback)
│       └── EmptyState.tsx         (existing, no changes)
├── pages/
│   ├── HomePage.tsx               (update: hero, brand story, trust signals)
│   ├── ProductListPage.tsx        (update: filters, sort, skeletons)
│   ├── ProductDetailPage.tsx      (update: breadcrumbs, stock, snackbar)
│   ├── CartPage.tsx               (update: shipping alert, summary paper)
│   ├── CheckoutPage.tsx           (rewrite: full form with validation)
│   ├── OrderConfirmationPage.tsx  (update: order details)
│   └── NotFoundPage.tsx           (update: add SearchOffIcon)
├── stores/
│   └── cartStore.ts               (existing, no changes)
├── hooks/
│   └── useProducts.ts             (existing, no changes)
├── api/
│   ├── client.ts                  (existing, no changes)
│   └── products.ts                (existing, no changes)
├── router.tsx                     (existing, no changes)
├── theme.ts                       (existing, no changes)
└── main.tsx                       (existing, no changes)
```

### New Components Summary

| Component | Purpose |
|---|---|
| `CartDrawer` | Right-side quick cart view |
| `MobileNavDrawer` | Left-side mobile navigation |
| `CategoryFilter` | Chip row for product categories |
| `SkeletonProductCard` | Loading placeholder for product cards |

### Icons Required (from @mui/icons-material)

| Icon | Usage |
|---|---|
| `MenuIcon` | Mobile hamburger |
| `CloseIcon` | Drawer close buttons |
| `ShoppingCartIcon` | Cart badge, add to cart button |
| `DeleteIcon` | Remove from cart |
| `SearchOffIcon` | Empty states, 404 page |
| `CheckCircleIcon` | In-stock indicator, order confirmation |
| `WarningIcon` | Low stock indicator |
| `CancelIcon` | Out of stock indicator |
| `ReceiptIcon` | Invoice download |
| `ArrowForwardIcon` | "Összes termék" link |
| `SpaOutlined` | Trust signal: natural |
| `HandshakeOutlined` | Trust signal: handmade |
| `FlagOutlined` | Trust signal: Hungarian |
| `ImageOutlinedIcon` | Image placeholder |
