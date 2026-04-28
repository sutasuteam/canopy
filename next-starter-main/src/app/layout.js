"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
const jsx_runtime_1 = require("react/jsx-runtime");
const google_1 = require("next/font/google");
require("./globals.css");
const react_1 = require("thirdweb/react");
const inter = (0, google_1.Inter)({ subsets: ["latin"] });
exports.metadata = {
    title: "thirdweb SDK + Next starter",
    description: "Starter template for using thirdweb SDK with Next.js App router",
};
function RootLayout({ children, }) {
    return ((0, jsx_runtime_1.jsx)("html", { lang: "en", children: (0, jsx_runtime_1.jsx)("body", { className: inter.className, children: (0, jsx_runtime_1.jsx)(react_1.ThirdwebProvider, { children: children }) }) }));
}
//# sourceMappingURL=layout.js.map