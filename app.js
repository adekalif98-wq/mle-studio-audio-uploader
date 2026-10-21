const form = document.querySelector("#uploadForm");
const audio = document.querySelector("#audio");
const fileLabel = document.querySelector("#fileLabel");
const result = document.querySelector("#result");
const submitBtn = document.querySelector("#submitBtn");

audio.addEventListener("change", () => {
  const file = audio.files?.[0];
  fileLabel.textContent = file ? `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)` : "Pilih file audio";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  result.hidden = true;
  result.className = "result";
  if (!document.querySelector("#rightsConfirmed").checked) {
    showError("Centang konfirmasi hak atau izin penggunaan audio terlebih dahulu.");
    return;
  }
  const file = audio.files?.[0];
  if (!file) return showError("Pilih file audio.");
  if (file.size > 20 * 1024 * 1024) return showError("Ukuran file maksimal 20 MB.");

  const body = new FormData();
  body.append("title", form.title.value);
  body.append("artist", form.artist.value);
  body.append("ownerId", form.ownerId.value);
  body.append("sourceUrl", form.sourceUrl.value);
  body.append("rightsConfirmed", "true");
  body.append("audio", file);

  submitBtn.disabled = true;
  submitBtn.querySelector("span").textContent = "MEMPROSES...";
  try {
    const response = await fetch("/api/upload", { method: "POST", body });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Upload gagal.");
    result.hidden = false;
    result.innerHTML = `<strong>✓ File diterima</strong><br>${escapeHtml(data.message)}<br><br><strong>Judul:</strong> ${escapeHtml(data.title)}<br><strong>Creator ID:</strong> ${escapeHtml(data.ownerId)}<br><strong>Ukuran:</strong> ${(data.fileSize / 1024 / 1024).toFixed(2)} MB<br><strong>Status:</strong> ${escapeHtml(data.status)}`;
  } catch (err) {
    showError(err.message || "Tidak dapat terhubung ke server.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector("span").textContent = "UPLOAD / VALIDATE";
  }
});

function showError(message) {
  result.hidden = false;
  result.className = "result error";
  result.textContent = message;
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

fetch("/api/status").catch(() => {});
