"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Home;
const jsx_runtime_1 = require("react/jsx-runtime");
const thirdweb_svg_1 = __importDefault(require("@public/thirdweb.svg"));
const image_1 = __importDefault(require("next/image"));
const react_1 = require("thirdweb/react");
const client_1 = require("./client");
function Home() {
    return ((0, jsx_runtime_1.jsx)("main", { className: "p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto", children: (0, jsx_runtime_1.jsxs)("div", { className: "py-20", children: [(0, jsx_runtime_1.jsx)(Header, {}), (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center mb-20", children: (0, jsx_runtime_1.jsx)(react_1.ConnectButton, { client: client_1.client, appMetadata: {
                            name: "Example App",
                            url: "https://example.com",
                        } }) }), (0, jsx_runtime_1.jsx)(ThirdwebResources, {})] }) }));
}
function Header() {
    return ((0, jsx_runtime_1.jsxs)("header", { className: "flex flex-col items-center mb-20 md:mb-20", children: [(0, jsx_runtime_1.jsx)(image_1.default, { src: thirdweb_svg_1.default, alt: "", className: "size-[150px] md:size-[150px]", style: {
                    filter: "drop-shadow(0px 0px 24px #a726a9a8)",
                } }), (0, jsx_runtime_1.jsxs)("h1", { className: "text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-6 text-zinc-100", children: ["thirdweb SDK", (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-300 inline-block mx-1", children: " + " }), (0, jsx_runtime_1.jsx)("span", { className: "inline-block -skew-x-6 text-blue-500", children: " Next.js " })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-zinc-300 text-base", children: ["Read the", " ", (0, jsx_runtime_1.jsx)("code", { className: "bg-zinc-800 text-zinc-300 px-2 rounded py-1 text-sm mx-1", children: "README.md" }), " ", "file to get started."] })] }));
}
function ThirdwebResources() {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "grid gap-4 lg:grid-cols-3 justify-center", children: [(0, jsx_runtime_1.jsx)(ArticleCard, { title: "thirdweb SDK Docs", href: "https://portal.thirdweb.com/typescript/v5", description: "thirdweb TypeScript SDK documentation" }), (0, jsx_runtime_1.jsx)(ArticleCard, { title: "Components and Hooks", href: "https://portal.thirdweb.com/typescript/v5/react", description: "Learn about the thirdweb React components and hooks in thirdweb SDK" }), (0, jsx_runtime_1.jsx)(ArticleCard, { title: "thirdweb Dashboard", href: "https://thirdweb.com/dashboard", description: "Deploy, configure, and manage your smart contracts from the dashboard." })] }));
}
function ArticleCard(props) {
    return ((0, jsx_runtime_1.jsx)("a", { href: props.href + "?utm_source=next-template", target: "_blank", className: "flex flex-col border border-zinc-800 p-4 rounded-lg hover:bg-zinc-900 transition-colors hover:border-zinc-700", children: (0, jsx_runtime_1.jsxs)("article", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-semibold mb-2", children: props.title }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-zinc-400", children: props.description })] }) }));
}
//# sourceMappingURL=page.js.map