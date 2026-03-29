import { createBrowserRouter } from "react-router";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminProtectedRoute } from "./components/admin/AdminProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ProductListPage } from "./pages/ProductListPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminOrderDetailPage } from "./pages/admin/AdminOrderDetailPage";
import { AdminOrderListPage } from "./pages/admin/AdminOrderListPage";
import { AdminProductFormPage } from "./pages/admin/AdminProductFormPage";
import { AdminProductListPage } from "./pages/admin/AdminProductListPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "termekek", element: <ProductListPage /> },
      { path: "termekek/:slug", element: <ProductDetailPage /> },
      { path: "kosar", element: <CartPage /> },
      { path: "penztar", element: <CheckoutPage /> },
      { path: "rendeles-visszaigazolas/:id", element: <OrderConfirmationPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "admin",
    children: [
      { path: "login", element: <AdminLoginPage /> },
      {
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
    ],
  },
]);
