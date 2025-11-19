
export const API_URL =
    (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
    (typeof process !== "undefined" && process.env && (process.env.REACT_APP_API_URL || process.env.API_URL)) ||
    "http://localhost:3034";