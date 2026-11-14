const STORAGE_KEY = "sonechkinsStoriesDataV1";
const demoEvents = [
  "Сим внезапно влюбится",
  "Неожиданное пополнение в семье",
  "Серьёзная ссора с близким человеком",
  "Сим найдёт новое хобби",
  "Неожиданный переезд",
  "Потеря работы",
  "Сим встретит нового друга",
  "Большая покупка",
  "Секрет, который изменит всё",
  "Неожиданное наследство",
  "Сим решит начать жизнь с чистого листа",
  "Семью ждёт важное совместное решение"
];

const ageLabels = {
  infant: "Младенец", toddler: "Тоддлер", child: "Ребёнок",
  teen: "Подросток", young: "Молодой", adult: "Взрослый", elder: "Пожилой"
};

// Каждая связь задаётся один раз: обратное название сайт показывает автоматически.
const relationshipTypes = {
  mother: { label: "мать", reverse: "дочь / сын" },
  father: { label: "отец", reverse: "дочь / сын" },
  daughter: { label: "дочь", reverse: "мать / отец" },
  son: { label: "сын", reverse: "мать / отец" },
  stepmother: { label: "мачеха", reverse: "падчерица / пасынок" },
  stepfather: { label: "отчим", reverse: "падчерица / пасынок" },
  stepdaughter: { label: "падчерица", reverse: "мачеха / отчим" },
  stepson: { label: "пасынок", reverse: "мачеха / отчим" },
  sister: { label: "сестра", reverse: "сестра / брат" },
  brother: { label: "брат", reverse: "сестра / брат" },
  grandmother: { label: "бабушка", reverse: "внучка / внук" },
  grandfather: { label: "дедушка", reverse: "внучка / внук" },
  granddaughter: { label: "внучка", reverse: "бабушка / дедушка" },
  grandson: { label: "внук", reverse: "бабушка / дедушка" },
  wife: { label: "жена", reverse: "муж / жена" },
  husband: { label: "муж", reverse: "жена / муж" },
  aunt: { label: "тётя", reverse: "племянница / племянник" },
  uncle: { label: "дядя", reverse: "племянница / племянник" },
  niece: { label: "племянница", reverse: "тётя / дядя" },
  nephew: { label: "племянник", reverse: "тётя / дядя" },
  adoptiveMother: { label: "приёмная мать", reverse: "приёмная дочь / сын" },
  adoptiveFather: { label: "приёмный отец", reverse: "приёмная дочь / сын" },
  adoptedDaughter: { label: "приёмная дочь", reverse: "приёмная мать / отец" },
  adoptedSon: { label: "приёмный сын", reverse: "приёмная мать / отец" }
};

let data = loadData();
let currentFamilyId = data.families[0]?.id || null;
let rotation = 0;
let spinning = false;
let history = JSON.parse(localStorage.getItem("fateHistory") || "[]");

function uid() { return "id-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function loadData() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"families":[]}');
    if (Array.isArray(parsed.families)) return parsed;
  } catch (e) {}
  return { families: [] };
}
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function currentFamily() { return data.families.find(f => f.id === currentFamilyId) || null; }
function simName(family, sim) { return `${sim.firstName} ${family.surname}`.trim(); }
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));
}
function renderAll() {
  renderFamilyList();
  renderFamilyDetails();
  renderWheelFamilySelect();
}
function renderFamilyList() {
  const list = document.getElementById("family-list");
  list.innerHTML = "";
  document.getElementById("family-count").textContent = `${data.families.length} / 5`;
  data.families.forEach(family => {
    const button = document.createElement("button");
    button.className = "family-choice" + (family.id === currentFamilyId ? " active" : "");
    button.innerHTML = `<strong>${escapeHtml(family.name)}</strong><small>${escapeHtml(family.surname)} · ${family.sims.length} персонаж(а/ей)</small>`;
    button.onclick = () => { currentFamilyId = family.id; renderAll(); };
    list.appendChild(button);
  });
  document.getElementById("add-family-button").disabled = data.families.length >= 5;
  document.getElementById("add-family-button").textContent = data.families.length >= 5 ? "Достигнут лимит семей" : "＋ Добавить семью";
}
function renderFamilyDetails() {
  const family = currentFamily();
  document.getElementById("family-empty").classList.toggle("hidden", !!family);
  document.getElementById("family-details").classList.toggle("hidden", !family);
  if (!family) return;
  document.getElementById("family-title").textContent = family.name;
  document.getElementById("family-subtitle").textContent = `Фамилия: ${family.surname}`;
  const simList = document.getElementById("sim-list");
  simList.innerHTML = "";
  if (!family.sims.length) simList.innerHTML = '<p class="empty-inline">Пока нет персонажей. Добавь первого сима.</p>';
  family.sims.forEach(sim => {
    const card = document.createElement("div");
    card.className = "sim-card";
    card.innerHTML = `<div><strong>${escapeHtml(sim.firstName)} ${escapeHtml(family.surname)}</strong><small>${ageLabels[sim.age] || sim.age}</small></div><div class="sim-actions"><button class="mini-button" onclick="editSim('${sim.id}')">Изменить</button><button class="mini-button" onclick="deleteSim('${sim.id}')">Удалить</button></div>`;
    simList.appendChild(card);
  });
  const relList = document.getElementById("relationship-list");
  relList.innerHTML = "";
  if (!family.relationships.length) relList.innerHTML = '<p class="empty-inline">Связи пока не добавлены.</p>';
  family.relationships.forEach(rel => {
    const a = family.sims.find(s => s.id === rel.from);
    const b = family.sims.find(s => s.id === rel.to);
    if (!a || !b) return;
    const type = relationshipTypes[rel.type];
    const card = document.createElement("div");
    card.className = "relation-card";
    card.innerHTML = `<div><strong>${escapeHtml(a.firstName)} — ${escapeHtml(type.label)} ${escapeHtml(b.firstName)}</strong><small>Обратная связь: ${escapeHtml(b.firstName)} — ${escapeHtml(type.reverse)} ${escapeHtml(a.firstName)}</small></div><button class="mini-button" onclick="deleteRelationship('${rel.id}')">Удалить</button>`;
    relList.appendChild(card);
  });
}
function renderWheelFamilySelect() {
  const select = document.getElementById("active-family");
  const previous = select.value || currentFamilyId || "";
  select.innerHTML = "";
  if (!data.families.length) {
    select.innerHTML = '<option value="">Сначала добавь семью</option>';
    select.disabled = true;
  } else {
    select.disabled = false;
    data.families.forEach(f => {
      const option = document.createElement("option");
      option.value = f.id; option.textContent = f.name;
      select.appendChild(option);
    });
    select.value = data.families.some(f => f.id === previous) ? previous : data.families[0].id;
  }
  updateSpecificSims();
}
document.getElementById("active-family").addEventListener("change", updateSpecificSims);
document.getElementById("target-mode").addEventListener("change", () => {
  document.getElementById("specific-sim-wrap").classList.toggle("hidden", document.getElementById("target-mode").value !== "specific");
  updateSpecificSims();
});
function updateSpecificSims() {
  const family = data.families.find(f => f.id === document.getElementById("active-family").value);
  const select = document.getElementById("specific-sim");
  select.innerHTML = "";
  (family?.sims || []).forEach(sim => {
    const option = document.createElement("option");
    option.value = sim.id; option.textContent = simName(family, sim);
    select.appendChild(option);
  });
  document.getElementById("spin-button").disabled = !family || !family.sims.length;
}
function openModal(title, html) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-content").innerHTML = html;
  document.getElementById("modal").classList.remove("hidden");
}
function closeModal() { document.getElementById("modal").classList.add("hidden"); }
function openFamilyForm(edit = false) {
  const family = edit ? currentFamily() : null;
  if (!edit && data.families.length >= 5) return;
  openModal(edit ? "Изменить семью" : "Новая семья", `
    <form class="modal-form" onsubmit="saveFamily(event, ${edit ? `'${family.id}'` : "null"})">
      <div><label>Название семьи</label><input name="name" maxlength="50" required placeholder="Например, Семья Харрингтон" value="${escapeHtml(family?.name || "")}"></div>
      <div><label>Фамилия персонажей</label><input name="surname" maxlength="40" required placeholder="Например, Харрингтон" value="${escapeHtml(family?.surname || "")}"></div>
      <p class="form-error" id="form-error"></p>
      <div class="form-actions"><button class="hero-button" type="submit">Сохранить</button><button class="cancel-button" type="button" onclick="closeModal()">Отмена</button></div>
    </form>`);
}
function saveFamily(event, id) {
  event.preventDefault();
  const form = event.target;
  const name = form.name.value.trim(), surname = form.surname.value.trim();
  if (!name || !surname) return;
  if (id) {
    const family = data.families.find(f => f.id === id);
    family.name = name; family.surname = surname;
  } else {
    const family = { id: uid(), name, surname, sims: [], relationships: [] };
    data.families.push(family); currentFamilyId = family.id;
  }
  saveData(); closeModal(); renderAll();
}
function openSimForm(sim = null) {
  const family = currentFamily();
  if (!family) return;
  openModal(sim ? "Изменить персонажа" : "Новый персонаж", `
    <form class="modal-form" onsubmit="saveSim(event, ${sim ? `'${sim.id}'` : "null"})">
      <div><label>Имя персонажа</label><input name="firstName" maxlength="30" required placeholder="Например, Эмили" value="${escapeHtml(sim?.firstName || "")}"></div>
      <div><label>Возраст</label><select name="age" required>
        ${Object.entries(ageLabels).map(([key,label]) => `<option value="${key}" ${sim?.age === key ? "selected" : ""}>${label}</option>`).join("")}
      </select></div>
      <p class="muted">Фамилия будет автоматически браться из настроек семьи: ${escapeHtml(family.surname)}.</p>
      <div class="form-actions"><button class="hero-button" type="submit">Сохранить</button><button class="cancel-button" type="button" onclick="closeModal()">Отмена</button></div>
    </form>`);
}
function saveSim(event, id) {
  event.preventDefault();
  const family = currentFamily(), form = event.target;
  const sim = { firstName: form.firstName.value.trim(), age: form.age.value };
  if (!sim.firstName) return;
  if (id) Object.assign(family.sims.find(s => s.id === id), sim);
  else family.sims.push({ id: uid(), ...sim });
  saveData(); closeModal(); renderAll();
}
function editSim(id) { const sim = currentFamily()?.sims.find(s => s.id === id); if (sim) openSimForm(sim); }
function deleteSim(id) {
  const family = currentFamily(); if (!family) return;
  const sim = family.sims.find(s => s.id === id);
  if (!confirm(`Удалить персонажа ${sim?.firstName || ""}? Его родственные связи тоже будут удалены.`)) return;
  family.sims = family.sims.filter(s => s.id !== id);
  family.relationships = family.relationships.filter(r => r.from !== id && r.to !== id);
  saveData(); renderAll();
}
function deleteCurrentFamily() {
  const family = currentFamily(); if (!family) return;
  if (!confirm(`Удалить «${family.name}» и всех её персонажей?`)) return;
  data.families = data.families.filter(f => f.id !== family.id);
  currentFamilyId = data.families[0]?.id || null;
  saveData(); renderAll();
}
function openRelationshipForm() {
  const family = currentFamily();
  if (!family || family.sims.length < 2) { alert("Сначала добавь в семью хотя бы двух персонажей."); return; }
  const options = family.sims.map(s => `<option value="${s.id}">${escapeHtml(s.firstName)}</option>`).join("");
  const relOptions = Object.entries(relationshipTypes).map(([key, value]) => `<option value="${key}">${value.label}</option>`).join("");
  openModal("Родственная связь", `
    <form class="modal-form" onsubmit="saveRelationship(event)">
      <div><label>Первый персонаж</label><select name="from">${options}</select></div>
      <div><label>Кем он приходится второму?</label><select name="type">${relOptions}</select></div>
      <div><label>Второй персонаж</label><select name="to">${options}</select></div>
      <p class="muted">Обратная связь появится автоматически. Например: Анна — мать Эмили, а Эмили — дочь Анны.</p>
      <p class="form-error" id="form-error"></p>
      <div class="form-actions"><button class="hero-button" type="submit">Сохранить связь</button><button class="cancel-button" type="button" onclick="closeModal()">Отмена</button></div>
    </form>`);
}
function saveRelationship(event) {
  event.preventDefault();
  const family = currentFamily(), form = event.target;
  const from = form.from.value, to = form.to.value, type = form.type.value;
  if (from === to) { document.getElementById("form-error").textContent = "Нельзя указать связь персонажа с самим собой."; return; }
  if (family.relationships.some(r => r.from === from && r.to === to)) {
    document.getElementById("form-error").textContent = "Связь между этими персонажами уже добавлена. Удали старую, если хочешь её изменить."; return;
  }
  family.relationships.push({ id: uid(), from, to, type });
  saveData(); closeModal(); renderAll();
}
function deleteRelationship(id) {
  const family = currentFamily();
  family.relationships = family.relationships.filter(r => r.id !== id);
  saveData(); renderAll();
}
function renderHistory() {
  const container = document.getElementById("wheel-history");
  container.innerHTML = "";
  if (!history.length) {
    container.innerHTML = '<p class="empty-history">Здесь пока тихо... Время сделать первый поворот судьбы!</p>';
    return;
  }
  history.forEach((item, index) => {
    const entry = document.createElement("div"); entry.className = "history-entry";
    const title = document.createElement("strong");
    title.textContent = `#${history.length - index}. ${item.target ? item.target + ": " : ""}${item.event}`;
    const date = document.createElement("small"); date.textContent = item.date;
    entry.append(title, date); container.appendChild(entry);
  });
}
function spinWheel() {
  if (spinning) return;
  const family = data.families.find(f => f.id === document.getElementById("active-family").value);
  if (!family || !family.sims.length) { alert("Добавь персонажей в выбранную семью, чтобы крутить колесо."); return; }
  const mode = document.getElementById("target-mode").value;
  let target = "Вся семья";
  if (mode === "random") {
    const sim = family.sims[Math.floor(Math.random() * family.sims.length)];
    target = simName(family, sim);
  } else if (mode === "specific") {
    const sim = family.sims.find(s => s.id === document.getElementById("specific-sim").value);
    if (!sim) { alert("Выбери персонажа."); return; }
    target = simName(family, sim);
  }
  const wheel = document.querySelector(".wheel-icon");
  const resultElement = document.getElementById("wheel-result");
  const button = document.getElementById("spin-button");
  const result = demoEvents[Math.floor(Math.random() * demoEvents.length)];
  spinning = true; button.disabled = true;
  rotation += 1440 + Math.floor(Math.random() * 360);
  wheel.style.transform = `rotate(${rotation}deg)`;
  resultElement.textContent = "✨ Судьба выбирает...";
  setTimeout(() => {
    resultElement.textContent = `✨ ${target}: ${result}`;
    history.unshift({ event: result, target, date: new Date().toLocaleString("ru-RU") });
    localStorage.setItem("fateHistory", JSON.stringify(history));
    renderHistory(); spinning = false; button.disabled = false;
  }, 4000);
}
function clearHistory() {
  if (!confirm("Очистить дневник судьбы?")) return;
  history = []; localStorage.removeItem("fateHistory"); renderHistory();
}

renderAll();
renderHistory();
