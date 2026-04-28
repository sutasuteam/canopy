import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function connectWallet(): Promise<string | null> {
  if (!window.ethereum) {
    alert("MetaMask tidak terdeteksi!");
    return null;
  }

  try {
    const accounts: string[] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const account = accounts[0];

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    console.log("Connected:", account);

    return account;
  } catch (error) {
    console.error("Gagal connect wallet:", error);
    return null;
  }
}