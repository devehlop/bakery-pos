// ===== Модуль складских операций - Кучтэнэч =====
import { getIngredient, updateIngredientStock } from './ingredients.js';
import { getRecipe } from './recipes.js';

// Типы операций
const OPERATION_TYPES = {
    'purchase': 'Закупка',
    'sale': 'Продажа (автоматическое списание)',
    'writeoff': 'Списание (брак/усушка)',
    'inventory': 'Инвентаризация'
};

// ===== Инициализация =====
function initStockOperations() {
    const existing = localStorage.getItem('kuchtanech_stock_operations');
    if (!existing) {
        localStorage.setItem('kuchtanech_stock_operations', JSON.stringify([]));
        console.log('✅ Инициализирован модуль складских операций');
    }
}

// Автоматическая инициализация при загрузке
initStockOperations();

// ===== Операции =====

// Получить все операции
function getStockOperations() {
    const data = localStorage.getItem('kuchtanech_stock_operations');
    return data ? JSON.parse(data) : [];
}

// Создать новую операцию
function createStockOperation(type, ingredientId, quantity, reason, notes = '', relatedSaleId = null) {
    // Валидация
    if (!OPERATION_TYPES[type]) {
        throw new Error(`Неизвестный тип операции: "${type}"`);
    }

    if (!ingredientId) {
        throw new Error('Не указан ingredientId');
    }

    if (quantity === 0) {
        throw new Error('Количество не может быть нулевым');
    }

    const ingredient = getIngredient(ingredientId);
    if (!ingredient) {
        throw new Error(`Ингредиент "${ingredientId}" не найден`);
    }

    // Проверка на достаточность остатка при списании
    if (quantity < 0 && type !== 'inventory') {
        const newStock = ingredient.currentStock + quantity;
        if (newStock < 0) {
            console.warn(`⚠️ ВНИМАНИЕ: Остаток "${ingredient.name}" станет отрицательным: ${newStock} ${ingredient.unit}`);
            // Не блокируем операцию, только предупреждаем
        }
    }

    // Создание операции
    const now = new Date();
    const operation = {
        id: `OP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase(),
        type: type,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5),
        ingredientId: ingredientId,
        quantity: quantity,
        reason: reason,
        relatedSaleId: relatedSaleId,
        user: 'Администратор', // TODO: В будущем можно добавить систему пользователей
        notes: notes
    };

    // Сохранение операции
    const operations = getStockOperations();
    operations.unshift(operation); // Добавляем в начало (новые сверху)
    localStorage.setItem('kuchtanech_stock_operations', JSON.stringify(operations));

    // Обновление остатка ингредиента
    updateIngredientStock(ingredientId, quantity);

    const action = quantity > 0 ? 'Приход' : 'Расход';
    console.log(`✅ ${action}: ${ingredient.name} ${Math.abs(quantity)} ${ingredient.unit} (${OPERATION_TYPES[type]})`);

    return operation;
}

// ===== Автоматическое списание при продаже =====

// Главная функция: обработка ингредиентов для продажи
function processIngredientsForSale(sale) {
    if (!sale || !sale.items || sale.items.length === 0) {
        console.warn('⚠️ Продажа не содержит товаров');
        return [];
    }

    const operations = [];
    let totalIngredients = 0;

    try {
        // Для каждого товара в продаже
        sale.items.forEach(item => {
            const recipe = getRecipe(item.productId);

            if (!recipe) {
                console.log(`ℹ️ Нет рецепта для "${item.productId}" - пропускаем списание`);
                return; // Пропускаем товары без рецепта
            }

            const productName = window.PRODUCTS ? window.PRODUCTS[item.productId]?.name : item.productId;

            // Для каждого ингредиента в рецепте
            recipe.ingredients.forEach(ing => {
                const totalQty = ing.quantity * item.qty; // Умножаем на количество проданных единиц

                try {
                    // Создаём операцию списания
                    const operation = createStockOperation(
                        'sale',
                        ing.ingredientId,
                        -totalQty, // Отрицательное значение = расход
                        `Продажа: ${productName} x${item.qty}`,
                        `Чек: ${sale.id}`,
                        sale.id
                    );

                    operations.push(operation);
                    totalIngredients++;

                } catch (error) {
                    console.error(`❌ Ошибка списания ингредиента "${ing.ingredientId}":`, error.message);
                    // Не прерываем процесс, продолжаем со следующим ингредиентом
                }
            });
        });

        if (operations.length > 0) {
            console.log(`✅ Списано ${totalIngredients} ингредиентов для чека ${sale.id}`);
        }

        return operations;

    } catch (error) {
        console.error('❌ Критическая ошибка при списании ингредиентов:', error);
        return operations; // Возвращаем то, что успели обработать
    }
}

// ===== Фильтрация и поиск =====

// Получить операции за период
function getStockOperationsByPeriod(period) {
    const operations = getStockOperations();
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (period) {
        case 'today':
            return operations.filter(op => op.date === today);

        case 'yesterday':
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            return operations.filter(op => op.date === yesterday.toISOString().split('T')[0]);

        case 'week':
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return operations.filter(op => new Date(op.date) >= weekAgo);

        case 'month':
        default:
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return operations.filter(op => new Date(op.date) >= monthAgo);
    }
}

// Получить операции по ингредиенту
function getStockOperationsByIngredient(ingredientId) {
    const operations = getStockOperations();
    return operations.filter(op => op.ingredientId === ingredientId);
}

// Получить операции по типу
function getStockOperationsByType(type) {
    const operations = getStockOperations();
    return operations.filter(op => op.type === type);
}

// Получить операции по продаже (чеку)
function getStockOperationsBySale(saleId) {
    const operations = getStockOperations();
    return operations.filter(op => op.relatedSaleId === saleId);
}

// ===== Аналитика =====

// Прогноз запасов: на сколько дней хватит
function getStockForecast(ingredientId, days = 7) {
    const ingredient = getIngredient(ingredientId);
    if (!ingredient) {
        throw new Error(`Ингредиент "${ingredientId}" не найден`);
    }

    // Получаем операции продаж за последние 7 дней
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const operations = getStockOperations().filter(op =>
        op.ingredientId === ingredientId &&
        op.type === 'sale' &&
        new Date(op.date) >= weekAgo
    );

    // Рассчитываем общий расход
    const totalUsed = Math.abs(operations.reduce((sum, op) => sum + op.quantity, 0));

    // Средний расход в день
    const avgDailyUsage = totalUsed / 7;

    // Сколько дней хватит текущего остатка
    const daysLeft = avgDailyUsage > 0 ? ingredient.currentStock / avgDailyUsage : Infinity;

    // Рекомендуемое количество для закупки
    const recommendedQty = Math.max(0, (days * avgDailyUsage) - ingredient.currentStock);

    return {
        ingredientId: ingredientId,
        ingredientName: ingredient.name,
        currentStock: ingredient.currentStock,
        unit: ingredient.unit,
        avgDailyUsage: avgDailyUsage.toFixed(2),
        daysLeft: Math.floor(daysLeft),
        needPurchase: daysLeft < days,
        recommendedQty: Math.ceil(recommendedQty),
        targetDays: days
    };
}

// Отчёт по потерям (списаниям)
function getWasteReport(period = 'month') {
    const operations = getStockOperationsByPeriod(period)
        .filter(op => op.type === 'writeoff');

    const byIngredient = {};

    operations.forEach(op => {
        if (!byIngredient[op.ingredientId]) {
            const ing = getIngredient(op.ingredientId);
            byIngredient[op.ingredientId] = {
                ingredientId: op.ingredientId,
                ingredientName: ing.name,
                unit: ing.unit,
                totalQty: 0,
                totalCost: 0,
                operations: []
            };
        }

        const qty = Math.abs(op.quantity);
        const ingredient = getIngredient(op.ingredientId);
        const cost = qty * ingredient.purchasePrice;

        byIngredient[op.ingredientId].totalQty += qty;
        byIngredient[op.ingredientId].totalCost += cost;
        byIngredient[op.ingredientId].operations.push(op);
    });

    // Конвертируем в массив и сортируем по стоимости
    const report = Object.values(byIngredient)
        .sort((a, b) => b.totalCost - a.totalCost);

    const totalCost = report.reduce((sum, item) => sum + item.totalCost, 0);

    return {
        period: period,
        items: report,
        totalOperations: operations.length,
        totalCost: totalCost
    };
}

// Статистика операций за период
function getOperationsStats(period = 'month') {
    const operations = getStockOperationsByPeriod(period);

    const stats = {
        total: operations.length,
        byType: {
            purchase: 0,
            sale: 0,
            writeoff: 0,
            inventory: 0
        },
        totalPurchaseValue: 0,
        totalWasteValue: 0
    };

    operations.forEach(op => {
        stats.byType[op.type]++;

        const ingredient = getIngredient(op.ingredientId);
        if (!ingredient) return;

        const value = Math.abs(op.quantity) * ingredient.purchasePrice;

        if (op.type === 'purchase') {
            stats.totalPurchaseValue += value;
        } else if (op.type === 'writeoff') {
            stats.totalWasteValue += value;
        }
    });

    return stats;
}

// Топ-5 ингредиентов по расходу
function getTopUsedIngredients(period = 'month', limit = 5) {
    const operations = getStockOperationsByPeriod(period)
        .filter(op => op.type === 'sale');

    const usage = {};

    operations.forEach(op => {
        if (!usage[op.ingredientId]) {
            const ing = getIngredient(op.ingredientId);
            usage[op.ingredientId] = {
                ingredientId: op.ingredientId,
                ingredientName: ing.name,
                unit: ing.unit,
                totalQty: 0,
                totalValue: 0
            };
        }

        const qty = Math.abs(op.quantity);
        const ingredient = getIngredient(op.ingredientId);

        usage[op.ingredientId].totalQty += qty;
        usage[op.ingredientId].totalValue += qty * ingredient.purchasePrice;
    });

    return Object.values(usage)
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, limit);
}

// ===== Экспорт =====
export {
    OPERATION_TYPES,
    getStockOperations,
    createStockOperation,
    processIngredientsForSale,
    getStockOperationsByPeriod,
    getStockOperationsByIngredient,
    getStockOperationsByType,
    getStockOperationsBySale,
    getStockForecast,
    getWasteReport,
    getOperationsStats,
    getTopUsedIngredients
};
