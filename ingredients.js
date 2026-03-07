// ===== Модуль управления ингредиентами - Кучтэнэч =====

// Категории ингредиентов
const INGREDIENT_CATEGORIES = {
    'flour': 'Мука',
    'dairy': 'Молочные продукты',
    'eggs': 'Яйца',
    'meat': 'Мясо',
    'vegetables': 'Овощи',
    'sugar': 'Сахар и мёд',
    'other': 'Прочее'
};

// Инициализация тестовых данных
const INITIAL_INGREDIENTS = [
    // Мука
    {
        id: 'flour-wheat',
        name: 'Мука пшеничная высший сорт',
        unit: 'кг',
        purchasePrice: 45,
        currentStock: 150,
        minStock: 20,
        category: 'flour',
        supplier: 'Мельница №1',
        lastPurchaseDate: '2026-01-15'
    },
    {
        id: 'flour-rye',
        name: 'Мука ржаная',
        unit: 'кг',
        purchasePrice: 38,
        currentStock: 80,
        minStock: 15,
        category: 'flour',
        supplier: 'Мельница №1',
        lastPurchaseDate: '2026-01-15'
    },

    // Молочные продукты
    {
        id: 'butter',
        name: 'Масло сливочное 82%',
        unit: 'кг',
        purchasePrice: 650,
        currentStock: 25,
        minStock: 5,
        category: 'dairy',
        supplier: 'Молочный комбинат',
        lastPurchaseDate: '2026-01-18'
    },
    {
        id: 'milk',
        name: 'Молоко 3.2%',
        unit: 'л',
        purchasePrice: 65,
        currentStock: 40,
        minStock: 10,
        category: 'dairy',
        supplier: 'Молочный комбинат',
        lastPurchaseDate: '2026-01-18'
    },
    {
        id: 'sour-cream',
        name: 'Сметана 20%',
        unit: 'кг',
        purchasePrice: 180,
        currentStock: 15,
        minStock: 5,
        category: 'dairy',
        supplier: 'Молочный комбинат',
        lastPurchaseDate: '2026-01-18'
    },

    // Яйца
    {
        id: 'eggs',
        name: 'Яйца куриные С1',
        unit: 'шт',
        purchasePrice: 9,
        currentStock: 300,
        minStock: 50,
        category: 'eggs',
        supplier: 'Птицефабрика',
        lastPurchaseDate: '2026-01-19'
    },

    // Мясо
    {
        id: 'meat-beef',
        name: 'Говядина (фарш)',
        unit: 'кг',
        purchasePrice: 420,
        currentStock: 30,
        minStock: 5,
        category: 'meat',
        supplier: 'Мясокомбинат',
        lastPurchaseDate: '2026-01-20'
    },
    {
        id: 'chicken',
        name: 'Курица (филе)',
        unit: 'кг',
        purchasePrice: 280,
        currentStock: 20,
        minStock: 5,
        category: 'meat',
        supplier: 'Птицефабрика',
        lastPurchaseDate: '2026-01-20'
    },

    // Овощи
    {
        id: 'potato',
        name: 'Картофель',
        unit: 'кг',
        purchasePrice: 35,
        currentStock: 50,
        minStock: 10,
        category: 'vegetables',
        supplier: 'Овощная база',
        lastPurchaseDate: '2026-01-17'
    },
    {
        id: 'onion',
        name: 'Лук репчатый',
        unit: 'кг',
        purchasePrice: 28,
        currentStock: 30,
        minStock: 5,
        category: 'vegetables',
        supplier: 'Овощная база',
        lastPurchaseDate: '2026-01-17'
    },

    // Сахар и мёд
    {
        id: 'sugar',
        name: 'Сахар-песок',
        unit: 'кг',
        purchasePrice: 55,
        currentStock: 60,
        minStock: 15,
        category: 'sugar',
        supplier: 'Сахарный завод',
        lastPurchaseDate: '2026-01-10'
    },
    {
        id: 'honey',
        name: 'Мёд натуральный',
        unit: 'кг',
        purchasePrice: 450,
        currentStock: 15,
        minStock: 3,
        category: 'sugar',
        supplier: 'Пасека "Медовый край"',
        lastPurchaseDate: '2026-01-12'
    },

    // Прочее
    {
        id: 'salt',
        name: 'Соль поваренная',
        unit: 'кг',
        purchasePrice: 18,
        currentStock: 20,
        minStock: 5,
        category: 'other',
        supplier: 'Продбаза',
        lastPurchaseDate: '2026-01-05'
    },
    {
        id: 'yeast',
        name: 'Дрожжи сухие',
        unit: 'кг',
        purchasePrice: 280,
        currentStock: 5,
        minStock: 1,
        category: 'other',
        supplier: 'Продбаза',
        lastPurchaseDate: '2026-01-16'
    },
    {
        id: 'water',
        name: 'Вода питьевая',
        unit: 'л',
        purchasePrice: 0,
        currentStock: 1000,
        minStock: 100,
        category: 'other',
        supplier: 'Водопровод',
        lastPurchaseDate: '2026-01-21'
    }
];

// ===== Инициализация =====
function initIngredients() {
    const existing = localStorage.getItem('kuchtanech_ingredients');
    if (!existing) {
        localStorage.setItem('kuchtanech_ingredients', JSON.stringify(INITIAL_INGREDIENTS));
        console.log('✅ Инициализированы тестовые ингредиенты:', INITIAL_INGREDIENTS.length);
    }
}

// Автоматическая инициализация при загрузке
initIngredients();

// ===== CRUD операции =====

// Получить все ингредиенты
function getIngredients() {
    const data = localStorage.getItem('kuchtanech_ingredients');
    return data ? JSON.parse(data) : [];
}

// Получить один ингредиент по ID
function getIngredient(id) {
    const ingredients = getIngredients();
    return ingredients.find(ing => ing.id === id);
}

// Добавить новый ингредиент
function addIngredient(ingredient) {
    const ingredients = getIngredients();

    // Генерация ID если не указан
    if (!ingredient.id) {
        ingredient.id = ingredient.name.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-zа-я0-9-]/g, '');
    }

    // Проверка на дубликат
    if (ingredients.some(ing => ing.id === ingredient.id)) {
        throw new Error(`Ингредиент с ID "${ingredient.id}" уже существует`);
    }

    // Значения по умолчанию
    const newIngredient = {
        id: ingredient.id,
        name: ingredient.name,
        unit: ingredient.unit || 'кг',
        purchasePrice: ingredient.purchasePrice || 0,
        currentStock: ingredient.currentStock || 0,
        minStock: ingredient.minStock || 0,
        category: ingredient.category || 'other',
        supplier: ingredient.supplier || '',
        lastPurchaseDate: ingredient.lastPurchaseDate || new Date().toISOString().split('T')[0]
    };

    ingredients.push(newIngredient);
    localStorage.setItem('kuchtanech_ingredients', JSON.stringify(ingredients));

    console.log('✅ Добавлен ингредиент:', newIngredient.name);
    return newIngredient;
}

// Обновить ингредиент
function updateIngredient(id, updates) {
    const ingredients = getIngredients();
    const index = ingredients.findIndex(ing => ing.id === id);

    if (index === -1) {
        throw new Error(`Ингредиент с ID "${id}" не найден`);
    }

    // Обновляем только переданные поля
    ingredients[index] = { ...ingredients[index], ...updates };
    localStorage.setItem('kuchtanech_ingredients', JSON.stringify(ingredients));

    console.log('✅ Обновлён ингредиент:', ingredients[index].name);
    return ingredients[index];
}

// Удалить ингредиент
function deleteIngredient(id) {
    const ingredients = getIngredients();
    const filtered = ingredients.filter(ing => ing.id !== id);

    if (filtered.length === ingredients.length) {
        throw new Error(`Ингредиент с ID "${id}" не найден`);
    }

    localStorage.setItem('kuchtanech_ingredients', JSON.stringify(filtered));
    console.log('✅ Удалён ингредиент:', id);
    return true;
}

// ===== Вспомогательные функции =====

// Получить ингредиенты по категории
function getIngredientsByCategory(category) {
    const ingredients = getIngredients();
    if (category === 'all') return ingredients;
    return ingredients.filter(ing => ing.category === category);
}

// Поиск ингредиентов
function searchIngredients(query) {
    const ingredients = getIngredients();
    const lowerQuery = query.toLowerCase();
    return ingredients.filter(ing =>
        ing.name.toLowerCase().includes(lowerQuery) ||
        ing.supplier.toLowerCase().includes(lowerQuery)
    );
}

// Получить ингредиенты с низким остатком
function getLowStockIngredients() {
    const ingredients = getIngredients();
    return ingredients.filter(ing => ing.currentStock <= ing.minStock);
}

// Получить ингредиенты с критическим остатком
function getCriticalStockIngredients() {
    const ingredients = getIngredients();
    return ingredients.filter(ing => ing.currentStock < ing.minStock);
}

// Получить общую стоимость запасов
function getTotalStockValue() {
    const ingredients = getIngredients();
    return ingredients.reduce((total, ing) => {
        return total + (ing.currentStock * ing.purchasePrice);
    }, 0);
}

// Обновить остаток ингредиента (используется при операциях)
function updateIngredientStock(ingredientId, delta) {
    const ingredient = getIngredient(ingredientId);

    if (!ingredient) {
        throw new Error(`Ингредиент с ID "${ingredientId}" не найден`);
    }

    const newStock = ingredient.currentStock + delta;

    // Предупреждение при отрицательном остатке
    if (newStock < 0) {
        console.warn(`⚠️ Отрицательный остаток для "${ingredient.name}": ${newStock} ${ingredient.unit}`);
    }

    updateIngredient(ingredientId, { currentStock: newStock });

    console.log(`📦 Остаток "${ingredient.name}": ${ingredient.currentStock} → ${newStock} ${ingredient.unit}`);
    return newStock;
}

// Получить статус остатка (для индикатора)
function getStockStatus(ingredient) {
    if (ingredient.currentStock < ingredient.minStock) {
        return 'critical'; // Красный
    } else if (ingredient.currentStock < ingredient.minStock * 1.5) {
        return 'low'; // Жёлтый
    } else {
        return 'ok'; // Зелёный
    }
}

// ===== Экспорт функций =====
window.INGREDIENT_CATEGORIES = INGREDIENT_CATEGORIES;
window.getIngredients = getIngredients;
window.getIngredient = getIngredient;
window.addIngredient = addIngredient;
window.updateIngredient = updateIngredient;
window.deleteIngredient = deleteIngredient;
window.getIngredientsByCategory = getIngredientsByCategory;
window.searchIngredients = searchIngredients;
window.getLowStockIngredients = getLowStockIngredients;
window.getCriticalStockIngredients = getCriticalStockIngredients;
window.getTotalStockValue = getTotalStockValue;
window.updateIngredientStock = updateIngredientStock;
window.getStockStatus = getStockStatus;
