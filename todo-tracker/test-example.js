// TODO: Добавить валидацию входных данных
function processData(data) {
    return data;
}

// FIXME: Исправить баг с отрицательными числами
function calculate(a, b) {
    return a + b;
}

// HACK: Временное решение, нужно переписать
const quickFix = () => {
    console.log('quick fix');
};

// TODO: Написать тесты для этой функции
// TODO: Добавить обработку ошибок
async function fetchData() {
    // FIXME: Убрать хардкод URL
    const url = 'http://example.com';
    return fetch(url);
}

// HACK: Костыль для совместимости со старым API
function legacyAdapter(oldData) {
    return { ...oldData, version: 2 };
}

module.exports = { processData, calculate, quickFix, fetchData, legacyAdapter };

