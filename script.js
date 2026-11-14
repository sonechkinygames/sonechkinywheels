
// Временные примеры категорий и событий. Позже их можно будет заменить
// полной базой событий через редактор и загрузку наборов.
const categories = [
  {
    name: "Финансы", icon: "💰", color: "#e8bfd0",
    events: [
      "Сим неожиданно получает крупную сумму денег. Можно потратить её на исполнение давней мечты.",
      "Сим теряет кошелёк. Все наличные симолеоны пропадают.",
      "Счета оказываются намного выше обычного. Придётся срочно экономить."
    ]
  },
  {
    name: "Отношения", icon: "💕", color: "#d9c5e8",
    events: [
      "Сим случайно встречает старую любовь. Искра между ними может вспыхнуть снова.",
      "Лучший друг признаётся в чувствах. Теперь дружба уже не будет прежней.",
      "Партнёр узнаёт неприятную тайну. Доверие придётся заслужить заново."
    ]
  },
  {
    name: "Карьера", icon: "💼", color: "#f1d7b5",
    events: [
      "Симу предлагают неожиданное повышение, но новая должность потребует больше времени.",
      "На работе происходит крупная ошибка. Сим должен исправить последствия.",
      "Сим понимает, что перерос свою работу, и задумывается о смене карьеры."
    ]
  },
  {
    name: "Семья", icon: "🏡", color: "#c7ded5",
    events: [
      "Родственник приезжает без предупреждения и планирует задержаться на несколько дней.",
      "Семейная ссора заставляет всех пересмотреть свои отношения.",
      "Сим узнаёт новость, которая может изменить жизнь всей семьи."
    ]
  },
  {
    name: "Здоровье", icon: "🌿", color: "#c9d9ed",
    events: [
      "Сим понимает, что давно не отдыхал. Следующие несколько дней нужно посвятить себе.",
      "Неудачный день выбивает сима из колеи. Придётся отменить планы и восстановить силы.",
      "Сим решает полностью изменить привычки и начать заботиться о себе."
    ]
  },
  {
    name: "Приключения", icon: "🧭", color: "#edc9b7",
    events: [
      "Сим получает приглашение в спонтанную поездку. Отказаться будет непросто.",
      "Во время прогулки сим находит загадочную вещь. Её история ещё неизвестна.",
      "Сим решает попробовать то, на что раньше никогда не осмеливался."
    ]
  },
  {
    name: "Неожиданности", icon: "✨", color: "#e8dcae",
    events: [
      "Сим случайно становится свидетелем странного происшествия. Теперь у него есть секрет.",
      "Сосед делает необычное предложение, от которого сложно отказаться.",
      "Обычный день превращается в череду нелепых совпадений."
    ]
  },
  {
    name: "Дом и быт", icon: "🪴", color: "#d7d0bd",
    events: [
      "В доме ломается дорогая техника. Ремонт откладывать нельзя.",
      "Сим решает устроить перестановку и неожиданно меняет весь интерьер.",
      "Соседи затевают ремонт. Спокойной жизни на ближайшее время не будет."
    ]
  }
];

const canvas = document.getElementById("fortune-wheel");
const ctx = canvas.getContext("2d");
const spinButton = document.getElementById("spin-button");
const resultBox = document.getElementById("wheel-result");
const historyBox = document.getElementById("wheel-history");
const clearButton = document.getElementById("clear-history");

const TAU = Math.PI * 2;
const slice = TAU / categories.length;
let currentRotation = 0;
let spinning = false;
let history = loadHistory();

function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem("fateHistory") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function drawWheel() {
  const size = canvas.width;
  const center = size / 2;
  const radius = size / 2 - 12;
  ctx.clearRect(0, 0, size, size);

  categories.forEach((category, index) => {
    const start = -Math.PI / 2 + index * slice;
    const end = start + slice;
    const middle = start + slice / 2;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = category.color;
    ctx.fill();
    ctx.strokeStyle = "#fffaf8";
    ctx.lineWidth = 7;
    ctx.stroke();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(middle);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "42px sans-serif";
    ctx.fillText(category.icon, radius * 0.69, 0);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(center, center, radius, 0, TAU);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 10;
  ctx.stroke();
}

function renderResult(category, eventText) {
  resultBox.innerHTML = `
    <span class="result-category">${category.icon} ${escapeHTML(category.name)}</span>
    <h3>Судьба выбрала!</h3>
    <p class="result-event">${escapeHTML(eventText)}</p>
    <p class="result-note">Пусть это событие станет началом новой истории.</p>
  `;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

function renderHistory() {
  if (!history.length) {
    historyBox.innerHTML = '<p class="empty-history">Здесь пока тихо... Время сделать первый поворот судьбы!</p>';
    return;
  }

  historyBox.innerHTML = history.map(item => `
    <article class="history-entry">
      <div class="history-entry-icon">${escapeHTML(item.icon)}</div>
      <div>
        <strong>${escapeHTML(item.category)}</strong>
        <p>${escapeHTML(item.event)}</p>
      </div>
      <time>${escapeHTML(item.date)}</time>
    </article>
  `).join("");
}

function saveHistory() {
  localStorage.setItem("fateHistory", JSON.stringify(history));
}

function spinWheel() {
  if (spinning) return;
  spinning = true;
  spinButton.disabled = true;
  spinButton.textContent = "Судьба решает...";

  const selectedIndex = Math.floor(Math.random() * categories.length);
  const selectedCategory = categories[selectedIndex];
  const eventText = selectedCategory.events[
    Math.floor(Math.random() * selectedCategory.events.length)
  ];

  // Центр выбранного сектора совмещается с указателем сверху.
  const targetAngle = (TAU - (selectedIndex + 0.5) * slice) % TAU;
  const currentNormalized = ((currentRotation % TAU) + TAU) % TAU;
  const extraTurns = 5 + Math.floor(Math.random() * 3);
  const delta = (targetAngle - currentNormalized + TAU) % TAU;
  currentRotation += extraTurns * TAU + delta;

  canvas.style.transition = "transform 5.2s cubic-bezier(.12,.72,.12,1)";
  canvas.style.transform = `rotate(${currentRotation}rad)`;

  window.setTimeout(() => {
    renderResult(selectedCategory, eventText);
    const now = new Date();
    history.unshift({
      category: selectedCategory.name,
      icon: selectedCategory.icon,
      event: eventText,
      date: now.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })
    });
    history = history.slice(0, 100);
    saveHistory();
    renderHistory();

    spinning = false;
    spinButton.disabled = false;
    spinButton.innerHTML = 'Крутить колесо <span>✧</span>';
  }, 5350);
}

spinButton.addEventListener("click", spinWheel);
clearButton.addEventListener("click", () => {
  if (!history.length) return;
  if (!confirm("Точно очистить дневник судьбы?")) return;
  history = [];
  saveHistory();
  renderHistory();
});

drawWheel();
renderHistory();
