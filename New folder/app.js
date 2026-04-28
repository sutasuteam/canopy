const btn = document.getElementById("btn");
const inputField = document.getElementById("input");
const chatBox = document.getElementById("chatBox");

const apiKey = "ISI_API_KEY_KAMU";

btn.addEventListener("click", async function () {
  const input = inputField.value;

  // tampilkan user
  chatBox.innerHTML += `<div class="user">🧑: ${input}</div>`;

  // loading
  chatBox.innerHTML += `<div class="ai" id="loading">🤖: AI sedang berpikir...</div>`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: input }]
          }]
        })
      }
    );

    const data = await response.json();

    document.getElementById("loading").remove();

    const hasil =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    chatBox.innerHTML += `<div class="ai">🤖: ${hasil}</div>`;

    chatBox.scrollTop = chatBox.scrollHeight;

  } catch (err) {
    console.error(err);
    document.getElementById("loading").remove();
    chatBox.innerHTML += `<div class="ai">❌ Error</div>`;
  }
});