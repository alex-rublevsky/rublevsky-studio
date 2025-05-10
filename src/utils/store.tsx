export type User = {
  id: number;
  name: string;
  email: string;
};

export const DEPLOY_URL =
  process.env.NODE_ENV === "production"
    ? "https://tanstack.rublevsky.studio"
    : "http://localhost:8787";
