export function renderHeader(title, extraActionsHtml = '') {
    return `
        <header class="header">
            <div class="header-left">
                <h1 class="page-title">${title}</h1>
                <span class="page-date" id="currentDate"></span>
            </div>
            <div class="header-right">
                ${extraActionsHtml}
            </div>
        </header>
    `;
}

// Установка текущей даты
export function setCurrentDate() {
    const el = document.getElementById('currentDate');
    if (el) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        el.textContent = new Date().toLocaleDateString('ru-RU', options);
    }
}
