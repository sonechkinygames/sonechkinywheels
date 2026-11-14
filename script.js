
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

function spinWheel() {
    const result = events[Math.floor(Math.random() * events.length)];
    const resultElement = document.getElementById("wheel-result");

    if (resultElement) {
        resultElement.textContent = "✨ Судьба решила: " + result;
    }
}
