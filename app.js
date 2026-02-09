const form = document.getElementById("preference-form");
const resultList = document.getElementById("result-list");
const resultNote = document.getElementById("result-note");

const fallbackPerfumes = Array.isArray(window.PERFUMES) ? window.PERFUMES : [];

const fetchPerfumes = async () => {
  try {
    const response = await fetch("data/parfumes.json");
    if (!response.ok) {
      throw new Error("Gagal memuat data parfum");
    }
    return response.json();
  } catch (error) {
    if (fallbackPerfumes.length > 0) {
      return fallbackPerfumes;
    }
    throw error;
  }
};

const parseBudget = (value) => {
  const [min, max] = value.split("-").map(Number);
  return { min, max };
};

const scorePerfume = (perfume, preferences) => {
  let score = 0;

  if (perfume.aroma.includes(preferences.aroma)) {
    score += 3;
  }

  if (perfume.intensity === preferences.intensity) {
    score += 2;
  }

  if (perfume.occasion.includes(preferences.occasion)) {
    score += 2;
  }

  if (perfume.gender === preferences.gender) {
    score += 2;
  }

  if (perfume.gender === "unisex") {
    score += 1;
  }

  return score;
};

const renderResults = (results) => {
  resultList.innerHTML = "";

  if (results.length === 0) {
    resultList.innerHTML = "<p>Tidak ada parfum yang cocok. Coba kriteria lain.</p>";
    return;
  }

  results.forEach((perfume) => {
    const item = document.createElement("article");
    item.className = "result-item";
    item.innerHTML = `
      <h3>${perfume.name}</h3>
      <p>${perfume.brand} · Rp ${perfume.price.toLocaleString("id-ID")}</p>
      <div class="badges">
        ${perfume.aroma.map((note) => `<span class="badge">${note}</span>`).join("")}
        <span class="badge">${perfume.intensity}</span>
        <span class="badge">${perfume.longevity}</span>
      </div>
      <p>Cocok untuk: ${perfume.occasion.join(", ")} · ${perfume.gender}</p>
      <a href="${perfume.affiliate}" target="_blank" rel="noopener noreferrer">
        Beli dengan link affiliate
      </a>
    `;
    resultList.appendChild(item);
  });
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  resultNote.textContent = "Mengolah rekomendasi AI...";

  try {
    const data = await fetchPerfumes();
    const formData = new FormData(form);
    const preferences = {
      budget: formData.get("budget"),
      aroma: formData.get("aroma"),
      intensity: formData.get("intensity"),
      occasion: formData.get("occasion"),
      gender: formData.get("gender")
    };

    const { min, max } = parseBudget(preferences.budget);

    const scored = data
      .filter((perfume) => perfume.price >= min && perfume.price <= max)
      .map((perfume) => ({
        ...perfume,
        score: scorePerfume(perfume, preferences)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    resultNote.textContent = "Berikut rekomendasi terbaik untukmu.";
    renderResults(scored);
  } catch (error) {
    resultNote.textContent =
      "Terjadi kesalahan saat memuat data. Jalankan lewat server lokal (python -m http.server).";
    resultList.innerHTML = "";
    console.error(error);
  }
});
