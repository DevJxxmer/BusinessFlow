const API_URL = "https://businessflow-zifa.onrender.com/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("accessToken") : null;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    try {
      const errorBody = await response.json();
      if (typeof errorBody?.message === "string") {
        message = errorBody.message;
      }
    } catch {
      // Ignore JSON parse errors and keep the fallback message.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const api = {
  auth: {
    login: (payload: { email: string; password: string }) => request<{ accessToken: string; user: { id: string; email: string; name: string; role: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
    register: (payload: { email: string; password: string; name: string }) => request<{ accessToken: string; user: { id: string; email: string; name: string; role: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
    me: () => request<{ user: { id: string; email: string; name: string; role: string } }>('/auth/me'),
  },
  businesses: {
    list: () => request<{ business: { id: string; name: string; slug: string } }[]>('/businesses'),
    create: (payload: { name: string; slug: string }) =>
      request<{ id: string; name: string; slug: string }>('/businesses', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
  products: {
    list: () =>
      request<
        Array<{
          id: string;
          name: string;
          sku: string;
          initialStock: number;
          minimumStock: number;
          salePrice: number;
          status: string;
          purchasePrice: number;
          category?: string;
          supplier?: string;
        }>
      >('/products'),
    create: (payload: {
      name: string;
      sku: string;
      purchasePrice: number;
      salePrice: number;
      initialStock: number;
      minimumStock: number;
      category?: string;
      supplier?: string;
      status?: string;
    }) =>
      request<{
        id: string;
        name: string;
        sku: string;
        initialStock: number;
        minimumStock: number;
        salePrice: number;
        status: string;
      }>('/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: {
      name?: string;
      sku?: string;
      purchasePrice?: number;
      salePrice?: number;
      initialStock?: number;
      minimumStock?: number;
      category?: string;
      supplier?: string;
      status?: string;
    }) =>
      request<{
        id: string;
        name: string;
        sku: string;
        initialStock: number;
        minimumStock: number;
        salePrice: number;
        status: string;
      }>(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    remove: (id: string) => request<{ id: string }>(`/products/${id}`, {
      method: 'DELETE',
    }),
  },
  sales: {
    list: () =>
      request<
        Array<{
          id: string;
          customerName: string;
          paymentMethod: string;
          subtotal: number;
          total: number;
          createdAt: string;
          items: Array<{
            id: string;
            productId: string;
            quantity: number;
            unitPrice: number;
            total: number;
            product: { name: string };
          }>;
        }>
      >('/sales'),
    create: (payload: {
      customerName: string;
      paymentMethod: string;
      subtotal: number;
      total: number;
      discount?: number;
      notes?: string;
      items: Array<{ productId: string; quantity: number; unitPrice: number; total: number }>;
    }) =>
      request<{
        id: string;
        customerName: string;
        paymentMethod: string;
        subtotal: number;
        total: number;
        createdAt: string;
      }>('/sales', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    remove: (id: string) => request<{ id: string }>(`/sales/${id}`, {
      method: 'DELETE',
    }),
  },
  stockMovements: {
    list: () =>
      request<
        Array<{
          id: string;
          type: 'ENTRY' | 'EXIT';
          quantity: number;
          createdAt: string;
          product: { id: string; name: string; sku: string };
        }>
      >('/stock-movements'),
    create: (payload: { productId: string; type: 'ENTRY' | 'EXIT'; quantity: number }) =>
      request<{
        id: string;
        type: 'ENTRY' | 'EXIT';
        quantity: number;
        createdAt: string;
        product: { id: string; name: string; sku: string };
      }>('/stock-movements', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
  clients: {
    list: () => request<Array<{ id: string; name: string; slug: string }>>('/clients'),
  },
  transactions: {
    list: () =>
      request<
        Array<{
          id: string;
          type: string;
          category: string;
          description: string;
          amount: number;
          date: string;
        }>
      >('/transactions'),
    create: (payload: {
      type: string;
      category: string;
      description: string;
      amount: number;
      date?: string;
    }) =>
      request<{
        id: string;
        type: string;
        category: string;
        description: string;
        amount: number;
        date: string;
      }>('/transactions', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
};
