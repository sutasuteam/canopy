import { ethers } from "ethers";

const connectBtn = document.getElementById("connectBtn") as HTMLButtonElement;
const walletText = document.getElementById("walletAddress") as HTMLParagraphElement;

connectBtn.addEventListener("click", async () => {
  if (!(window as any).ethereum) {
    alert("Silakan install MetaMask!");
    return;
  }

  try {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    

    await provider.send("eth_requestAccounts", []);

    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const shortAddress = address.slice(0, 6) + "..." + address.slice(-4);
walletText.innerText = `Connected: ${shortAddress}`;

    // tampilkan address
    //walletText.innerText = `Connected: ${address}`;

    // 🔥 sembunyikan tombol
    connectBtn.style.display = "none";

  } catch (err) {
    console.error(err);
    walletText.innerText = "Gagal connect wallet";
  }
  window.addEventListener("load", async () => {
    if ((window as any).ethereum) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.listAccounts();
  
      if (accounts.length > 0) {
        walletText.innerText = `Connected: ${accounts[0].address}`;
        connectBtn.style.display = "none";
      }
    }
    
  });
});