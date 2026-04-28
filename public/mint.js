document.addEventListener("DOMContentLoaded", () => {
  const mintBtn = document.getElementById("mintBtn");

  if (!mintBtn) {
    console.error("Tombol mint tidak ditemukan!");
    return;
  }

  mintBtn.addEventListener("click", async () => {
    try {
      mintBtn.innerText = "Minting...";
      mintBtn.disabled = true;

      // ✅ PENTING: pakai port 3001 (canopy-server)
      const res = await fetch("http://localhost:3001/api/mint-nft", {
        method: "POST",
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Mint failed");
      }

      alert("NFT berhasil di-mint 🚀 Token ID: " + data.tokenId);
      console.log(data.output);

    } catch (err) {
      console.error(err);
      alert("Mint gagal: " + err.message);
    } finally {
      mintBtn.innerText = "Minting Now";
      mintBtn.disabled = false;
    }
  });
});