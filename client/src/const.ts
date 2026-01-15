export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Login URL - redirects to local admin login page (no external OAuth)
export const getLoginUrl = () => {
  return "/admin/login";
};
