// ===== Страница управления ингредиентами - Кучтэнэч =====

// Глобальные переменные
let currentCategory = 'all';
let searchQuery = '';

// ===== Инициализация =====
document.addEventListener('DOMContentLoaded', function () {
    initIngredientsPage();
    setupMobileMenu();
});

function initIngredientsPage() {
    updateKPIs();
    renderIngredientsTable();
}

// ===== Обновление KPI =====
function updateKPIs() {
    const ingredients = getIngredients();
    const lowStock = getLowStockIngredients();
    const totalValue = getTotalStockValue();
    const operations = getStockOperations();

    // Операции за месяц
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthOps = operations.filter(op => new Date(op.date) >= monthStart);

    document.getElementById('totalIngredients').textContent = ingredients.length;
    document.getElementById('lowStockCount').textContent = lowStock.length;
    document.getElementById('totalStockValue').textContent = formatCurrency(totalValue);
    document.getElementById('monthOperations').textContent = monthOps.length;
}

// ===== Рендеринг таблицы =====
function renderIngredientsTable() {
    let ingredients = getIngredients();

    // Фильтрация по категории
    if (currentCategory !== 'all') {
        ingredients = ingredients.filter(ing => ing.category === currentCategory);
    }

    // Поиск
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        ingredients = ingredients.filter(ing =>
            ing.name.toLowerCase().includes(query) ||
            (ing.supplier && ing.supplier.toLowerCase().includes(query))
        );
    }

    const tbody = document.getElementById('ingredientsTableBody');

    if (ingredients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: #888;">
                    Ингредиенты не найдены
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = ingredients.map(ing => {
        const status = getStockStatus(ing);
        const stockValue = ing.currentStock * ing.purchasePrice;

        return `
            <tr>
                <td>
                    <div class="stock-indicator stock-${status.class}" 
                         title="${status.label}"></div>
                </td>
                <td><strong>${ing.name}</strong></td>
                <td>${INGREDIENT_CATEGORIES[ing.category] || ing.category}</td>
                <td>
                    <span class="stock-value ${status.class}">
                        ${formatNumber(ing.currentStock)} ${ing.unit}
                    </span>
                </td>
                <td>${formatNumber(ing.minStock)} ${ing.unit}</td>
                <td>${formatCurrency(ing.purchasePrice)} / ${ing.unit}</td>
                <td><strong>${formatCurrency(stockValue)}</strong></td>
                <td>${ing.supplier || '—'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="editIngredient('${ing.id}')" 
                                title="Редактировать">
                            ✏️
                        </button>
                        <button class="btn-icon" onclick="deleteIngredientConfirm('${ing.id}')" 
                                title="Удалить">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ===== Фильтрация =====
function filterByCategory(category) {
    currentCategory = category;

    // Обновить активную кнопку
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });

    renderIngredientsTable();
}

function handleSearch() {
    searchQuery = document.getElementById('ingredientSearch').value;
    renderIngredientsTable();
}

// ===== Модальные окна =====
function showAddIngredientModal() {
    document.getElementById('addIngredientModal').classList.remove('hidden');
    document.getElementById('addIngredientForm').reset();
}

function closeAddIngredientModal() {
    document.getElementById('addIngredientModal').classList.add('hidden');
}

function showEditIngredientModal() {
    document.getElementById('editIngredientModal').classList.remove('hidden');
}

function closeEditIngredientModal() {
    document.getElementById('editIngredientModal').classList.add('hidden');
}

// ===== Обработчики форм =====
function handleAddIngredient(event) {
    event.preventDefault();

    const ingredient = {
        name: document.getElementById('addName').value,
        category: document.getElementById('addCategory').value,
        unit: document.getElementById('addUnit').value,
        purchasePrice: parseFloat(document.getElementById('addPurchasePrice').value),
        currentStock: parseFloat(document.getElementById('addCurrentStock').value),
        minStock: parseFloat(document.getElementById('addMinStock').value),
        supplier: document.getElementById('addSupplier').value || '',
        lastPurchaseDate: new Date().toISOString().split('T')[0]
    };

    try {
        addIngredient(ingredient);
        closeAddIngredientModal();
        updateKPIs();
        renderIngredientsTable();
        showNotification('✅ Ингредиент успешно добавлен', 'success');
    } catch (error) {
        showNotification('❌ Ошибка: ' + error.message, 'error');
    }
}

function editIngredient(id) {
    const ingredient = getIngredient(id);
    if (!ingredient) {
        showNotification('❌ Ингредиент не найден', 'error');
        return;
    }

    // Заполнить форму
    document.getElementById('editId').value = ingredient.id;
    document.getElementById('editName').value = ingredient.name;
    document.getElementById('editCategory').value = ingredient.category;
    document.getElementById('editUnit').value = ingredient.unit;
    document.getElementById('editPurchasePrice').value = ingredient.purchasePrice;
    document.getElementById('editCurrentStock').value = ingredient.currentStock;
    document.getElementById('editMinStock').value = ingredient.minStock;
    document.getElementById('editSupplier').value = ingredient.supplier || '';

    showEditIngredientModal();
}

function handleEditIngredient(event) {
    event.preventDefault();

    const id = document.getElementById('editId').value;
    const updates = {
        name: document.getElementById('editName').value,
        category: document.getElementById('editCategory').value,
        unit: document.getElementById('editUnit').value,
        purchasePrice: parseFloat(document.getElementById('editPurchasePrice').value),
        currentStock: parseFloat(document.getElementById('editCurrentStock').value),
        minStock: parseFloat(document.getElementById('editMinStock').value),
        supplier: document.getElementById('editSupplier').value || ''
    };

    try {
        updateIngredient(id, updates);
        closeEditIngredientModal();
        updateKPIs();
        renderIngredientsTable();
        showNotification('✅ Ингредиент успешно обновлён', 'success');
    } catch (error) {
        showNotification('❌ Ошибка: ' + error.message, 'error');
    }
}

function deleteIngredientConfirm(id) {
    const ingredient = getIngredient(id);
    if (!ingredient) return;

    // Проверить, используется ли в рецептах
    const usedInRecipes = isIngredientUsedInRecipes(id);

    let message = `Удалить ингредиент "${ingredient.name}"?`;
    if (usedInRecipes) {
        const products = getProductsUsingIngredient(id);
        message += `\n\n⚠️ ВНИМАНИЕ: Этот ингредиент используется в ${products.length} рецептах!`;
    }

    if (confirm(message)) {
        try {
            deleteIngredient(id);
            updateKPIs();
            renderIngredientsTable();
            showNotification('✅ Ингредиент удалён', 'success');
        } catch (error) {
            showNotification('❌ Ошибка: ' + error.message, 'error');
        }
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

function showNotification(message, type = 'info') {
    // Простое уведомление через alert (можно улучшить)
    alert(message);
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

    // Закрыть меню при клике вне его
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
window.initIngredientsPage = initIngredientsPage;
window.updateKPIs = updateKPIs;
window.renderIngredientsTable = renderIngredientsTable;
window.filterByCategory = filterByCategory;
window.handleSearch = handleSearch;
window.showAddIngredientModal = showAddIngredientModal;
window.closeAddIngredientModal = closeAddIngredientModal;
window.showEditIngredientModal = showEditIngredientModal;
window.closeEditIngredientModal = closeEditIngredientModal;
window.handleAddIngredient = handleAddIngredient;
window.editIngredient = editIngredient;
window.handleEditIngredient = handleEditIngredient;
window.deleteIngredientConfirm = deleteIngredientConfirm;
