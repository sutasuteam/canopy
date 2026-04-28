import { connectWallet } from "./utils/connectWallet";
window.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("connectBtn");
    const text = document.getElementById("walletAddress");
    if (!btn || !text) {
        console.error("Element tidak ditemukan");
        return;
    }
    btn.addEventListener("click", async () => {
        const address = await connectWallet();
        if (address) {
            text.textContent = address;
        }
    });
});
