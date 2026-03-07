// ===== Страница управления складом - Кучтэнэч =====

// Глобальные переменные
let currentTab = 'balances';
let balancesSearchQuery = '';
let operationTypeFilter = 'all';
let operationPeriodFilter = 'month';

// ===== Инициализация =====
document.addEventListener('DOMContentLoaded', function () {
    initStockPage();
    setupMobileMenu();
});

function initStockPage() {
    populateOperationIngredients();
    renderBalancesTab();
}

// ===== Переключение вкладок =====
function switchTab(tab) {
    currentTab = tab;

    // Обновить активные кнопки
    document.querySelectorAll('.stock-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Показать нужную вкладку
    document.querySelectorAll('.stock-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tab}-tab`).classList.add('active');

    // Рендерить содержимое
    switch (tab) {
        case 'balances':
            renderBalancesTab();
            break;
        case 'operations':
            renderOperationsTab(); break;
        case 'analytics':
            renderAnalyticsTab();
            break;
    }
}

// ===== Вкладка: Остатки =====
function renderBalancesTab() {
    let ingredients = getIngredients();

    // Поиск
    if (balancesSearchQuery) {
        const query = balancesSearchQuery.toLowerCase();
        ingredients = ingredients.filter(ing => ing.name.toLowerCase().includes(query));
    }

    // Сортировка по статусу (критические => низкие => нормальные)
    ingredients.sort((a, b) => {
        const statusA = getStockStatus(a);
        const statusB = getStockStatus(b);
        const order = { 'critical': 0, 'low': 1, 'ok': 2 };
        return order[statusA.class] - order[statusB.class];
    });

    const tbody = document.getElementById('balancesTableBody');

    if (ingredients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #888;">
                    Ингредиенты не найдены
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = ingredients.map(ing => {
        const status = getStockStatus(ing);
        const stockValue = ing.currentStock * ing.purchasePrice;
        const percentOfMin = ing.minStock > 0 ? (ing.currentStock / ing.minStock * 100) : 100;
        const forecast = getStockForecast(ing.id, 7);

        let forecastText = '—';
        if (forecast && forecast.daysLeft !== null) {
            if (forecast.daysLeft === 0) {
                forecastText = '<span class="forecast-critical">Закончилось</span>';
            } else if (forecast.daysLeft < 3) {
                forecastText = `<span class="forecast-warning">${forecast.daysLeft} д.</span>`;
            } else if (forecast.daysLeft < 7) {
                forecastText = `<span class="forecast-ok">${forecast.daysLeft} д.</span>`;
            } else {
                forecastText = `<span class="forecast-good">\u003e7 д.</span>`;
            }
        }

        return `
            <tr>
                <td>
                    <div class="stock-indicator stock-${status.class}" title="${status.label}"></div>
                </td>
                <td><strong>${ing.name}</strong></td>
                <td>
                    <span class="stock-value ${status.class}">
                        ${formatNumber(ing.currentStock)} ${ing.unit}
                    </span>
                </td>
                <td>${formatNumber(ing.minStock)} ${ing.unit}</td>
                <td>
                    <span class="${percentOfMin < 100 ? 'negative' : percentOfMin < 150 ? 'warning' : 'positive'}">
                        ${formatNumber(percentOfMin)}%
                    </span>
                </td>
                <td>${formatCurrency(stockValue)}</td>
                <td>${forecastText}</td>
            </tr>
        `;
    }).join('');
}

function handleBalancesSearch() {
    balancesSearchQuery = document.getElementById('balancesSearch').value;
    renderBalancesTab();
}

// ===== Вкладка: Операции =====
function renderOperationsTab() {
    let operations = getStockOperations();

    // Фильтр по типу
    if (operationTypeFilter !== 'all') {
        operations = operations.filter(op => op.type === operationTypeFilter);
    }

    // Фильтр по периоду
    if (operationPeriodFilter !== 'all') {
        operations = getStockOperationsByPeriod(operationPeriodFilter);
    }

    // Сортировка по дате (новые первые)
    operations.sort((a, b) => new Date(b.date) - new Date(a.date));

    const tbody = document.getElementById('operationsTableBody');

    if (operations.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #888;">
                    Операции не найдены
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = operations.map(op => {
        const ingredient = getIngredient(op.ingredientId);
        const ingredientName = ingredient ? ingredient.name : 'Неизвестно';
        const date = new Date(op.date);
        const dateStr = date.toLocaleDateString('ru-RU');
        const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

        let typeClass = '';
        let typeLabel = OPERATION_TYPES[op.type] || op.type;

        switch (op.type) {
            case 'purchase':
                typeClass = 'type-purchase';
                break;
            case 'sale':
                typeClass = 'type-sale';
                break;
            case 'writeoff':
                typeClass = 'type-writeoff';
                break;
            case 'inventory':
                typeClass = 'type-inventory';
                break;
        }

        const qtyClass = op.quantity > 0 ? 'positive' : 'negative';
        const qtyPrefix = op.quantity > 0 ? '+' : '';

        return `
            <tr>
                <td>
                    <div>${dateStr}</div>
                    <div style="font-size: 0.813rem; color: var(--text-muted);">${timeStr}</div>
                </td>
                <td>
                    <span class="operation-type ${typeClass}">${typeLabel}</span>
                </td>
                <td>${ingredientName}</td>
                <td>
                    <span class="${qtyClass}">
                        ${qtyPrefix}${formatNumber(Math.abs(op.quantity))} ${ingredient ? ingredient.unit : ''}
                    </span>
                </td>
                <td>${op.reason || '—'}</td>
                <td>${op.notes || '—'}</td>
            </tr>
        `;
    }).join('');
}

function handleOperationFilters() {
    operationTypeFilter = document.getElementById('operationTypeFilter').value;
    operationPeriodFilter = document.getElementById('operationPeriodFilter').value;
    renderOperationsTab();
}

// ===== Вкладка: Аналитика =====
function renderAnalyticsTab() {
    renderTopIngredients();
    renderLowStockAlerts();
    renderOperationsStats();
}

function renderTopIngredients() {
    const topIngredients = getTopUsedIngredients('month', 5);
    const container = document.getElementById('topIngredientsList');

    if (!topIngredients || topIngredients.length === 0) {
        container.innerHTML = '<p style="padding: 20px; text-align: center; color: var(--text-muted);">Нет данных</p>';
        return;
    }

    container.innerHTML = topIngredients.map((item, index) => {
        const ingredient = getIngredient(item.ingredientId);
        if (!ingredient) return '';

        return `
            <div class="top-ingredient-item">
                <div class="top-ingredient-rank">${index + 1}</div>
                <div class="top-ingredient-info">
                    <div class="top-ingredient-name">${ingredient.name}</div>
                    <div class="top-ingredient-usage">
                        Расход: ${formatNumber(Math.abs(item.totalUsed))} ${ingredient.unit}
                    </div>
                </div>
                <div class="top-ingredient-cost">
                    ${formatCurrency(Math.abs(item.totalUsed) * ingredient.purchasePrice)}
                </div>
            </div>
        `;
    }).join('');
}

function renderLowStockAlerts() {
    const lowStock = getLowStockIngredients();
    const container = document.getElementById('lowStockList');

    if (lowStock.length === 0) {
        container.innerHTML = '<p style="padding: 20px; text-align: center; color: var(--success);">✅ Все остатки в норме</p>';
        return;
    }

    container.innerHTML = lowStock.map(ing => {
        const status = getStockStatus(ing);
        const needed = Math.ceil(ing.minStock * 2 - ing.currentStock);

        return `
            <div class="low-stock-item">
                <div class="stock-indicator stock-${status.class}"></div>
                <div class="low-stock-info">
                    <div class="low-stock-name">${ing.name}</div>
                    <div class="low-stock-current">
                        Остаток: ${formatNumber(ing.currentStock)} ${ing.unit}
                    </div>
                </div>
                <div class="low-stock-action">
                    <div class="low-stock-needed">Требуется: ~${needed} ${ing.unit}</div>
                </div>
            </div>
        `;
    }).join('');
}

function renderOperationsStats() {
    const stats = getOperationsStats('month');
    const container = document.getElementById('operationsStats');

    if (!stats) {
        container.innerHTML = '<p style="padding: 20px; text-align: center; color: var(--text-muted);">Нет данных</p>';
        return;
    }

    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(16, 185, 129, 0.15);">📥</div>
                <div class="stat-info">
                    <div class="stat-label">Закупки</div>
                    <div class="stat-value">${stats.purchases || 0}</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(59, 130, 246, 0.15);">📤</div>
                <div class="stat-info">
                    <div class="stat-label">Продажи (авто)</div>
                    <div class="stat-value">${stats.sales || 0}</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(239, 68, 68, 0.15);">🗑️</div>
                <div class="stat-info">
                    <div class="stat-label">Списания</div>
                    <div class="stat-value">${stats.writeoffs || 0}</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(245, 158, 11, 0.15);">✔️</div>
                <div class="stat-info">
                    <div class="stat-label">Инвентаризации</div>
                    <div class="stat-value">${stats.inventories || 0}</div>
                </div>
            </div>
        </div>
    `;
}

// ===== Модальное окно новой операции =====
function showNewOperationModal() {
    document.getElementById('newOperationModal').classList.remove('hidden');
    document.getElementById('newOperationForm').reset();
    document.getElementById('operationPreview').innerHTML = '';
}

function closeNewOperationModal() {
    document.getElementById('newOperationModal').classList.add('hidden');
}

function populateOperationIngredients() {
    const select = document.getElementById('operationIngredient');
    const ingredients = getIngredients();

    select.innerHTML = '<option value="">Выберите ингредиент...</option>';

    ingredients.forEach(ing => {
        const option = document.createElement('option');
        option.value = ing.id;
        option.textContent = `${ing.name} (остаток: ${formatNumber(ing.currentStock)} ${ing.unit})`;
        option.dataset.unit = ing.unit;
        option.dataset.current = ing.currentStock;
        select.appendChild(option);
    });
}

function handleOperationTypeChange() {
    const type = document.getElementById('operationType').value;
    updateOperationPreview();
}

function handleIngredientSelect() {
    const select = document.getElementById('operationIngredient');
    const selectedOption = select.options[select.selectedIndex];
    const unit = selectedOption.dataset.unit || '';
    document.getElementById('operationUnit').value = unit;
    updateOperationPreview();
}

function updateOperationPreview() {
    const type = document.getElementById('operationType').value;
    const ingredientId = document.getElementById('operationIngredient').value;
    const quantity = parseFloat(document.getElementById('operationQuantity').value) || 0;

    if (!type || !ingredientId || quantity <= 0) {
        document.getElementById('operationPreview').innerHTML = '';
        return;
    }

    const ingredient = getIngredient(ingredientId);
    if (!ingredient) return;

    let newStock = ingredient.currentStock;
    let operation = '';

    switch (type) {
        case 'purchase':
            newStock += quantity;
            operation = '+';
            break;
        case 'writeoff':
            newStock -= quantity;
            operation = '−';
            break;
        case 'inventory':
            newStock = quantity; // Инвентаризация устанавливает точное значение
            operation = '=';
            break;
    }

    const status = getStockStatus({ ...ingredient, currentStock: newStock });

    document.getElementById('operationPreview').innerHTML = `
        <div class="operation-preview-content">
            <div class="preview-label">Изменение остатка:</div>
            <div class="preview-calc">
                ${formatNumber(ingredient.currentStock)} ${operation} ${formatNumber(quantity)} = 
                <span class="stock-value ${status.class}">
                    ${formatNumber(newStock)} ${ingredient.unit}
                </span>
            </div>
        </div>
    `;
}

// Обновлять превью при изменении количества
document.addEventListener('DOMContentLoaded', () => {
    const qtyInput = document.getElementById('operationQuantity');
    if (qtyInput) {
        qtyInput.addEventListener('input', updateOperationPreview);
    }
});

function handleNewOperation(event) {
    event.preventDefault();

    const type = document.getElementById('operationType').value;
    const ingredientId = document.getElementById('operationIngredient').value;
    const quantity = parseFloat(document.getElementById('operationQuantity').value);
    const reason = document.getElementById('operationReason').value;
    const notes = document.getElementById('operationNotes').value;

    if (!type || !ingredientId || !quantity) {
        alert('Заполните все обязательные поля');
        return;
    }

    try {
        // Для списания и инвентаризации количество отрицательное/корректировка
        let finalQuantity = quantity;
        if (type === 'writeoff') {
            finalQuantity = -quantity;
        } else if (type === 'inventory') {
            // Для инвентаризации вычисляем разницу
            const ingredient = getIngredient(ingredientId);
            finalQuantity = quantity - ingredient.currentStock;
        }

        createStockOperation(type, ingredientId, finalQuantity, reason, notes);

        closeNewOperationModal();
        renderBalancesTab();
        renderOperationsTab();
        alert('✅ Операция успешно выполнена');
    } catch (error) {
        alert('❌ Ошибка: ' + error.message);
    }
}

// ===== Вспомогательные функции =====
function formatCurrency(value) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(value);
}

function formatNumber(value) {
    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(value);
}

// ===== Мобильное меню =====
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function () {
            sidebar.classList.toggle('active');
        });
    }

    document.addEventListener('click', function (event) {
        if (!sidebar.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
            sidebar.classList.remove('active');
        }
    });
}

// Закрытие модальных окон по клику вне их
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.add('hidden');
    }
});

// Экспорт функций
window.switchTab = switchTab;
window.handleBalancesSearch = handleBalancesSearch;
window.handleOperationFilters = handleOperationFilters;
window.showNewOperationModal = showNewOperationModal;
window.closeNewOperationModal = closeNewOperationModal;
window.handleOperationTypeChange = handleOperationTypeChange;
window.handleIngredientSelect = handleIngredientSelect;
window.handleNewOperation = handleNewOperation;
