console.log("mint.js jalan");

// 🔥 GLOBAL
const contractAddress = "0x6E3a7d26b094187a1b3aAEC36582a179Ebd6a4C7";

const abi = [
  {
    "inputs": [],
    "name": "mint",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

// 🔥 FUNCTION HARUS DI LUAR
async function switchToZenChain() {
  const chainId = "0x20D8";

  try {
    const currentChainId = await window.ethereum.request({
      method: "eth_chainId"
    });

    if (currentChainId === chainId) return;

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }]
    });

  } catch (switchError) {

    if (switchError.code === 4902 || switchError.code === -32603) {

      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: chainId,
          chainName: "ZenChain Testnet",
          rpcUrls: ["https://zenchain-testnet.api.onfinality.io/public"],
          nativeCurrency: {
            name: "ZTC",
            symbol: "ZTC",
            decimals: 18
          },
          blockExplorerUrls: ["https://zentrace.io"]
        }]
      });

    } else {
      throw switchError;
    }
  }
}

// 🔥 MAIN LOGIC
document.addEventListener("DOMContentLoaded", () => {

  const mintBtn = document.getElementById("mintBtn");

  if (!mintBtn) {
    console.error("Tombol mint tidak ditemukan!");
    return;
  }

  mintBtn.addEventListener("click", mint);

  async function mint() {
    try {
      console.log("MINT CLICKED 🔥");

      if (!window.ethereum) {
        alert("Install MetaMask dulu!");
        return;
      }

      // 🔥 SEKARANG SUDAH ADA
      await switchToZenChain();

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(contractAddress, abi, signer);

      mintBtn.innerText = "Minting...";
      mintBtn.disabled = true;

      const tx = await contract.mint({
        value: ethers.utils.parseEther("3")
      });

      await tx.wait();

      alert("NFT berhasil di-mint 🚀");

    } catch (err) {
      console.error("MINT ERROR:", err);
      alert(err.message);
    } finally {
      mintBtn.innerText = "Mint Now";
      mintBtn.disabled = false;
    }
  }

});