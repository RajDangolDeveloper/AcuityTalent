export const LOCAL_STORAGE_APP_KEY = "TEMP_KEY_LOCAL_HARD_TO_GUESS";
export const ENV_IS_PROD = process.env.NEXT_PUBLIC_IS_PROD == "1";

export const BASE_URL = ENV_IS_PROD ? "/api" : "http://localhost:4000/api";
