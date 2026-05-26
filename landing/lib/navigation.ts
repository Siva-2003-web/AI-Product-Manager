const DEFAULT_MAIN_APP_URL = "https://ai-product-manager-zyq3.onrender.com";

export function getMainAppUrl() {
  const configured = process.env.NEXT_PUBLIC_MAIN_APP_URL?.trim().replace(
    /\/$/,
    "",
  );

  if (typeof window !== "undefined" && window.location.port === "3001") {
    return "http://localhost:3000";
  }

  return configured || DEFAULT_MAIN_APP_URL;
}
