
const events = [
    "Сим внезапно влюбится",
    "Неожиданное пополнение в семье",
    "Серьёзная ссора с близким человеком",
    "Сим найдёт новое хобби",
    "Неожиданный переезд",
    "Потеря работы",
    "Сим встретит старого знакомого",
    "Большая покупка",
    "Секрет, который изменит всё",
    "Новая дружба",
    "Неожиданное наследство",
    "Сим решит начать жизнь с чистого листа"
];

let history = JSON.parse(localStorage.getItem("fateHistory") || "[]");
let rotation = 0;
let isSpinning = false;

function renderHistory() {
    const container = document.getElementById("wheel-history");
    if (!container) return;

    container.innerHTML = "";

    if (history.length === 0) {
        container.innerHTML =
            '<p class="empty-history">Здесь пока тихо... Время сделать первый поворот судьбы!</p>';
        return;
    }

    history.forEach((item, index) => {
        const entry = document.createElement("div");
        entry.className = "history-entry";

        const title = document.createElement("strong");
        title.textContent = `#${history.length - index}. ${item.event}`;

        const date = document.createElement("small");
        date.textContent = item.date;

        entry.appendChild(title);
        entry.appendChild(date);
        container.appendChild(entry);
    });
}

function spinWheel() {
    if (isSpinning) return;

    const wheel = document.querySelector(".wheel-icon");
    const resultElement = document.getElementById("wheel-result");
    const button = document.querySelector(".wheel-placeholder .hero-button");

    if (!wheel || !resultElement) return;

    isSpinning = true;
    if (button) button.disabled = true;

    const result = events[Math.floor(Math.random() * events.length)];

    rotation += 1440 + Math.floor(Math.random() * 360);
    wheel.style.transform = `rotate(${rotation}deg)`;

    resultElement.textContent = "✨ Судьба выбирает...";

    setTimeout(() => {
        resultElement.textContent = "✨ Судьба решила: " + result;

        history.unshift({
            event: result,
            date: new Date().toLocaleString("ru-RU")
        });

        localStorage.setItem("fateHistory", JSON.stringify(history));
        renderHistory();

        isSpinning = false;
        if (button) button.disabled = false;
    }, 4000);
}

function clearHistory() {
    history = [];
    localStorage.removeItem("fateHistory");
    renderHistory();
}

renderHistory();

