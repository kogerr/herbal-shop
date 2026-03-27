# Admin Dashboard UI Implementation Plan

---

## Table of Contents

1. [Shared Types & Constants](#shared-types--constants)
2. [Auth Pattern](#auth-pattern)
3. [AdminLayout](#adminlayout)
4. [Admin Login](#admin-login)
5. [Admin Dashboard](#admin-dashboard)
6. [Admin Product List](#admin-product-list)
7. [Admin Product Form](#admin-product-form)
8. [Admin Order List](#admin-order-list)
9. [Admin Order Detail](#admin-order-detail)

---

## Shared Types & Constants

### Status Chip Mapping (used across all admin pages)

```ts
const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: ChipProps["color"] }> = {
  pending: { label: "Fuggoben", color: "warning" },
  paid: { label: "Fizetve", color: "info" },
  shipped: { label: "Kiszallitva", color: "primary" },
  delivered: { label: "Kezbesitve", color: "success" },
  cancelled: { label: "Lemondva", color: "error" },
};
```

Note: The actual Hungarian labels use proper accented characters:
- "Fuggyben" = "Fuggyben" = "Fuggyben" -- see exact strings in each page section below.

### Price Formatter (reuse `PriceDisplay` from storefront)

```ts
const formatPriceHuf = (amount: number): string =>
  new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency: "HUF",
    maximumFractionDigits: 0,
  }).format(amount);
```

### Date Formatter

```ts
const formatDateHu = (isoDate: string): string =>
  new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
```

### Sidebar Width Constant

```ts
const SIDEBAR_WIDTH = 240;
```

---

## Auth Pattern

### Storage

- API key stored in `sessionStorage` under key `"admin-api-key"`.
- On login, store the key. On logout, remove it.

### Protected Route Wrapper

Create component `AdminProtectedRoute`:
- On mount, read `sessionStorage.getItem("admin-api-key")`.
- If missing or empty, call `navigate("/admin/login", { replace: true })`.
- If present, render `<Outlet />`.

### API Call Helper

All admin API calls include the header:

```
Authorization: Bearer {sessionStorage.getItem("admin-api-key")}
```

Create a shared `adminFetch` utility wrapping `fetch` that:
1. Reads the key from sessionStorage.
2. Attaches the Authorization header.
3. On 401 response, clears sessionStorage and redirects to `/admin/login`.

---

## AdminLayout

### Route

Wraps all `/admin/*` routes (except `/admin/login`).

### ASCII Wireframe -- Desktop (md+)

```
+--SIDEBAR(240px)--+----TOPBAR(AppBar)----------------------------+
| "Herbal Admin"   | [PageTitle]                                  |
|------------------|                                               |
| > Iranytopult    +----------------------------------------------+
|   Termekek       |                                               |
|   Megrendelesek  |                                               |
|------------------|          <Outlet /> content area              |
|   Webshop        |                                               |
|   megtekintese   |                                               |
|                  |                                               |
|                  |                                               |
| [Kijelentkezes]  |                                               |
+------------------+----------------------------------------------+
```

### ASCII Wireframe -- Mobile (xs, sm)

```
+--TOPBAR(AppBar)-------------------------------------------+
| [hamburger]  [PageTitle]                                   |
+-----------------------------------------------------------+
|                                                            |
|              <Outlet /> content area                       |
|              (full width)                                  |
|                                                            |
+-----------------------------------------------------------+

Hamburger opens temporary Drawer (same content as sidebar).
```

### Component Tree

```
<AdminLayout>
  <Box sx={{ display: "flex" }}>

    {/* Sidebar -- permanent on md+, temporary on xs/sm */}
    <Drawer
      variant={{ xs: "temporary", md: "permanent" }}
      open={mobileOpen}                         // state for temporary
      onClose={handleDrawerToggle}
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: SIDEBAR_WIDTH,
          boxSizing: "border-box",
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontFamily: "'Lora', serif", color: "primary.main" }}>
          Herbal Admin
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItemButton
          selected={pathname === "/admin"}
          onClick={() => navigate("/admin")}
          sx={{ "&.Mui-selected": { bgcolor: "primary.light", color: "primary.main" } }}
        >
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Iranytopult" />
        </ListItemButton>

        <ListItemButton
          selected={pathname.startsWith("/admin/termekek")}
          onClick={() => navigate("/admin/termekek")}
          sx={{ "&.Mui-selected": { bgcolor: "primary.light", color: "primary.main" } }}
        >
          <ListItemIcon><InventoryIcon /></ListItemIcon>
          <ListItemText primary="Termekek" />
        </ListItemButton>

        <ListItemButton
          selected={pathname.startsWith("/admin/megrendelesek")}
          onClick={() => navigate("/admin/megrendelesek")}
          sx={{ "&.Mui-selected": { bgcolor: "primary.light", color: "primary.main" } }}
        >
          <ListItemIcon><ReceiptIcon /></ListItemIcon>
          <ListItemText primary="Megrendelesek" />
        </ListItemButton>
      </List>
      <Divider />
      <List>
        <ListItemButton onClick={() => window.open("/", "_blank")}>
          <ListItemIcon><StorefrontIcon /></ListItemIcon>
          <ListItemText primary="Webshop megtekintese" />
        </ListItemButton>
      </List>

      {/* Spacer to push logout to bottom */}
      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ p: 2 }}>
        <Button
          variant="outlined"
          color="error"
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Kijelentkezes
        </Button>
      </Box>
    </Drawer>

    {/* Main content area */}
    <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

      {/* TopBar */}
      <AppBar
        position="sticky"
        sx={{
          width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          ml: { md: `${SIDEBAR_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            aria-label="Menu megnyitasa"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ color: "text.primary" }}>
            {pageTitle}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Page content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          ml: { md: `${SIDEBAR_WIDTH}px` },
        }}
      >
        <Outlet />
      </Box>
    </Box>

  </Box>
</AdminLayout>
```

### Exact Hungarian Text

| Element | Text |
|---|---|
| Sidebar logo | "Herbal Admin" |
| Nav item 1 | "Iranyitopult" |
| Nav item 2 | "Termekek" |
| Nav item 3 | "Megrendelesek" |
| Nav divider item | "Webshop megtekintese" |
| Logout button | "Kijelentkezes" |
| Hamburger aria-label | "Menu megnyitasa" |

**Correct accented forms (copy these exactly):**

| Element | Hungarian Text |
|---|---|
| Sidebar logo | `Herbal Admin` |
| Nav item 1 | `Iranyitopult` |
| Nav item 2 | `Termekek` |
| Nav item 3 | `Megrendelesek` |
| Nav divider item | `Webshop megtekintese` |
| Logout button | `Kijelentkezes` |
| Hamburger aria-label | `Menu megnyitasa` |

**Final accented Hungarian text (use these exact strings):**

| Element | Hungarian Text |
|---|---|
| Sidebar logo | `Herbal Admin` |
| Nav item 1 | `Irányítópult` |
| Nav item 2 | `Termékek` |
| Nav item 3 | `Megrendelések` |
| Nav divider item | `Webshop megtekintése` |
| Logout button | `Kijelentkezés` |
| Hamburger aria-label | `Menü megnyitása` |

### Responsive Behavior

| Breakpoint | Sidebar | TopBar | Content |
|---|---|---|---|
| xs (0-599px) | Hidden (temporary Drawer, toggled by hamburger) | Full width, shows hamburger icon | Full width, p: 3 |
| sm (600-899px) | Hidden (temporary Drawer, toggled by hamburger) | Full width, shows hamburger icon | Full width, p: 3 |
| md (900-1199px) | Permanent, 240px | Offset left by 240px, no hamburger | Offset left by 240px, p: 3 |
| lg (1200px+) | Same as md | Same as md | Same as md |

### Selected State Styling

The active `ListItemButton` receives:
```ts
sx={{
  "&.Mui-selected": {
    bgcolor: "primary.light",    // #E8F0EA
    color: "primary.main",       // #4A7C59
    "& .MuiListItemIcon-root": {
      color: "primary.main",
    },
  },
}}
```

### Logout Behavior

1. Clear `sessionStorage.removeItem("admin-api-key")`.
2. Navigate to `/admin/login` with `replace: true`.

---

## Admin Login

### Route

`/admin/login` -- does NOT use AdminLayout. Standalone page.

### ASCII Wireframe -- All Breakpoints

```
+-----------------------------------------------------------+
|                                                            |
|                                                            |
|              +--Paper(maxWidth:400)------+                 |
|              |                           |                 |
|              |      [LockOutlinedIcon]   |                 |
|              |      "Admin belepes"      |                 |
|              |                           |                 |
|              |  [Alert: error message]   |  (if error)     |
|              |                           |                 |
|              |  [Password TextField]     |                 |
|              |                           |                 |
|              |  [======Belepes======]    |                 |
|              |                           |                 |
|              |  "Vissza a webshopba"     |                 |
|              +---------------------------+                 |
|                                                            |
+-----------------------------------------------------------+
bgcolor: background.default (#FAFAF7), minHeight: 100vh
```

### Component Tree

```
<Box
  sx={{
    minHeight: "100vh",
    bgcolor: "background.default",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    p: 2,
  }}
>
  <Paper
    sx={{
      maxWidth: 400,
      width: "100%",
      p: 4,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
    }}
  >
    <LockOutlinedIcon sx={{ fontSize: 48, color: "primary.main" }} />

    <Typography variant="h4">Admin belépés</Typography>

    {/* Shown only when loginError is truthy */}
    <Alert severity="error" sx={{ width: "100%" }}>
      Hibás API kulcs. Próbáld újra.
    </Alert>

    <TextField
      label="API kulcs"
      type="password"
      fullWidth
      value={apiKey}
      onChange={(event) => setApiKey(event.target.value)}
      onKeyDown={(event) => { if (event.key === "Enter") { handleLogin(); } }}
      autoFocus
      data-test-id="adminPasswordInput"
    />

    <Button
      variant="contained"
      fullWidth
      onClick={handleLogin}
      disabled={isLoading || apiKey.length === 0}
      data-test-id="adminLoginButton"
    >
      {isLoading ? <CircularProgress size={24} color="inherit" /> : "Belépés"}
    </Button>

    <Button
      variant="text"
      onClick={() => navigate("/")}
      data-test-id="backToShopButton"
    >
      Vissza a webshopba
    </Button>
  </Paper>
</Box>
```

### Exact Hungarian Text

| Element | Text |
|---|---|
| Page heading | `Admin belépés` |
| TextField label | `API kulcs` |
| Submit button | `Belépés` |
| Error alert | `Hibás API kulcs. Próbáld újra.` |
| Back link | `Vissza a webshopba` |

### Login Flow

1. User enters API key and clicks "Belépés" (or presses Enter).
2. Set `isLoading = true`.
3. Make a test request: `GET /api/admin/products` with the entered key as Bearer token.
4. If response is 200: store key in `sessionStorage.setItem("admin-api-key", apiKey)`, navigate to `/admin`.
5. If response is 401 or network error: set `loginError = true`, set `isLoading = false`.

### Loading State

- Button shows `<CircularProgress size={24} color="inherit" />` instead of text.
- Button is `disabled`.

### Error State

- `<Alert severity="error">` appears above the TextField.
- Alert disappears when user modifies the TextField value.

### data-test-id Values

| Element | data-test-id |
|---|---|
| Password input | `adminPasswordInput` |
| Login button | `adminLoginButton` |
| Back to shop button | `backToShopButton` |

---

## Admin Dashboard

### Route

`/admin` -- uses AdminLayout. Page title in TopBar: "Irányítópult".

### ASCII Wireframe -- Desktop (md+)

```
+-----------------------------------------------------------+
| [Stat Card 1]  [Stat Card 2]  [Stat Card 3]  [Stat Card 4]|
| Osszes megrend. Fuggoben levo  Mai bevetel   Aktiv termek  |
| 42              5              128 500 Ft     12            |
+-----------------------------------------------------------+
|                                                            |
| "Legutóbbi megrendelések"                                  |
| +--------------------------------------------------------+ |
| | Rendelesi sz. | Vevo      | Datum     | Allapot| Osszeg| |
| |--------------------------------------------------------| |
| | HO-2026...-001| Kiss Anna | 2026.03.27| [Chip] | 5900 | |
| | HO-2026...-002| Nagy Peter| 2026.03.26| [Chip] | 3200 | |
| | ...           | ...       | ...       | ...    | ...   | |
| +--------------------------------------------------------+ |
|                                                            |
| [Termekek kezelese]  [Osszes megrendeles]                  |
+-----------------------------------------------------------+
```

### ASCII Wireframe -- Mobile (xs)

```
+-------------------------------+
| [Stat Card 1 -- full width]  |
| [Stat Card 2 -- full width]  |
| [Stat Card 3 -- full width]  |
| [Stat Card 4 -- full width]  |
+-------------------------------+
| "Legutobbi megrendelesek"     |
| (horizontal scroll on table)  |
| +---------------------------+ |
| | table rows...             | |
| +---------------------------+ |
|                               |
| [Termekek kezelese]          |
| [Osszes megrendeles]          |
+-------------------------------+
```

### Component Tree

```
<Box>
  {/* Stat Cards */}
  <Grid container spacing={3} sx={{ mb: 4 }}>

    {/* Card 1: Osszes megrendeles */}
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <Paper sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ bgcolor: "primary.light", borderRadius: 2, p: 1.5, display: "flex" }}>
          <ReceiptIcon sx={{ color: "primary.main", fontSize: 28 }} />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Összes megrendelés
          </Typography>
          <Typography variant="h4">{stats.totalOrders}</Typography>
        </Box>
      </Paper>
    </Grid>

    {/* Card 2: Fuggoben levo */}
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <Paper sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ bgcolor: "#FFF3E0", borderRadius: 2, p: 1.5, display: "flex" }}>
          <HourglassEmptyIcon sx={{ color: "warning.main", fontSize: 28 }} />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Függőben lévő
          </Typography>
          <Typography variant="h4">{stats.pendingOrders}</Typography>
        </Box>
      </Paper>
    </Grid>

    {/* Card 3: Mai bevetel */}
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <Paper sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ bgcolor: "#E8F5E9", borderRadius: 2, p: 1.5, display: "flex" }}>
          <AttachMoneyIcon sx={{ color: "success.main", fontSize: 28 }} />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Mai bevétel
          </Typography>
          <Typography variant="h4">{formatPriceHuf(stats.todayRevenue)}</Typography>
        </Box>
      </Paper>
    </Grid>

    {/* Card 4: Aktiv termekek */}
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <Paper sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ bgcolor: "primary.light", borderRadius: 2, p: 1.5, display: "flex" }}>
          <InventoryIcon sx={{ color: "primary.main", fontSize: 28 }} />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Aktív termékek
          </Typography>
          <Typography variant="h4">{stats.activeProducts}</Typography>
        </Box>
      </Paper>
    </Grid>
  </Grid>

  {/* Recent Orders */}
  <Typography variant="h5" sx={{ mb: 2 }}>Legutóbbi megrendelések</Typography>

  <TableContainer component={Paper} sx={{ mb: 3 }}>
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
        {recentOrders.map((order) => (
          <TableRow
            key={order.id}
            hover
            sx={{ cursor: "pointer" }}
            onClick={() => navigate(`/admin/megrendelesek/${order.id}`)}
          >
            <TableCell sx={{ fontWeight: 600 }}>{order.orderNumber}</TableCell>
            <TableCell>{order.customerName}</TableCell>
            <TableCell>{formatDateHu(order.createdAt)}</TableCell>
            <TableCell>
              <Chip
                label={ORDER_STATUS_CONFIG[order.status].label}
                color={ORDER_STATUS_CONFIG[order.status].color}
                size="small"
              />
            </TableCell>
            <TableCell align="right">{formatPriceHuf(order.totalHuf)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>

  {/* Quick Actions */}
  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
    <Button
      variant="outlined"
      startIcon={<InventoryIcon />}
      onClick={() => navigate("/admin/termekek")}
    >
      Termékek kezelése
    </Button>
    <Button
      variant="outlined"
      startIcon={<ReceiptIcon />}
      onClick={() => navigate("/admin/megrendelesek")}
    >
      Összes megrendelés
    </Button>
  </Box>
</Box>
```

### Exact Hungarian Text

| Element | Text |
|---|---|
| Page title (TopBar) | `Irányítópult` |
| Stat card 1 label | `Összes megrendelés` |
| Stat card 2 label | `Függőben lévő` |
| Stat card 3 label | `Mai bevétel` |
| Stat card 4 label | `Aktív termékek` |
| Recent orders heading | `Legutóbbi megrendelések` |
| Table col 1 | `Rendelési szám` |
| Table col 2 | `Vevő` |
| Table col 3 | `Dátum` |
| Table col 4 | `Állapot` |
| Table col 5 | `Összeg` |
| Quick action 1 | `Termékek kezelése` |
| Quick action 2 | `Összes megrendelés` |

### Status Chip Mapping

| OrderStatus | Chip Label | Chip Color |
|---|---|---|
| `pending` | `Függőben` | `warning` |
| `paid` | `Fizetve` | `info` |
| `shipped` | `Kiszállítva` | `primary` |
| `delivered` | `Kézbesítve` | `success` |
| `cancelled` | `Lemondva` | `error` |

### API Endpoints

1. **Stats data**: `GET /api/admin/orders` -- fetch all orders, compute stats client-side:
   - `totalOrders`: total count from response.
   - `pendingOrders`: filter where `status === "pending"`.
   - `todayRevenue`: sum `totalHuf` where `status !== "cancelled"` and `createdAt` is today.
   - `activeProducts`: from `GET /api/admin/products`, count where `isActive === true`.
2. **Recent orders**: `GET /api/admin/orders?page=1` -- take first 10 rows.
3. **Active products count**: `GET /api/admin/products` -- count where `isActive === true`.

### Loading State

Each stat card shows a `<Skeleton variant="text" width={80} height={40} />` in place of the value.

The orders table shows 5 rows of `<Skeleton variant="text" />` in each cell.

```
<TableRow>
  <TableCell><Skeleton width={120} /></TableCell>
  <TableCell><Skeleton width={100} /></TableCell>
  <TableCell><Skeleton width={100} /></TableCell>
  <TableCell><Skeleton width={80} /></TableCell>
  <TableCell align="right"><Skeleton width={80} /></TableCell>
</TableRow>
```

### Empty State

If there are zero orders:

```
<Box sx={{ textAlign: "center", py: 6 }}>
  <ReceiptIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
  <Typography variant="h6" sx={{ color: "text.secondary" }}>
    Még nincs megrendelés
  </Typography>
</Box>
```

### Error State

```
<Alert severity="error" sx={{ mb: 3 }}>
  Hiba történt az adatok betöltésekor. Kérjük, próbáld újra később.
</Alert>
```

### data-test-id Values

| Element | data-test-id |
|---|---|
| Stat card (total orders) | `statTotalOrders` |
| Stat card (pending) | `statPendingOrders` |
| Stat card (revenue) | `statTodayRevenue` |
| Stat card (products) | `statActiveProducts` |
| Recent orders table | `recentOrdersTable` |

---

## Admin Product List

### Route

`/admin/termekek` -- uses AdminLayout. Page title in TopBar: "Termékek".

### ASCII Wireframe -- Desktop (md+)

```
+-----------------------------------------------------------+
| "Termékek" (h4)                      [+ Új termék]       |
+-----------------------------------------------------------+
|                                                            |
| +--------------------------------------------------------+ |
| | Kép  | Név           | Kategória | Ár     | Készlet    | |
| |      |               |           |        |            | |
| |      |               |           |        | Állapot    | |
| |      |               |           |        | Műveletek  | |
| |------+---------------+-----------+--------+------------| |
| |[img] | Levendulás k. | Ízületek. | 2 900  | [5]  [Chip]| |
| |      |               |           |   Ft   | [ed][vis]  | |
| |------+---------------+-----------+--------+------------| |
| |[img] | Körömvirág k. | Bőr       | 3 200  | [0]  [Chip]| |
| |      |               |           |   Ft   | [ed][vis]  | |
| +--------------------------------------------------------+ |
+-----------------------------------------------------------+
```

### ASCII Wireframe -- Mobile (xs)

```
+-------------------------------+
| "Termékek"    [+ Új termék]  |
+-------------------------------+
| (horizontal scroll table)     |
| +---------------------------+ |
| | Kép | Név | Ár | Készlet | |
| |     |     |    | Művelet | |
| | ... | ... | .. | ...     | |
| +---------------------------+ |
+-------------------------------+
```

On xs/sm, the "Kategória" and "Állapot" columns are hidden via `sx={{ display: { xs: "none", md: "table-cell" } }}`.

### Component Tree

```
<Box>
  {/* Header Row */}
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
    <Typography variant="h4">Termékek</Typography>
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => navigate("/admin/termekek/uj")}
      data-test-id="addProductButton"
    >
      Új termék
    </Button>
  </Box>

  {/* Product Table */}
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell sx={{ width: 64 }}>Kép</TableCell>
          <TableCell>Név</TableCell>
          <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Kategória</TableCell>
          <TableCell>Ár</TableCell>
          <TableCell>Készlet</TableCell>
          <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Állapot</TableCell>
          <TableCell>Műveletek</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id} hover>
            {/* Thumbnail */}
            <TableCell>
              <Box
                component="img"
                src={product.images[0] ?? "/placeholder-product.png"}
                alt={product.name}
                sx={{ width: 48, height: 48, objectFit: "cover", borderRadius: 1 }}
              />
            </TableCell>

            {/* Name */}
            <TableCell sx={{ fontWeight: 600 }}>{product.name}</TableCell>

            {/* Category (hidden on mobile) */}
            <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
              {product.category?.name ?? "—"}
            </TableCell>

            {/* Price */}
            <TableCell>{formatPriceHuf(product.priceHuf)}</TableCell>

            {/* Stock -- inline editable, color coded */}
            <TableCell>
              <TextField
                type="number"
                value={product.stock}
                onChange={(event) => handleStockChange(product.id, Number(event.target.value))}
                onBlur={() => handleStockSave(product.id)}
                size="small"
                sx={{
                  width: 80,
                  "& input": {
                    color: product.stock === 0
                      ? "error.main"
                      : product.stock <= 5
                        ? "warning.main"
                        : "text.primary",
                    fontWeight: 600,
                  },
                }}
                slotProps={{ htmlInput: { min: 0 } }}
              />
            </TableCell>

            {/* Status Chip (hidden on mobile) */}
            <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
              <Chip
                label={product.isActive ? "Aktív" : "Inaktív"}
                color={product.isActive ? "success" : "default"}
                size="small"
              />
            </TableCell>

            {/* Actions */}
            <TableCell>
              <IconButton
                aria-label="Szerkesztés"
                onClick={() => navigate(`/admin/termekek/${product.id}/szerkesztes`)}
                size="small"
              >
                <EditIcon />
              </IconButton>
              <IconButton
                aria-label={product.isActive ? "Deaktiválás" : "Aktiválás"}
                onClick={() => handleToggleActive(product.id, !product.isActive)}
                size="small"
              >
                {product.isActive ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
</Box>
```

### Exact Hungarian Text

| Element | Text |
|---|---|
| Page title (TopBar) | `Termékek` |
| Page heading | `Termékek` |
| Add button | `Új termék` |
| Table col: Image | `Kép` |
| Table col: Name | `Név` |
| Table col: Category | `Kategória` |
| Table col: Price | `Ár` |
| Table col: Stock | `Készlet` |
| Table col: Status | `Állapot` |
| Table col: Actions | `Műveletek` |
| Active chip | `Aktív` |
| Inactive chip | `Inaktív` |
| Edit aria-label | `Szerkesztés` |
| Visibility toggle aria-label (active) | `Deaktiválás` |
| Visibility toggle aria-label (inactive) | `Aktiválás` |
| Empty state heading | `Még nincs termék` |
| Empty state CTA | `Első termék hozzáadása` |

### Stock Inline Editing

1. Each stock cell contains a `TextField` of `type="number"` with `size="small"`.
2. Local state tracks edited stock values.
3. On `onBlur`, if value changed, fire `PUT /api/admin/products/:id` with `{ stock: newValue }`.
4. Color coding:
   - `stock === 0`: `color: "error.main"` (#C62828)
   - `stock <= 5`: `color: "warning.main"`
   - `stock > 5`: `color: "text.primary"` (#2D2D2D)

### Visibility Toggle

- Clicking the eye icon calls `PUT /api/admin/products/:id` with `{ isActive: !currentValue }`.
- This is a soft delete/reactivate. No confirmation dialog needed.
- On success, refetch product list.

### API Endpoints

| Action | Method | URL | Body |
|---|---|---|---|
| List products | GET | `/api/admin/products` | -- |
| Update stock | PUT | `/api/admin/products/:id` | `{ stock: number }` |
| Toggle active | PUT | `/api/admin/products/:id` | `{ isActive: boolean }` |

### Loading State

5 skeleton rows:

```
<TableRow>
  <TableCell><Skeleton variant="rectangular" width={48} height={48} /></TableCell>
  <TableCell><Skeleton width={150} /></TableCell>
  <TableCell><Skeleton width={100} /></TableCell>
  <TableCell><Skeleton width={80} /></TableCell>
  <TableCell><Skeleton width={60} /></TableCell>
  <TableCell><Skeleton width={60} /></TableCell>
  <TableCell><Skeleton width={80} /></TableCell>
</TableRow>
```

### Empty State

```
<Box sx={{ textAlign: "center", py: 8 }}>
  <InventoryIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
  <Typography variant="h6" sx={{ color: "text.secondary", mb: 2 }}>
    Még nincs termék
  </Typography>
  <Button
    variant="contained"
    startIcon={<AddIcon />}
    onClick={() => navigate("/admin/termekek/uj")}
  >
    Első termék hozzáadása
  </Button>
</Box>
```

### Error State

```
<Alert severity="error" sx={{ mb: 3 }}>
  Nem sikerült betölteni a termékeket. Kérjük, próbáld újra később.
</Alert>
```

### data-test-id Values

| Element | data-test-id |
|---|---|
| Add product button | `addProductButton` |
| Product table | `productTable` |
| Stock input (per row) | `stockInput_{productId}` |
| Edit button (per row) | `editProduct_{productId}` |
| Toggle button (per row) | `toggleProduct_{productId}` |

---

## Admin Product Form

### Routes

- **Create**: `/admin/termekek/uj` -- Page title: "Új termék"
- **Edit**: `/admin/termekek/:id/szerkesztes` -- Page title: "Termék szerkesztése"

Uses AdminLayout.

### ASCII Wireframe -- Desktop (md+)

```
+-----------------------------------------------------------+
| [<- Vissza]   "Új termék" (h4)                            |
+-----------------------------------------------------------+
| Paper                                                      |
| +--------------------------------------------------------+ |
| | [Név ___________________] [Slug ___________________]   | |
| |                                                        | |
| | [Leírás ____________________________________________]  | |
| | [____________________________________________________] | |
| | [____________________________________________________] | |
| | [____________________________________________________] | |
| |                                                        | |
| | [Összetevők ________________________________________]  | |
| | [____________________________________________________] | |
| | [____________________________________________________] | |
| |                                                        | |
| | [Ár___Ft] [Készlet__] [Súly___g] [Kategória v]        | |
| |                                                        | |
| | [Kép URL __________________________________________]   | |
| |                                                        | |
| | Aktív: [Switch]                                        | |
| +--------------------------------------------------------+ |
|                                                            |
|                           [Mégse]  [=====Mentés=====]     |
+-----------------------------------------------------------+
```

### ASCII Wireframe -- Mobile (xs)

```
+-------------------------------+
| [<- Vissza]                   |
| "Új termék"                   |
+-------------------------------+
| Paper                         |
| [Név _____________________]  |
| [Slug ____________________]  |
| [Leírás __________________]  |
| [_________________________]  |
| [Összetevők ______________]  |
| [_________________________]  |
| [Ár___Ft]                    |
| [Készlet__]                   |
| [Súly___g]                    |
| [Kategória v]                 |
| [Kép URL _________________]  |
| Aktív: [Switch]               |
+-------------------------------+
|  [Mégse]  [=====Mentés=====] |
+-------------------------------+
```

### Component Tree

```
<Box>
  {/* Header */}
  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
    <Button
      startIcon={<ArrowBackIcon />}
      onClick={() => navigate("/admin/termekek")}
    >
      Vissza
    </Button>
    <Typography variant="h4">
      {isEditMode ? "Termék szerkesztése" : "Új termék"}
    </Typography>
  </Box>

  {/* Form */}
  <Paper sx={{ p: 3, mb: 3 }}>
    <Grid container spacing={3}>

      {/* Name */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Név"
          fullWidth
          required
          value={form.name}
          onChange={(event) => handleFieldChange("name", event.target.value)}
          error={!!errors.name}
          helperText={errors.name}
          data-test-id="productNameInput"
        />
      </Grid>

      {/* Slug */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Slug (URL)"
          fullWidth
          required
          value={form.slug}
          onChange={(event) => handleFieldChange("slug", event.target.value)}
          error={!!errors.slug}
          helperText={errors.slug ?? "Automatikusan generálódik a névből"}
          data-test-id="productSlugInput"
        />
      </Grid>

      {/* Description */}
      <Grid size={{ xs: 12 }}>
        <TextField
          label="Leírás"
          fullWidth
          required
          multiline
          rows={4}
          value={form.description}
          onChange={(event) => handleFieldChange("description", event.target.value)}
          error={!!errors.description}
          helperText={errors.description}
          data-test-id="productDescriptionInput"
        />
      </Grid>

      {/* Ingredients */}
      <Grid size={{ xs: 12 }}>
        <TextField
          label="Összetevők"
          fullWidth
          required
          multiline
          rows={3}
          value={form.ingredients}
          onChange={(event) => handleFieldChange("ingredients", event.target.value)}
          error={!!errors.ingredients}
          helperText={errors.ingredients}
          data-test-id="productIngredientsInput"
        />
      </Grid>

      {/* Price */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <TextField
          label="Ár"
          type="number"
          fullWidth
          required
          value={form.priceHuf}
          onChange={(event) => handleFieldChange("priceHuf", Number(event.target.value))}
          error={!!errors.priceHuf}
          helperText={errors.priceHuf}
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">Ft</InputAdornment>,
            },
            htmlInput: { min: 0 },
          }}
          data-test-id="productPriceInput"
        />
      </Grid>

      {/* Stock */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <TextField
          label="Készlet"
          type="number"
          fullWidth
          required
          value={form.stock}
          onChange={(event) => handleFieldChange("stock", Number(event.target.value))}
          error={!!errors.stock}
          helperText={errors.stock}
          slotProps={{ htmlInput: { min: 0 } }}
          data-test-id="productStockInput"
        />
      </Grid>

      {/* Weight */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <TextField
          label="Súly"
          type="number"
          fullWidth
          required
          value={form.weight}
          onChange={(event) => handleFieldChange("weight", Number(event.target.value))}
          error={!!errors.weight}
          helperText={errors.weight}
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">g</InputAdornment>,
            },
            htmlInput: { min: 0 },
          }}
          data-test-id="productWeightInput"
        />
      </Grid>

      {/* Category */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <TextField
          label="Kategória"
          select
          fullWidth
          required
          value={form.categoryId}
          onChange={(event) => handleFieldChange("categoryId", event.target.value)}
          error={!!errors.categoryId}
          helperText={errors.categoryId}
          data-test-id="productCategorySelect"
        >
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* Image URL */}
      <Grid size={{ xs: 12 }}>
        <TextField
          label="Kép URL"
          fullWidth
          value={form.images[0] ?? ""}
          onChange={(event) => handleFieldChange("images", [event.target.value])}
          helperText="A termék fő képének URL-je"
          data-test-id="productImageInput"
        />
      </Grid>

      {/* Active Switch */}
      <Grid size={{ xs: 12 }}>
        <FormControlLabel
          control={
            <Switch
              checked={form.isActive}
              onChange={(event) => handleFieldChange("isActive", event.target.checked)}
              data-test-id="productActiveSwitch"
            />
          }
          label="Aktív"
        />
      </Grid>
    </Grid>
  </Paper>

  {/* Footer Actions */}
  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
    <Button
      variant="outlined"
      onClick={() => navigate("/admin/termekek")}
    >
      Mégse
    </Button>
    <Button
      variant="contained"
      onClick={handleSubmit}
      disabled={isSubmitting}
      data-test-id="productSaveButton"
    >
      {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Mentés"}
    </Button>
  </Box>
</Box>
```

### Slug Auto-Generation

When the user types in the "Név" field and the slug has not been manually edited:
1. Convert name to lowercase.
2. Replace Hungarian accented characters: `á→a, é→e, í→i, ó→o, ö→o, ő→o, ú→u, ü→u, ű→u`.
3. Replace spaces and non-alphanumeric characters with `-`.
4. Remove consecutive hyphens.
5. Trim leading/trailing hyphens.

Once the user manually edits the slug field, stop auto-generating. Track this with a `slugManuallyEdited` boolean state.

### Exact Hungarian Text

| Element | Text |
|---|---|
| Page title (create) | `Új termék` |
| Page title (edit) | `Termék szerkesztése` |
| Back button | `Vissza` |
| Name label | `Név` |
| Slug label | `Slug (URL)` |
| Slug helper | `Automatikusan generálódik a névből` |
| Description label | `Leírás` |
| Ingredients label | `Összetevők` |
| Price label | `Ár` |
| Price adornment | `Ft` |
| Stock label | `Készlet` |
| Weight label | `Súly` |
| Weight adornment | `g` |
| Category label | `Kategória` |
| Image URL label | `Kép URL` |
| Image URL helper | `A termék fő képének URL-je` |
| Active switch label | `Aktív` |
| Cancel button | `Mégse` |
| Save button | `Mentés` |
| Success snackbar | `Termék sikeresen mentve!` |
| Validation: required | `Kötelező mező` |
| Validation: price min | `Az ár nem lehet nulla vagy negatív` |
| Validation: slug format | `Csak kisbetűk, számok és kötőjel használható` |

### Form Validation (Client-Side)

| Field | Rule | Error Message |
|---|---|---|
| name | Required, min 1, max 200 | `Kötelező mező` / `Maximum 200 karakter` |
| slug | Required, regex `/^[a-z0-9-]+$/` | `Kötelező mező` / `Csak kisbetűk, számok és kötőjel használható` |
| description | Required | `Kötelező mező` |
| ingredients | Required | `Kötelező mező` |
| priceHuf | Required, > 0 | `Az ár nem lehet nulla vagy negatív` |
| stock | Required, >= 0 | `A készlet nem lehet negatív` |
| weight | Required, > 0 | `A súly nem lehet nulla vagy negatív` |
| categoryId | Required | `Válassz kategóriát` |

### API Endpoints

| Action | Method | URL | Body |
|---|---|---|---|
| Load product (edit) | GET | `/api/admin/products` | -- (filter client-side by id) |
| Load categories | GET | `/api/products?category=all` | -- (or derived from products) |
| Create product | POST | `/api/admin/products` | Full product payload (see below) |
| Update product | PUT | `/api/admin/products/:id` | Full product payload |

**Create/Update request body:**

```ts
{
  name: string;
  slug: string;
  description: string;
  ingredients: string;
  priceHuf: number;
  stock: number;
  weight: number;
  categoryId: string;
  images: string[];
  isActive: boolean;
}
```

### Loading State (Edit Mode)

While fetching product data:
- All TextFields show `<Skeleton variant="rectangular" height={56} />`.
- Switch shows `<Skeleton variant="rectangular" width={60} height={38} />`.

### Success Behavior

1. Show Snackbar: `Termék sikeresen mentve!` with `severity="success"`, `autoHideDuration={4000}`.
2. Navigate to `/admin/termekek` after 1 second delay.

### Error Behavior

If API returns error:

```
<Alert severity="error" sx={{ mb: 3 }}>
  Nem sikerült menteni a terméket. Kérjük, próbáld újra.
</Alert>
```

### data-test-id Values

| Element | data-test-id |
|---|---|
| Name input | `productNameInput` |
| Slug input | `productSlugInput` |
| Description input | `productDescriptionInput` |
| Ingredients input | `productIngredientsInput` |
| Price input | `productPriceInput` |
| Stock input | `productStockInput` |
| Weight input | `productWeightInput` |
| Category select | `productCategorySelect` |
| Image URL input | `productImageInput` |
| Active switch | `productActiveSwitch` |
| Save button | `productSaveButton` |

---

## Admin Order List

### Route

`/admin/megrendelesek` -- uses AdminLayout. Page title in TopBar: "Megrendelések".

### ASCII Wireframe -- Desktop (md+)

```
+-----------------------------------------------------------+
| "Megrendelések" (h4)                                       |
+-----------------------------------------------------------+
| [Mind] [Függőben] [Fizetve] [Kiszállítva] [Kézbesítve]    |
| [Lemondva]                                                 |
+-----------------------------------------------------------+
| +--------------------------------------------------------+ |
| | Rendelési szám | Vevő     | E-mail   | Dátum  |Állapot| |
| |                |          |          |        |Összeg | |
| |----------------+----------+----------+--------+-------| |
| | HO-2026...-001 | Kiss A.  | kiss@..  | 03.27. |[Chip] | |
| |                |          |          |        |5 900Ft| |
| |----------------+----------+----------+--------+-------| |
| | HO-2026...-002 | Nagy P.  | nagy@..  | 03.26. |[Chip] | |
| |                |          |          |        |3 200Ft| |
| +--------------------------------------------------------+ |
|                                Sorok száma: [10 v] 1-10/42 |
+-----------------------------------------------------------+
```

### ASCII Wireframe -- Mobile (xs)

```
+-------------------------------+
| "Megrendelések"               |
+-------------------------------+
| [Mind] [Függőben] [Fizetve]   |
| [Kiszállítva] [Kézbesítve]   |
| [Lemondva]                    |
+-------------------------------+
| (horizontal scroll table)     |
| Rend.szám | Vevő | Állapot   |
| ...       | ...  | ...       |
+-------------------------------+
| Sorok száma: [10v] 1-10/42   |
+-------------------------------+
```

On xs/sm: "E-mail" and "Dátum" columns are hidden.

### Component Tree

```
<Box>
  {/* Heading */}
  <Typography variant="h4" sx={{ mb: 3 }}>Megrendelések</Typography>

  {/* Status Filter Chips */}
  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
    {STATUS_FILTER_OPTIONS.map((option) => (
      <Chip
        key={option.value}
        label={option.label}
        variant={selectedStatus === option.value ? "filled" : "outlined"}
        color={selectedStatus === option.value ? "primary" : "default"}
        onClick={() => setSelectedStatus(option.value)}
        data-test-id={`orderFilter_${option.value}`}
      />
    ))}
  </Box>

  {/* Orders Table */}
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Rendelési szám</TableCell>
          <TableCell>Vevő</TableCell>
          <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>E-mail</TableCell>
          <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Dátum</TableCell>
          <TableCell>Állapot</TableCell>
          <TableCell align="right">Összeg</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {orders.map((order) => (
          <TableRow
            key={order.id}
            hover
            sx={{ cursor: "pointer" }}
            onClick={() => navigate(`/admin/megrendelesek/${order.id}`)}
            data-test-id={`orderRow_${order.id}`}
          >
            <TableCell sx={{ fontWeight: 600 }}>{order.orderNumber}</TableCell>
            <TableCell>{order.customerName}</TableCell>
            <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
              {order.customerEmail}
            </TableCell>
            <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
              {formatDateHu(order.createdAt)}
            </TableCell>
            <TableCell>
              <Chip
                label={ORDER_STATUS_CONFIG[order.status].label}
                color={ORDER_STATUS_CONFIG[order.status].color}
                size="small"
              />
            </TableCell>
            <TableCell align="right">{formatPriceHuf(order.totalHuf)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>

    <TablePagination
      component="div"
      count={totalOrders}
      page={page}
      onPageChange={handlePageChange}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={handleRowsPerPageChange}
      rowsPerPageOptions={[10, 25, 50]}
      labelRowsPerPage="Sorok száma:"
      labelDisplayedRows={({ from, to, count }) =>
        `${from}–${to} / ${count !== -1 ? count : `több mint ${to}`}`
      }
    />
  </TableContainer>
</Box>
```

### Status Filter Options

```ts
const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Mind" },
  { value: "pending", label: "Függőben" },
  { value: "paid", label: "Fizetve" },
  { value: "shipped", label: "Kiszállítva" },
  { value: "delivered", label: "Kézbesítve" },
  { value: "cancelled", label: "Lemondva" },
];
```

### Exact Hungarian Text

| Element | Text |
|---|---|
| Page title (TopBar) | `Megrendelések` |
| Page heading | `Megrendelések` |
| Filter: all | `Mind` |
| Filter: pending | `Függőben` |
| Filter: paid | `Fizetve` |
| Filter: shipped | `Kiszállítva` |
| Filter: delivered | `Kézbesítve` |
| Filter: cancelled | `Lemondva` |
| Table col 1 | `Rendelési szám` |
| Table col 2 | `Vevő` |
| Table col 3 | `E-mail` |
| Table col 4 | `Dátum` |
| Table col 5 | `Állapot` |
| Table col 6 | `Összeg` |
| Pagination label | `Sorok száma:` |
| Empty state | `Nincs megrendelés a kiválasztott szűrővel` |

### Responsive Behavior

| Breakpoint | Hidden Columns | Filter Chips | Pagination |
|---|---|---|---|
| xs (0-599px) | E-mail, Dátum | Wrap to 2 rows | Compact (arrows only) |
| sm (600-899px) | E-mail, Dátum | Wrap to 2 rows | Full |
| md (900px+) | None | Single row | Full |

### API Endpoint

```
GET /api/admin/orders?status={status}&page={page}
```

- When filter is "Mind" (`all`), omit the `status` query param.
- Response shape: `{ orders: Order[], total: number, page: number }`.
- Each order in the list includes: `id`, `orderNumber`, `customerName`, `customerEmail`, `status`, `totalHuf`, `createdAt`.

### Loading State

5 skeleton rows in the table, same pattern as Product List.

Filter chips: no skeleton needed (static data).

### Empty State (filtered)

```
<Box sx={{ textAlign: "center", py: 6 }}>
  <ReceiptIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
  <Typography variant="h6" sx={{ color: "text.secondary" }}>
    Nincs megrendelés a kiválasztott szűrővel
  </Typography>
</Box>
```

### Empty State (no orders at all)

```
<Box sx={{ textAlign: "center", py: 6 }}>
  <ReceiptIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
  <Typography variant="h6" sx={{ color: "text.secondary" }}>
    Még nincs megrendelés
  </Typography>
</Box>
```

### Error State

```
<Alert severity="error" sx={{ mb: 3 }}>
  Nem sikerült betölteni a megrendeléseket. Kérjük, próbáld újra később.
</Alert>
```

### Interactive Behaviors

- **Row hover**: default MUI Table `hover` prop -- light gray background.
- **Row click**: navigate to `/admin/megrendelesek/{order.id}`.
- **Filter chip click**: set active filter, reset pagination to page 0, refetch.
- **Active filter chip**: `variant="filled"`, `color="primary"`.
- **Inactive filter chip**: `variant="outlined"`, `color="default"`.

### data-test-id Values

| Element | data-test-id |
|---|---|
| Filter chip (per status) | `orderFilter_{status}` (e.g. `orderFilter_all`) |
| Order row (per order) | `orderRow_{orderId}` |
| Orders table | `ordersTable` |

---

## Admin Order Detail

### Route

`/admin/megrendelesek/:id` -- uses AdminLayout. Page title in TopBar: "Megrendelés #{orderNumber}".

### ASCII Wireframe -- Desktop (md+)

```
+-----------------------------------------------------------+
| [<- Vissza]  "Megrendelés #HO-2026..." (h4)  [Chip]      |
|                                                            |
|                     [Szállítás indítása] [Számla letöltése]|
+-----------------------------------------------------------+
| LEFT COLUMN (md:8)           | RIGHT COLUMN (md:4)        |
|                              |                             |
| "Rendelés tételei"          | Paper: "Vevő adatai"       |
| +------------------------+   | Kiss Anna                  |
| | Termék    |Ea.ár|Db|Ösz|  | kiss@example.com           |
| |-----------|-----|--|---|   | +36 30 123 4567            |
| | Levend.k. |2900 | 2|5800  |                             |
| | Körömv.k. |3200 | 1|3200  | Paper: "Szállítási cím"    |
| |-----------|-----|--|---|   | Kiss Anna                  |
| |           |Részö.|  |9000  | 1234 Budapest              |
| |           |Száll.|  | 990  | Fő utca 1.                |
| |           |ÖSSZESEN|10990  |                             |
| +------------------------+   | Paper: "Számlázási cím"    |
|                              | Kiss Anna                  |
|                              | 1234 Budapest              |
|                              | Fő utca 1.                |
|                              |                             |
|                              | Paper: "Állapot"           |
|                              | Létrehozva: 2026.03.27     |
|                              | Frissítve: 2026.03.27      |
|                              | Megjegyzés: "Kérem..."    |
+-----------------------------------------------------------+
```

### ASCII Wireframe -- Mobile (xs)

```
+-------------------------------+
| [<- Vissza]                   |
| "Megrendelés #HO-20..."      |
| [Chip: Fizetve]               |
| [Szállítás indítása]          |
| [Számla letöltése]            |
+-------------------------------+
| "Rendelés tételei"           |
| (horizontal scroll table)     |
| Termék | Ea.ár | Db | Összeg |
| ...    | ...   | .. | ...    |
| Részösszeg:          | 9 000 |
| Szállítás:           |   990 |
| ÖSSZESEN:            |10 990 |
+-------------------------------+
| Paper: "Vevő adatai"        |
| ...                           |
+-------------------------------+
| Paper: "Szállítási cím"     |
| ...                           |
+-------------------------------+
| Paper: "Számlázási cím"     |
| ...                           |
+-------------------------------+
| Paper: "Állapot"            |
| ...                           |
+-------------------------------+
```

### Component Tree

```
<Box>
  {/* Header */}
  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 3 }}>
    <Button
      startIcon={<ArrowBackIcon />}
      onClick={() => navigate("/admin/megrendelesek")}
    >
      Vissza
    </Button>
    <Typography variant="h4" sx={{ flexGrow: 1 }}>
      Megrendelés #{order.orderNumber}
    </Typography>
    <Chip
      label={ORDER_STATUS_CONFIG[order.status].label}
      color={ORDER_STATUS_CONFIG[order.status].color}
    />
  </Box>

  {/* Action Buttons */}
  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
    {order.status === "paid" && (
      <Button
        variant="contained"
        startIcon={<LocalShippingIcon />}
        onClick={() => setShipDialogOpen(true)}
        data-test-id="shipOrderButton"
      >
        Szállítás indítása
      </Button>
    )}
    <Button
      variant="outlined"
      startIcon={<DownloadIcon />}
      onClick={handleDownloadInvoice}
      data-test-id="downloadInvoiceButton"
    >
      Számla letöltése
    </Button>
  </Box>

  {/* Two-Column Layout */}
  <Grid container spacing={3}>

    {/* Left Column: Order Items */}
    <Grid size={{ xs: 12, md: 8 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Rendelés tételei</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Termék</TableCell>
              <TableCell align="right">Egységár</TableCell>
              <TableCell align="right">Mennyiség</TableCell>
              <TableCell align="right">Összeg</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.productName}</TableCell>
                <TableCell align="right">{formatPriceHuf(item.productPriceHuf)}</TableCell>
                <TableCell align="right">{item.quantity} db</TableCell>
                <TableCell align="right">{formatPriceHuf(item.lineTotalHuf)}</TableCell>
              </TableRow>
            ))}

            {/* Subtotal row */}
            <TableRow>
              <TableCell colSpan={3} align="right" sx={{ fontWeight: 600 }}>
                Részösszeg:
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                {formatPriceHuf(order.subtotalHuf)}
              </TableCell>
            </TableRow>

            {/* Shipping row */}
            <TableRow>
              <TableCell colSpan={3} align="right">
                Szállítási költség:
              </TableCell>
              <TableCell align="right">
                {formatPriceHuf(order.shippingCostHuf)}
              </TableCell>
            </TableRow>

            {/* Total row */}
            <TableRow>
              <TableCell colSpan={3} align="right" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                Összesen:
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                {formatPriceHuf(order.totalHuf)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>

    {/* Right Column: Info Cards */}
    <Grid size={{ xs: 12, md: 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

        {/* Customer Info */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 1 }}>
            Vevő adatai
          </Typography>
          <Typography sx={{ fontWeight: 600 }}>{order.customerName}</Typography>
          <Typography>{order.customerEmail}</Typography>
          <Typography>{order.customerPhone}</Typography>
        </Paper>

        {/* Shipping Address */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 1 }}>
            Szállítási cím
          </Typography>
          <Typography sx={{ fontWeight: 600 }}>{order.shippingName}</Typography>
          <Typography>{order.shippingZip} {order.shippingCity}</Typography>
          <Typography>{order.shippingAddress}</Typography>
        </Paper>

        {/* Billing Address */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 1 }}>
            Számlázási cím
          </Typography>
          <Typography sx={{ fontWeight: 600 }}>{order.billingName}</Typography>
          <Typography>{order.billingZip} {order.billingCity}</Typography>
          <Typography>{order.billingAddress}</Typography>
          {order.billingTaxNumber && (
            <Typography sx={{ mt: 0.5, color: "text.secondary" }}>
              Adószám: {order.billingTaxNumber}
            </Typography>
          )}
        </Paper>

        {/* Status / Timeline */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 1 }}>
            Állapot
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="body2">
              <Box component="span" sx={{ color: "text.secondary" }}>Létrehozva:</Box>{" "}
              {formatDateHu(order.createdAt)}
            </Typography>
            <Typography variant="body2">
              <Box component="span" sx={{ color: "text.secondary" }}>Frissítve:</Box>{" "}
              {formatDateHu(order.updatedAt)}
            </Typography>
            {order.note && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Megjegyzés:
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                  {order.note}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

      </Box>
    </Grid>
  </Grid>

  {/* Ship Confirmation Dialog */}
  <Dialog
    open={shipDialogOpen}
    onClose={() => setShipDialogOpen(false)}
  >
    <DialogTitle>Szállítás indítása</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Biztosan el lett küldve a csomag?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setShipDialogOpen(false)}>
        Mégse
      </Button>
      <Button
        variant="contained"
        onClick={handleConfirmShip}
        disabled={isShipping}
        data-test-id="confirmShipButton"
      >
        {isShipping ? <CircularProgress size={24} color="inherit" /> : "Igen, kiszállítva"}
      </Button>
    </DialogActions>
  </Dialog>

  {/* Success Snackbar */}
  <Snackbar
    open={snackbarOpen}
    autoHideDuration={4000}
    onClose={() => setSnackbarOpen(false)}
  >
    <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
      Rendelés sikeresen frissítve!
    </Alert>
  </Snackbar>
</Box>
```

### Exact Hungarian Text

| Element | Text |
|---|---|
| Page title (TopBar) | `Megrendelés #{orderNumber}` |
| Back button | `Vissza` |
| Ship button | `Szállítás indítása` |
| Download invoice button | `Számla letöltése` |
| Items heading | `Rendelés tételei` |
| Table col: Product | `Termék` |
| Table col: Unit price | `Egységár` |
| Table col: Quantity | `Mennyiség` |
| Table col: Amount | `Összeg` |
| Quantity suffix | `db` |
| Subtotal label | `Részösszeg:` |
| Shipping label | `Szállítási költség:` |
| Total label | `Összesen:` |
| Customer info heading | `Vevő adatai` |
| Shipping address heading | `Szállítási cím` |
| Billing address heading | `Számlázási cím` |
| Tax number label | `Adószám:` |
| Status heading | `Állapot` |
| Created label | `Létrehozva:` |
| Updated label | `Frissítve:` |
| Note label | `Megjegyzés:` |
| Dialog title | `Szállítás indítása` |
| Dialog body | `Biztosan el lett küldve a csomag?` |
| Dialog cancel | `Mégse` |
| Dialog confirm | `Igen, kiszállítva` |
| Success snackbar | `Rendelés sikeresen frissítve!` |

### API Endpoints

| Action | Method | URL | Notes |
|---|---|---|---|
| Load order | GET | `/api/admin/orders?status=all` | Find by id client-side, or add a `GET /api/admin/orders/:id` endpoint |
| Ship order | POST | `/api/admin/orders/:id/ship` | No body. Returns updated order. |
| Download invoice | GET | `/api/invoices/:orderId/download?token=xxx` | Returns PDF. Open in new tab or trigger download. |

### Ship Order Flow

1. User clicks "Szállítás indítása" button (only visible when `status === "paid"`).
2. Dialog opens with confirmation text.
3. User clicks "Igen, kiszállítva".
4. `isShipping = true`, button shows CircularProgress.
5. `POST /api/admin/orders/:id/ship` with admin auth header.
6. On success:
   - Close dialog.
   - Show success Snackbar: "Rendelés sikeresen frissítve!"
   - Refetch order data (status now "shipped").
   - Ship button disappears (status is no longer "paid").
7. On error:
   - Close dialog.
   - Show error Alert: "Nem sikerült frissíteni a rendelést."

### Invoice Download Flow

1. User clicks "Számla letöltése".
2. Open URL in new tab: `/api/invoices/${order.id}/download?token=${order.accessToken}`.
3. Browser handles PDF download natively.

### Loading State

While fetching order data:

**Left column (items table):**
```
<Skeleton variant="rectangular" height={300} />
```

**Right column (info cards):**
```
<Paper sx={{ p: 3 }}>
  <Skeleton width={100} height={20} sx={{ mb: 1 }} />
  <Skeleton width={200} />
  <Skeleton width={180} />
  <Skeleton width={160} />
</Paper>
```

Repeat for each info card (4 cards total).

### Error State

```
<Alert severity="error" sx={{ mb: 3 }}>
  Nem sikerült betölteni a megrendelés adatait. Kérjük, próbáld újra később.
</Alert>
```

### Conditional Action Button Visibility

| Order Status | "Szállítás indítása" | "Számla letöltése" |
|---|---|---|
| pending | Hidden | Hidden |
| paid | Visible | Visible |
| shipped | Hidden | Visible |
| delivered | Hidden | Visible |
| cancelled | Hidden | Hidden |

### Responsive Behavior

| Breakpoint | Layout | Action buttons |
|---|---|---|
| xs (0-599px) | Single column, stacked. Items table scrolls horizontally. | Full width, stacked vertically. |
| sm (600-899px) | Single column, stacked. | Inline, wrapped. |
| md (900px+) | Two columns (8/4 Grid split). | Inline. |

### data-test-id Values

| Element | data-test-id |
|---|---|
| Ship order button | `shipOrderButton` |
| Download invoice button | `downloadInvoiceButton` |
| Confirm ship button (dialog) | `confirmShipButton` |
| Order items table | `orderItemsTable` |
| Customer info card | `customerInfoCard` |
| Shipping address card | `shippingAddressCard` |
| Billing address card | `billingAddressCard` |
| Status card | `statusCard` |

---

## Router Integration

Add the following routes to `/packages/frontend/src/router.tsx`:

```tsx
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminProtectedRoute } from "./components/admin/AdminProtectedRoute";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminOrderDetailPage } from "./pages/admin/AdminOrderDetailPage";
import { AdminOrderListPage } from "./pages/admin/AdminOrderListPage";
import { AdminProductFormPage } from "./pages/admin/AdminProductFormPage";
import { AdminProductListPage } from "./pages/admin/AdminProductListPage";

// Add to the router config:
{
  path: "admin/login",
  element: <AdminLoginPage />,
},
{
  path: "admin",
  element: <AdminProtectedRoute />,
  children: [
    {
      element: <AdminLayout />,
      children: [
        { index: true, element: <AdminDashboardPage /> },
        { path: "termekek", element: <AdminProductListPage /> },
        { path: "termekek/uj", element: <AdminProductFormPage /> },
        { path: "termekek/:id/szerkesztes", element: <AdminProductFormPage /> },
        { path: "megrendelesek", element: <AdminOrderListPage /> },
        { path: "megrendelesek/:id", element: <AdminOrderDetailPage /> },
      ],
    },
  ],
},
```

---

## File Structure

```
packages/frontend/src/
├── components/
│   └── admin/
│       ├── AdminLayout.tsx          # Sidebar + TopBar + Outlet wrapper
│       ├── AdminProtectedRoute.tsx  # Auth guard (sessionStorage check)
│       ├── OrderStatusChip.tsx      # Reusable status Chip with label/color mapping
│       └── StatCard.tsx             # Reusable stat card (icon, label, value)
├── pages/
│   └── admin/
│       ├── AdminDashboardPage.tsx
│       ├── AdminLoginPage.tsx
│       ├── AdminOrderDetailPage.tsx
│       ├── AdminOrderListPage.tsx
│       ├── AdminProductFormPage.tsx
│       └── AdminProductListPage.tsx
└── utils/
    ├── adminFetch.ts               # Fetch wrapper with auth header + 401 handling
    ├── formatDateHu.ts             # Hungarian date formatter
    └── formatPriceHuf.ts           # Hungarian currency formatter (may already exist)
```

---

## TanStack Query Keys

| Query | Key | staleTime |
|---|---|---|
| Admin products | `["admin", "products"]` | 30 seconds |
| Admin orders (list) | `["admin", "orders", { status, page }]` | 30 seconds |
| Admin order (detail) | `["admin", "orders", orderId]` | 30 seconds |
| Admin dashboard stats | `["admin", "stats"]` | 60 seconds |

All admin queries use the `adminFetch` utility for auth.

---

## MUI Icons Used

| Icon | Import from | Used in |
|---|---|---|
| `DashboardIcon` | `@mui/icons-material/Dashboard` | AdminLayout sidebar |
| `InventoryIcon` | `@mui/icons-material/Inventory` | Sidebar, Dashboard stat, Product List empty |
| `ReceiptIcon` | `@mui/icons-material/Receipt` | Sidebar, Dashboard stat, Order List empty |
| `StorefrontIcon` | `@mui/icons-material/Storefront` | Sidebar |
| `LogoutIcon` | `@mui/icons-material/Logout` | Sidebar logout |
| `MenuIcon` | `@mui/icons-material/Menu` | TopBar hamburger |
| `LockOutlinedIcon` | `@mui/icons-material/LockOutlined` | Admin Login |
| `HourglassEmptyIcon` | `@mui/icons-material/HourglassEmpty` | Dashboard stat |
| `AttachMoneyIcon` | `@mui/icons-material/AttachMoney` | Dashboard stat |
| `AddIcon` | `@mui/icons-material/Add` | Product List add button |
| `EditIcon` | `@mui/icons-material/Edit` | Product List edit action |
| `VisibilityIcon` | `@mui/icons-material/Visibility` | Product List toggle (active) |
| `VisibilityOffIcon` | `@mui/icons-material/VisibilityOff` | Product List toggle (inactive) |
| `ArrowBackIcon` | `@mui/icons-material/ArrowBack` | Product Form, Order Detail back |
| `LocalShippingIcon` | `@mui/icons-material/LocalShipping` | Order Detail ship button |
| `DownloadIcon` | `@mui/icons-material/Download` | Order Detail invoice button |

---

## Accessibility Notes

- All `IconButton` elements have `aria-label` with Hungarian text.
- Tables use semantic `<TableHead>`, `<TableBody>`, `<TableRow>`, `<TableCell>`.
- Dialog uses `<DialogTitle>` for screen reader announcement.
- Snackbar uses MUI Alert which has `role="alert"` built in.
- Status Chips convey meaning through both color and text label.
- Keyboard navigation: all interactive elements are focusable; rows clickable via Enter key (add `onKeyDown` handler with `event.key === "Enter"`).
- Touch targets: all buttons and icon buttons meet 44x44px minimum.
