(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__69e1d62e._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/frontend/src/config/index.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BASE_URL",
    ()=>BASE_URL,
    "ENV_IS_PROD",
    ()=>ENV_IS_PROD,
    "LOCAL_STORAGE_APP_KEY",
    ()=>LOCAL_STORAGE_APP_KEY
]);
const LOCAL_STORAGE_APP_KEY = "TEMP_KEY_LOCAL_HARD_TO_GUESS";
const ENV_IS_PROD = process.env.NEXT_PUBLIC_IS_PROD == "1";
const BASE_URL = ENV_IS_PROD ? "/api" : "http://localhost:4000/api";
}),
"[project]/frontend/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$config$2f$index$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/config/index.ts [middleware-edge] (ecmascript)");
;
;
const PROTECTED_ROUTES = [
    "/dashboard",
    "/profile"
];
const ADMIN_ROUTES = [
    "/admin"
];
const PUBLIC_ROUTES = [
    "/login",
    "/register"
];
function isAuthenticated(request) {
    const cookie = request.cookies.get(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$config$2f$index$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LOCAL_STORAGE_APP_KEY"]);
    if (!cookie) return false;
    try {
        const userData = JSON.parse(cookie.value);
        return !!(userData && userData.token);
    } catch  {
        return false;
    }
}
function isAdmin(request) {
    const cookie = request.cookies.get(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$config$2f$index$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LOCAL_STORAGE_APP_KEY"]);
    if (!cookie) return false;
    try {
        const userData = JSON.parse(cookie.value);
        return userData?.role === "ADMIN" || userData?.role === "SUPER_ADMIN";
    } catch  {
        return false;
    }
}
function middleware(request) {
    const pathname = request.nextUrl.pathname;
    const userIsAuthenticated = isAuthenticated(request);
    const userIsAdmin = isAdmin(request);
    const isProtectedRoute = PROTECTED_ROUTES.some((route)=>pathname.startsWith(route));
    const isAdminRoute = ADMIN_ROUTES.some((route)=>pathname.startsWith(route));
    const isPublicRoute = PUBLIC_ROUTES.some((route)=>pathname === route || pathname.startsWith(route));
    // Redirect authenticated users away from public routes
    if (isPublicRoute && userIsAuthenticated) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL("/dashboard", request.url));
    }
    // Protect admin routes
    if (isAdminRoute) {
        if (!userIsAuthenticated) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL("/login", request.url));
        }
        if (!userIsAdmin) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL("/dashboard", request.url));
        }
    }
    // Protect regular protected routes
    if (isProtectedRoute && !userIsAuthenticated) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL("/login", request.url));
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__69e1d62e._.js.map