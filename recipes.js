// ===== Модуль управления рецептами - Кучтэнэч =====

// Тестовые рецепты для популярных позиций
const INITIAL_RECIPES = {
    'echpochmak': {
        productId: 'echpochmak',
        version: 1,
        createdDate: '2026-01-21',
        ingredients: [
            { ingredientId: 'flour-wheat', quantity: 0.08, unit: 'кг' },
            { ingredientId: 'butter', quantity: 0.015, unit: 'кг' },
            { ingredientId: 'meat-beef', quantity: 0.05, unit: 'кг' },
            { ingredientId: 'potato', quantity: 0.03, unit: 'кг' },
            { ingredientId: 'onion', quantity: 0.02, unit: 'кг' },
            { ingredientId: 'salt', quantity: 0.002, unit: 'кг' }
        ],
        yieldQty: 1,
        notes: 'Классический татарский эчпочмак'
    },

    'elesh': {
        productId: 'elesh',
        version: 1,
        createdDate: '2026-01-21',
        ingredients: [
            { ingredientId: 'flour-wheat', quantity: 0.12, unit: 'кг' },
            { ingredientId: 'butter', quantity: 0.025, unit: 'кг' },
            { ingredientId: 'chicken', quantity: 0.15, unit: 'кг' },
            { ingredientId: 'potato', quantity: 0.08, unit: 'кг' },
            { ingredientId: 'onion', quantity: 0.03, unit: 'кг' },
            { ingredientId: 'eggs', quantity: 0.5, unit: 'шт' },
            { ingredientId: 'salt', quantity: 0.003, unit: 'кг' }
        ],
        yieldQty: 1,
        notes: 'Элеш с курицей и картофелем'
    },

    'kystyby': {
        productId: 'kystyby',
        version: 1,
        createdDate: '2026-01-21',
        ingredients: [
            { ingredientId: 'flour-wheat', quantity: 0.06, unit: 'кг' },
            { ingredientId: 'milk', quantity: 0.05, unit: 'л' },
            { ingredientId: 'potato', quantity: 0.08, unit: 'кг' },
            { ingredientId: 'butter', quantity: 0.01, unit: 'кг' },
            { ingredientId: 'salt', quantity: 0.002, unit: 'кг' }
        ],
        yieldQty: 1,
        notes: 'Кыстыбый с картофельным пюре'
    },

    'bread-white': {
        productId: 'bread-white',
        version: 1,
        createdDate: '2026-01-21',
        ingredients: [
            { ingredientId: 'flour-wheat', quantity: 0.5, unit: 'кг' },
            { ingredientId: 'water', quantity: 0.3, unit: 'л' },
            { ingredientId: 'yeast', quantity: 0.01, unit: 'кг' },
            { ingredientId: 'salt', quantity: 0.01, unit: 'кг' },
            { ingredientId: 'sugar', quantity: 0.015, unit: 'кг' }
        ],
        yieldQty: 1,
        notes: 'Хлеб белый пшеничный'
    },

    'bread-rye': {
        productId: 'bread-rye',
        version: 1,
        createdDate: '2026-01-21',
        ingredients: [
            { ingredientId: 'flour-rye', quantity: 0.35, unit: 'кг' },
            { ingredientId: 'flour-wheat', quantity: 0.15, unit: 'кг' },
            { ingredientId: 'water', quantity: 0.32, unit: 'л' },
            { ingredientId: 'yeast', quantity: 0.008, unit: 'кг' },
            { ingredientId: 'salt', quantity: 0.012, unit: 'кг' }
        ],
        yieldQty: 1,
        notes: 'Хлеб ржаной'
    },

    'croissant': {
        productId: 'croissant',
        version: 1,
        createdDate: '2026-01-21',
        ingredients: [
            { ingredientId: 'flour-wheat', quantity: 0.06, unit: 'кг' },
            { ingredientId: 'butter', quantity: 0.025, unit: 'кг' },
            { ingredientId: 'milk', quantity: 0.03, unit: 'л' },
            { ingredientId: 'eggs', quantity: 0.3, unit: 'шт' },
            { ingredientId: 'sugar', quantity: 0.01, unit: 'кг' },
            { ingredientId: 'yeast', quantity: 0.003, unit: 'кг' },
            { ingredientId: 'salt', quantity: 0.001, unit: 'кг' }
        ],
        yieldQty: 1,
        notes: 'Круассан классический'
    },

    'chak-chak': {
        productId: 'chak-chak',
        version: 1,
        createdDate: '2026-01-21',
        ingredients: [
            { ingredientId: 'flour-wheat', quantity: 0.25, unit: 'кг' },
            { ingredientId: 'eggs', quantity: 5, unit: 'шт' },
            { ingredientId: 'honey', quantity: 0.15, unit: 'кг' },
            { ingredientId: 'sugar', quantity: 0.08, unit: 'кг' },
            { ingredientId: 'butter', quantity: 0.02, unit: 'кг' }
        ],
        yieldQty: 1,
        notes: 'Чак-чак татарский (порция 350г)'
    }
};

// ===== Инициализация =====
function initRecipes() {
    const existing = localStorage.getItem('kuchtanech_recipes');
    if (!existing) {
        localStorage.setItem('kuchtanech_recipes', JSON.stringify(INITIAL_RECIPES));
        console.log('✅ Инициализированы тестовые рецепты:', Object.keys(INITIAL_RECIPES).length);
    }
}

// Автоматическая инициализация при загрузке
initRecipes();

// ===== CRUD операции =====

// Получить все рецепты
function getRecipes() {
    const data = localStorage.getItem('kuchtanech_recipes');
    return data ? JSON.parse(data) : {};
}

// Получить рецепт для конкретного продукта
function getRecipe(productId) {
    const recipes = getRecipes();
    return recipes[productId] || null;
}

// Сохранить/обновить рецепт
function saveRecipe(recipe) {
    const recipes = getRecipes();

    // Валидация
    if (!recipe.productId) {
        throw new Error('Не указан productId для рецепта');
    }

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
        throw new Error('Рецепт должен содержать хотя бы один ингредиент');
    }

    // Проверка существования ингредиентов
    recipe.ingredients.forEach(ing => {
        const ingredient = getIngredient(ing.ingredientId);
        if (!ingredient) {
            throw new Error(`Ингредиент "${ing.ingredientId}" не найден`);
        }
    });

    // Если рецепт уже существует, увеличиваем версию
    const existingRecipe = recipes[recipe.productId];
    const version = existingRecipe ? existingRecipe.version + 1 : 1;

    const newRecipe = {
        productId: recipe.productId,
        version: version,
        createdDate: recipe.createdDate || new Date().toISOString().split('T')[0],
        ingredients: recipe.ingredients,
        yieldQty: recipe.yieldQty || 1,
        notes: recipe.notes || ''
    };

    recipes[recipe.productId] = newRecipe;
    localStorage.setItem('kuchtanech_recipes', JSON.stringify(recipes));

    // Обновляем информацию в PRODUCTS
    if (window.PRODUCTS && window.PRODUCTS[recipe.productId]) {
        const cost = calculateProductCost(recipe.productId);
        window.PRODUCTS[recipe.productId].hasRecipe = true;
        window.PRODUCTS[recipe.productId].calculatedCost = cost;
    }

    console.log('✅ Сохранён рецепт для:', recipe.productId, '(версия', version + ')');
    return newRecipe;
}

// Удалить рецепт
function deleteRecipe(productId) {
    const recipes = getRecipes();

    if (!recipes[productId]) {
        throw new Error(`Рецепт для продукта "${productId}" не найден`);
    }

    delete recipes[productId];
    localStorage.setItem('kuchtanech_recipes', JSON.stringify(recipes));

    // Обновляем информацию в PRODUCTS
    if (window.PRODUCTS && window.PRODUCTS[productId]) {
        window.PRODUCTS[productId].hasRecipe = false;
        window.PRODUCTS[productId].calculatedCost = null;
    }

    console.log('✅ Удалён рецепт для:', productId);
    return true;
}

// ===== Расчёт себестоимости =====

// Рассчитать себестоимость одного продукта
function calculateProductCost(productId) {
    const recipe = getRecipe(productId);

    if (!recipe) {
        // Если нет рецепта, используем статичную себестоимость из PRODUCTS
        if (window.PRODUCTS && window.PRODUCTS[productId]) {
            return window.PRODUCTS[productId].cost;
        }
        return 0;
    }

    let totalCost = 0;

    recipe.ingredients.forEach(ing => {
        const ingredient = getIngredient(ing.ingredientId);
        if (ingredient) {
            const cost = ing.quantity * ingredient.purchasePrice;
            totalCost += cost;
        } else {
            console.warn(`⚠️ Ингредиент "${ing.ingredientId}" не найден в рецепте для "${productId}"`);
        }
    });

    // Делим на выход (обычно 1, но может быть больше)
    return totalCost / (recipe.yieldQty || 1);
}

// Рассчитать себестоимость всех продуктов с рецептами
function calculateAllProductCosts() {
    const recipes = getRecipes();
    const costs = {};

    Object.keys(recipes).forEach(productId => {
        costs[productId] = calculateProductCost(productId);
    });

    return costs;
}

// Получить детальный расчёт себестоимости (с разбивкой по ингредиентам)
function getProductCostBreakdown(productId) {
    const recipe = getRecipe(productId);

    if (!recipe) {
        return null;
    }

    const breakdown = [];
    let totalCost = 0;

    recipe.ingredients.forEach(ing => {
        const ingredient = getIngredient(ing.ingredientId);
        if (ingredient) {
            const cost = ing.quantity * ingredient.purchasePrice;
            totalCost += cost;

            breakdown.push({
                ingredientId: ing.ingredientId,
                ingredientName: ingredient.name,
                quantity: ing.quantity,
                unit: ing.unit,
                pricePerUnit: ingredient.purchasePrice,
                totalCost: cost
            });
        }
    });

    return {
        productId: productId,
        breakdown: breakdown,
        totalCost: totalCost / (recipe.yieldQty || 1),
        yieldQty: recipe.yieldQty
    };
}

// Рассчитать маржинальность продукта
function calculateProductMargin(productId) {
    if (!window.PRODUCTS || !window.PRODUCTS[productId]) {
        return null;
    }

    const product = window.PRODUCTS[productId];
    const cost = calculateProductCost(productId);
    const price = product.price;

    if (price === 0) return 0;

    const margin = ((price - cost) / price) * 100;

    return {
        productId: productId,
        productName: product.name,
        cost: cost,
        price: price,
        profit: price - cost,
        marginPercent: margin.toFixed(1)
    };
}

// ===== Вспомогательные функции =====

// Получить список продуктов с рецептами
function getProductsWithRecipes() {
    const recipes = getRecipes();
    return Object.keys(recipes);
}

// Получить список продуктов без рецептов
function getProductsWithoutRecipes() {
    if (!window.PRODUCTS) return [];

    const recipes = getRecipes();
    const allProductIds = Object.keys(window.PRODUCTS);

    return allProductIds.filter(id => !recipes[id]);
}

// Проверить, используется ли ингредиент в каких-либо рецептах
function isIngredientUsedInRecipes(ingredientId) {
    const recipes = getRecipes();

    for (const productId in recipes) {
        const recipe = recipes[productId];
        if (recipe.ingredients.some(ing => ing.ingredientId === ingredientId)) {
            return true;
        }
    }

    return false;
}

// Получить список продуктов, использующих данный ингредиент
function getProductsUsingIngredient(ingredientId) {
    const recipes = getRecipes();
    const products = [];

    for (const productId in recipes) {
        const recipe = recipes[productId];
        if (recipe.ingredients.some(ing => ing.ingredientId === ingredientId)) {
            products.push({
                productId: productId,
                productName: window.PRODUCTS ? window.PRODUCTS[productId]?.name : productId,
                quantity: recipe.ingredients.find(ing => ing.ingredientId === ingredientId).quantity
            });
        }
    }

    return products;
}

// ===== Экспорт функций =====
window.getRecipes = getRecipes;
window.getRecipe = getRecipe;
window.saveRecipe = saveRecipe;
window.deleteRecipe = deleteRecipe;
window.calculateProductCost = calculateProductCost;
window.calculateAllProductCosts = calculateAllProductCosts;
window.getProductCostBreakdown = getProductCostBreakdown;
window.calculateProductMargin = calculateProductMargin;
window.getProductsWithRecipes = getProductsWithRecipes;
window.getProductsWithoutRecipes = getProductsWithoutRecipes;
window.isIngredientUsedInRecipes = isIngredientUsedInRecipes;
window.getProductsUsingIngredient = getProductsUsingIngredient;
