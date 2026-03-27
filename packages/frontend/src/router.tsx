import { createBrowserRouter } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ProductListPage } from "./pages/ProductListPage";

export const router = createBrowserRouter([
  {
    children: [
      { index: true, element: <HomePage /> },
      { path: "termekek", element: <ProductListPage /> },
      { path: "termekek/:slug", element: <ProductDetailPage /> },
      { path: "kosar", element: <CartPage /> },
      { path: "penztar", element: <CheckoutPage /> },
      { path: "rendeles-visszaigazolas/:id", element: <OrderConfirmationPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
    element: <AppLayout />,
  },
]);
