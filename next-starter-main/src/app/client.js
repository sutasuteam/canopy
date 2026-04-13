"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const thirdweb_1 = require("thirdweb");
// Replace this with your client ID string
// refer to https://portal.thirdweb.com/typescript/v5/client on how to get a client ID
const clientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;
if (!clientId) {
    throw new Error("No client ID provided");
}
exports.client = (0, thirdweb_1.createThirdwebClient)({
    clientId: clientId,
});
//# sourceMappingURL=client.js.map