async function aiMint() {
  const mintBtn = document.getElementById("mintBtn");

  const nameEl = document.getElementById("aiNftName");
  const descEl = document.getElementById("aiNftDesc");
  const tokenEl = document.getElementById("aiNftToken");
  const imageEl = document.getElementById("aiNftImage");

  try {
    if (mintBtn) {
      mintBtn.disabled = true;
      mintBtn.innerText = "AI Minting...";
    }

    const res = await fetch("http://localhost:3001/api/ai-mint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: "anime samurai cyberpunk",
      }),
    });

    const data = await res.json();
    console.log("SERVER RESPONSE:", data);

    if (!res.ok || data.success === false) {
      throw new Error(
        typeof data.error === "string"
          ? data.error
          : JSON.stringify(data, null, 2)
      );
    }

    const ai = data.ai || {};
    const mint = data.mint || {};

    if (nameEl) nameEl.innerText = ai.name || "-";
    if (descEl) descEl.innerText = ai.description || "-";
    if (tokenEl) tokenEl.innerText = mint.tokenId || data.tokenId || "-";
    if (imageEl) if (imageEl) imageEl.src = "/images/inkarnasi.png";

    alert("NFT AI berhasil di-mint 🚀");
  } catch (err) {
    console.error("❌ MINT ERROR:", err);
    alert("Mint gagal:\n" + (err.message || JSON.stringify(err, null, 2)));
  } finally {
    if (mintBtn) {
      mintBtn.disabled = false;
      mintBtn.innerText = "Minting Now";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const mintBtn = document.getElementById("mintBtn");

  if (mintBtn) {
    mintBtn.addEventListener("click", aiMint);
  }
});