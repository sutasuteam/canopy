console.log("wallet.js jalan");

const connectBtn = document.getElementById("connectBtn");

let currentAccount = null;

// CLICK BUTTON
connectBtn.addEventListener("click", async () => {
  try {
    // ❌ kalau tidak ada MetaMask
    if (!window.ethereum) {
      alert("MetaMask tidak ditemukan!");
      return;
    }

    // 🔓 DISCONNECT (toggle)
    if (currentAccount) {
      currentAccount = null;
      connectBtn.innerText = "Connect Wallet";
      return;
    }

    // 🔌 CONNECT
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);

    const address = accounts[0];
    currentAccount = address;

    const shortAddress =
      address.slice(0, 6) + "..." + address.slice(-4);

    // 🔥 tampilkan di tombol
    connectBtn.innerHTML = "";
    connectBtn.textContent = shortAddress;

  } catch (err) {
    console.error("ERROR CONNECT:", err);
  }
});


// 🔄 AUTO DETECT kalau wallet berubah
if (window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts) => {
    if (accounts.length === 0) {
      currentAccount = null;
      connectBtn.innerText = "Connect Wallet";
    } else {
      const address = accounts[0];
      currentAccount = address;

      const shortAddress =
        address.slice(0, 6) + "..." + address.slice(-4);

      connectBtn.innerText = shortAddress;
    }
  });
}


// 📋 CLICK ADDRESS = COPY
connectBtn.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  if (currentAccount) {
    navigator.clipboard.writeText(currentAccount);
    alert("Address copied!");
  }
});