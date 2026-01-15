// Cookie name for session storage
export const COOKIE_NAME = "casey_portfolio_session";

// Session duration
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

// HTTP timeout
export const AXIOS_TIMEOUT_MS = 30_000;

// Error messages (must match server/trpc.ts)
export const UNAUTHED_ERR_MSG = "Please login to continue";
export const NOT_ADMIN_ERR_MSG = "You do not have admin permission";
