// ===== Страница управления рецептами - Кучтэнэч =====

// Глобальные переменные
let currentProductId = null;
let currentRecipe = null;
let searchQuery = '';

// ===== Инициализация =====
document.addEventListener('DOMContentLoaded', function () {
    initRecipesPage();
    setupMobileMenu();
});

function initRecipesPage() {
    updateStats();
    renderProductsList();
    populateIngredientSelect();
}

// ===== Обновление статистики =====
function updateStats() {
    const withRecipes = getProductsWithRecipes();
    const withoutRecipes = getProductsWithoutRecipes();

    document.getElementById('withRecipesCount').textContent = withRecipes.length;
    document.getElementById('withoutRecipesCount').textContent = withoutRecipes.length;
}

// ===== Рендеринг списка продуктов =====
function renderProductsList() {
    // Используем Object.entries для получения и ID, и данных продукта
    let productsEntries = Object.entries(PRODUCTS);

    // Поиск
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        productsEntries = productsEntries.filter(([id, p]) => p.name.toLowerCase().includes(query));
    }

    const container = document.getElementById('productsListContainer');

    if (productsEntries.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #888;">
                Продукты не найдены
            </div>
        `;
        return;
    }

    container.innerHTML = productsEntries.map(([id, product]) => {
        const recipe = getRecipe(id);
        const hasRecipe = !!recipe;
        const cost = hasRecipe ? calculateProductCost(id) : null;
        const marginData = hasRecipe ? calculateProductMargin(id) : null;

        // calculateProductMargin возвращает объект, извлекаем marginPercent
        const marginPercent = marginData ? parseFloat(marginData.marginPercent) || 0 : 0;

        return `
            <div class="product-list-item ${currentProductId === id ? 'active' : ''}" 
                 onclick="selectProduct('${id}')">
                <div class="product-list-info">
                    <div class="product-list-name">
                        ${product.name}
                        ${hasRecipe ? '<span class="recipe-badge">✓</span>' : '<span class="recipe-badge no-recipe">—</span>'}
                    </div>
                    <div class="product-list-price">${formatCurrency(product.price)}</div>
                </div>
                ${hasRecipe ? `
                    <div class="product-list-meta">
                        <span class="meta-item">Себестоимость: ${formatCurrency(cost)}</span>
                        <span class="meta-item ${marginPercent >= 50 ? 'positive' : marginPercent >= 30 ? 'warning' : 'negative'}">
                            Маржа: ${marginPercent.toFixed(1)}%
                        </span>
                    </div>
                ` : `
                    <div class="product-list-meta">
                        <span class="meta-item muted">Рецепт не создан</span>
                    </div>
                `}
            </div>
        `;
    }).join('');
}

// ===== Выбор продукта =====
function selectProduct(productId) {
    currentProductId = productId;
    const product = PRODUCTS[productId];

    if (!product) return;

    // Обновить список продуктов (подсветить выбранный)
    renderProductsList();

    // Загрузить или создать рецепт
    currentRecipe = getRecipe(productId) || {
        productId: productId,
        version: 1,
        createdDate: new Date().toISOString().split('T')[0],
        ingredients: [],
        yieldQty: 1,
        notes: ''
    };

    // Показать редактор
    document.getElementById('editorPlaceholder').classList.add('hidden');
    document.getElementById('recipeEditor').classList.remove('hidden');

    // Заполнить информацию о продукте
    document.getElementById('editorProductName').textContent = product.name;
    document.getElementById('editorProductPrice').textContent = `Цена: ${formatCurrency(product.price)}`;
    document.getElementById('salePrice').textContent = formatCurrency(product.price);

    // Рендерить ингредиенты
    renderRecipeIngredients();
    updateCostCalculation();
}

// ===== Рендеринг ингредиентов рецепта =====
function renderRecipeIngredients() {
    const container = document.getElementById('recipeIngredientsList');

    if (!currentRecipe || currentRecipe.ingredients.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Ингредиенты не добавлены</p>
                <p class="hint">Нажмите "Добавить ингредиент" чтобы начать</p>
            </div>
        `;
        return;
    }

    container.innerHTML = currentRecipe.ingredients.map((ing, index) => {
        const ingredient = getIngredient(ing.ingredientId);
        if (!ingredient) return '';

        const itemCost = ingredient.purchasePrice * ing.quantity;

        return `
            <div class="recipe-ingredient-item">
                <div class="ingredient-main">
                    <div class="ingredient-name">${ingredient.name}</div>
                    <div class="ingredient-quantity">
                        ${formatNumber(ing.quantity)} ${ing.unit}
                    </div>
                    <div class="ingredient-cost">${formatCurrency(itemCost)}</div>
                    <button class="btn-icon" onclick="removeIngredientFromRecipe(${index})" title="Удалить">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ===== Расчёт себестоимости =====
function updateCostCalculation() {
    if (!currentRecipe || !currentProductId) return;

    let totalCost = 0;
    currentRecipe.ingredients.forEach(ing => {
        const ingredient = getIngredient(ing.ingredientId);
        if (ingredient) {
            totalCost += ingredient.purchasePrice * ing.quantity;
        }
    });

    const product = PRODUCTS[currentProductId];
    const salePrice = product.price;
    const margin = salePrice > 0 ? ((salePrice - totalCost) / salePrice * 100) : 0;

    document.getElementById('calculatedCost').textContent = formatCurrency(totalCost);

    const marginElement = document.getElementById('marginValue');
    marginElement.textContent = `${margin.toFixed(1)}%`;

    // Цветовая индикация маржи
    marginElement.className = 'cost-value';
    if (margin >= 50) {
        marginElement.classList.add('positive');
    } else if (margin >= 30) {
        marginElement.classList.add('warning');
    } else {
        marginElement.classList.add('negative');
    }
}

// ===== Модальное окно добавления ингредиента =====
function showAddIngredientToRecipe() {
    if (!currentProductId) return;

    document.getElementById('addIngredientToRecipeModal').classList.remove('hidden');
    document.getElementById('addIngredientToRecipeForm').reset();
    document.getElementById('recipeIngredientUnit').value = '';
}

function closeAddIngredientToRecipeModal() {
    document.getElementById('addIngredientToRecipeModal').classList.add('hidden');
}

function populateIngredientSelect() {
    const select = document.getElementById('recipeIngredientId');
    const ingredients = getIngredients();

    // Очистить и добавить опции
    select.innerHTML = '<option value="">Выберите ингредиент...</option>';

    ingredients.forEach(ing => {
        const option = document.createElement('option');
        option.value = ing.id;
        option.textContent = `${ing.name} (${ing.unit})`;
        option.dataset.unit = ing.unit;
        select.appendChild(option);
    });

    // Обновлять единицу измерения при выборе
    select.addEventListener('change', function () {
        const selectedOption = this.options[this.selectedIndex];
        const unit = selectedOption.dataset.unit || '';
        document.getElementById('recipeIngredientUnit').value = unit;
    });
}

function handleAddIngredientToRecipe(event) {
    event.preventDefault();

    const ingredientId = document.getElementById('recipeIngredientId').value;
    const quantity = parseFloat(document.getElementById('recipeIngredientQuantity').value);
    const unit = document.getElementById('recipeIngredientUnit').value;

    if (!ingredientId || !quantity) {
        alert('Заполните все обязательные поля');
        return;
    }

    // Проверить, не добавлен ли уже этот ингредиент
    const exists = currentRecipe.ingredients.some(ing => ing.ingredientId === ingredientId);
    if (exists) {
        alert('Этот ингредиент уже добавлен в рецепт');
        return;
    }

    // Добавить ингредиент
    currentRecipe.ingredients.push({
        ingredientId: ingredientId,
        quantity: quantity,
        unit: unit
    });

    closeAddIngredientToRecipeModal();
    renderRecipeIngredients();
    updateCostCalculation();
}

function removeIngredientFromRecipe(index) {
    if (!currentRecipe) return;

    if (confirm('Удалить этот ингредиент из рецепта?')) {
        currentRecipe.ingredients.splice(index, 1);
        renderRecipeIngredients();
        updateCostCalculation();
    }
}

// ===== Сохранение рецепта =====
function saveCurrentRecipe() {
    if (!currentRecipe || !currentProductId) return;

    if (currentRecipe.ingredients.length === 0) {
        alert('Добавьте хотя бы один ингредиент в рецепт');
        return;
    }

    try {
        saveRecipe(currentRecipe);
        updateStats();
        renderProductsList();
        alert('✅ Рецепт успешно сохранён');
    } catch (error) {
        alert('❌ Ошибка сохранения: ' + error.message);
    }
}

function deleteRecipeConfirm() {
    if (!currentProductId) return;

    const recipe = getRecipe(currentProductId);
    if (!recipe) {
        alert('Рецепт не существует');
        return;
    }

    if (confirm('Удалить рецепт для этого продукта?')) {
        try {
            deleteRecipe(currentProductId);
            closeRecipeEditor();
            updateStats();
            renderProductsList();
            alert('✅ Рецепт удалён');
        } catch (error) {
            alert('❌ Ошибка удаления: ' + error.message);
        }
    }
}

function closeRecipeEditor() {
    currentProductId = null;
    currentRecipe = null;

    document.getElementById('editorPlaceholder').classList.remove('hidden');
    document.getElementById('recipeEditor').classList.add('hidden');

    renderProductsList();
}

// ===== Поиск =====
function handleProductSearch() {
    searchQuery = document.getElementById('productSearch').value;
    renderProductsList();
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
        maximumFractionDigits: 3
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
window.initRecipesPage = initRecipesPage;
window.selectProduct = selectProduct;
window.showAddIngredientToRecipe = showAddIngredientToRecipe;
window.closeAddIngredientToRecipeModal = closeAddIngredientToRecipeModal;
window.handleAddIngredientToRecipe = handleAddIngredientToRecipe;
window.removeIngredientFromRecipe = removeIngredientFromRecipe;
window.saveCurrentRecipe = saveCurrentRecipe;
window.deleteRecipeConfirm = deleteRecipeConfirm;
window.closeRecipeEditor = closeRecipeEditor;
window.handleProductSearch = handleProductSearch;
