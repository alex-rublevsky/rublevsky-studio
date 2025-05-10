export type User = {
  id: number;
  name: string;
  email: string;
};

export const DEPLOY_URL = import.meta.env.DEV
  ? "http://localhost:8787/api/products"
  : "https://tanstack.rublevsky.studio/api/products";
