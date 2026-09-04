/* ════════════════════════════════════════════════════════
   COGNITIVE ANIMAL — render script
   data.js の中身を、このページの各 id の場所に流し込む。
   ページ側の <body data-animal="tako"> がどの動物かを教える。
════════════════════════════════════════════════════════ */

function getLang() {
  return localStorage.getItem("cogAnimalLang") || "jp";
}

function setLang(lang) {
  localStorage.setItem("cogAnimalLang", lang);
  renderResultPage();
}

function fillText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || "";
}

function fillBullets(id, items) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = "";
  (items || []).forEach(function (text) {
    const li = document.createElement("li");
    li.textContent = text;
    el.appendChild(li);
  });
}

function renderResultPage() {
  const slug = document.body.dataset.animal;
  const lang = getLang();
  const d = ANIMALS[slug][lang];

  document.documentElement.lang = lang === "en" ? "en" : "ja";

  fillText("animal-name-jp", ANIMALS[slug].jp.animal_name);
  fillText("axis-label", d.vak_label.replace("優位タイプ", "") + "×" + d.eawp_label.replace("優位タイプ", ""));
  fillText("catchphrase-en", ANIMALS[slug].en.catchphrase);
  fillText("catchphrase", d.catchphrase);
  fillText("lede", d.lede);
  fillText("narrative-opening", d.narrative_opening);
  fillText("survival-label", d.survival_label);
  fillText("narrative-survival", d.narrative_survival);
  fillText("narrative-bridge", d.narrative_bridge);
  fillText("narrative-closing", d.narrative_closing);

  fillText("brain-heading", (ANIMALS[slug].jp.animal_name || "") + "型の脳の世界の感じ方");
  fillText("vak-label", d.vak_label);
  fillBullets("vak-bullets", d.vak_bullets);
  fillText("vak-description", d.vak_description);
  fillText("eawp-label", d.eawp_label);
  fillBullets("eawp-bullets", d.eawp_bullets);
  fillText("eawp-description", d.eawp_description);

  fillBullets("pitfall-bullets", d.pitfall_bullets);
  fillText("pitfall-description", d.pitfall_description);

  fillText("strategy-heading", (ANIMALS[slug].jp.animal_name || "") + "型の生存戦略");
  fillText("strategy-title-vak", d.strategy_title_vak);
  fillText("strategy-body-vak", d.strategy_body_vak);
  fillText("strategy-title-eawp", d.strategy_title_eawp);
  fillText("strategy-strength", d.strategy_strength);
  fillText("strategy-scenarios", d.strategy_scenarios);
  fillText("strategy-questions", d.strategy_questions);
  fillText("strategy-resolution", d.strategy_resolution);

  renderAnimalIndex(slug);
  updateLangToggle(lang);
}

function renderAnimalIndex(currentSlug) {
  const el = document.getElementById("animal-index");
  if (!el) return;
  el.innerHTML = "";
  ANIMAL_ORDER.forEach(function (slug) {
    const a = document.createElement("a");
    a.href = slug + ".html";
    a.textContent = ANIMALS[slug].jp.animal_name;
    if (slug === currentSlug) a.setAttribute("aria-current", "true");
    el.appendChild(a);
  });
}

function updateLangToggle(lang) {
  const jpBtn = document.getElementById("lang-jp");
  const enBtn = document.getElementById("lang-en");
  if (jpBtn) jpBtn.setAttribute("aria-current", String(lang === "jp"));
  if (enBtn) enBtn.setAttribute("aria-current", String(lang === "en"));
}

document.addEventListener("DOMContentLoaded", renderResultPage);
