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

  const requestedAromas = [preferences.aroma, preferences.aromaSecondary].filter(Boolean);
  const aromaMatches = requestedAromas.filter((note) => perfume.aroma.includes(note)).length;

  if (requestedAromas.length === 2) {
    score += aromaMatches === 2 ? 30 : aromaMatches === 1 ? 15 : 0;
  } else if (requestedAromas.length === 1) {
    score += aromaMatches === 1 ? 30 : 0;
  }

  if (perfume.occasion.includes(preferences.occasion)) {
    score += 25;
  } else if (perfume.occasion.includes("all")) {
    score += 18;
  }

  if (perfume.weather.includes(preferences.weather)) {
    score += 15;
  } else if (perfume.weather.includes("all")) {
    score += 10;
  }

  if (perfume.gender === preferences.gender) {
    score += 10;
  } else if (perfume.gender === "unisex") {
    score += 7;
  }

  if (perfume.intensity === preferences.intensity) {
    score += 10;
  }

  const budgetCenter = (preferences.budget.min + preferences.budget.max) / 2;
  const budgetDiff = Math.abs(perfume.price - budgetCenter) / budgetCenter;

  if (budgetDiff <= 0.1) {
    score += 10;
  } else if (budgetDiff <= 0.2) {
    score += 6;
  } else if (budgetDiff <= 0.3) {
    score += 3;
  }

  return score;
};

const renderResults = (results) => {
  resultList.innerHTML = "";

  if (results.length === 0) {
    resultList.innerHTML =
      "<p>Kami tidak dapat menemukan parfum yang cocok dengan kriteria anda</p>";
    return;
  }

  results.forEach((perfume) => {
    const item = document.createElement("article");
    item.className = "result-item";
    item.innerHTML = `
      <div class="result-media">
        <img src="${perfume.image}" alt="${perfume.name}" loading="lazy" />
      </div>
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
    const budgetRange = parseBudget(formData.get("budget"));
    const preferences = {
      budget: budgetRange,
      aroma: formData.get("aroma"),
      aromaSecondary: formData.get("aromaSecondary"),
      intensity: formData.get("intensity"),
      occasion: formData.get("occasion"),
      weather: formData.get("weather"),
      gender: formData.get("gender")
    };

    const scored = data
      .map((perfume) => ({
        ...perfume,
        score: scorePerfume(perfume, preferences)
      }))
      .sort((a, b) => b.score - a.score)
      .filter((perfume) => perfume.score > 65)
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