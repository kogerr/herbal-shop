import type { AdminOrderDetail, AdminOrderSummary, AdminStats, Product } from "@webshop/shared";
import type { ApiError, FetchOptions } from "./client";
import { apiFetch } from "./client";

type AdminOrdersResponse = {
  orders: AdminOrderSummary[];
  page: number;
  total: number;
  totalPages: number;
};

const handleUnauthorized = () => {
  sessionStorage.removeItem("admin-api-key");
  window.location.href = "/admin/login";
};

export const adminFetch = async <T>(path: string, options?: FetchOptions): Promise<T> => {
  const key = sessionStorage.getItem("admin-api-key");

  try {
    return await apiFetch<T>(`/admin${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${key ?? ""}`,
      },
    });
  } catch (error) {
    if (error instanceof Error && "status" in error && (error as ApiError).status === 401) {
      handleUnauthorized();
    }

    throw error;
  }
};

export const fetchAdminProducts = (): Promise<Product[]> => {
  return adminFetch<Product[]>("/products");
};

export const createAdminProduct = (body: Partial<Product>): Promise<Product> => {
  return adminFetch<Product>("/products", { body, method: "POST" });
};

export const updateAdminProduct = (id: string, body: Partial<Product>): Promise<Product> => {
  return adminFetch<Product>(`/products/${id}`, { body, method: "PUT" });
};

export const deleteAdminProduct = (id: string): Promise<Product> => {
  return adminFetch<Product>(`/products/${id}`, { method: "DELETE" });
};

export const fetchAdminOrders = (params?: { page?: number; status?: string }): Promise<AdminOrdersResponse> => {
  const searchParams = new URLSearchParams();

  if (params?.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params?.status) {
    searchParams.set("status", params.status);
  }

  const query = searchParams.toString();
  const suffix = query ? `?${query}` : "";

  return adminFetch<AdminOrdersResponse>(`/orders${suffix}`);
};

export const fetchAdminOrder = (id: string): Promise<AdminOrderDetail> => {
  return adminFetch<AdminOrderDetail>(`/orders/${id}`);
};

export const shipAdminOrder = (id: string): Promise<AdminOrderDetail> => {
  return adminFetch<AdminOrderDetail>(`/orders/${id}/ship`, { method: "PATCH" });
};

export const fetchAdminStats = async (): Promise<AdminStats> => {
  const [products, ordersPageOne, pendingOrders] = await Promise.all([
    fetchAdminProducts(),
    fetchAdminOrders({ page: 1 }),
    fetchAdminOrders({ page: 1, status: "pending" }),
  ]);

  const today = new Date();
  const todayRevenueFromPage = ordersPageOne.orders
    .filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate.toDateString() === today.toDateString();
    })
    .reduce((sum, order) => sum + order.totalHuf, 0);

  if (ordersPageOne.totalPages <= 1) {
    return {
      activeProducts: products.filter((product) => product.isActive).length,
      pendingOrders: pendingOrders.total,
      todayRevenue: todayRevenueFromPage,
      totalOrders: ordersPageOne.total,
    };
  }

  const remainingPagePromises: Promise<AdminOrdersResponse>[] = [];

  for (let page = 2; page <= ordersPageOne.totalPages; page += 1) {
    remainingPagePromises.push(fetchAdminOrders({ page }));
  }

  const remainingPages = await Promise.all(remainingPagePromises);
  const todayRevenueFromRemainingPages = remainingPages
    .flatMap((pageData) => pageData.orders)
    .filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate.toDateString() === today.toDateString();
    })
    .reduce((sum, order) => sum + order.totalHuf, 0);

  return {
    activeProducts: products.filter((product) => product.isActive).length,
    pendingOrders: pendingOrders.total,
    todayRevenue: todayRevenueFromPage + todayRevenueFromRemainingPages,
    totalOrders: ordersPageOne.total,
  };
};
