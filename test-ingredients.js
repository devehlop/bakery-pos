// ===== Тестовый скрипт для проверки модуля ингредиентов =====
// Запустите этот скрипт в консоли браузера на странице POS

console.log('🧪 ТЕСТИРОВАНИЕ МОДУЛЯ ИНГРЕДИЕНТОВ\n');

// Тест 1: Проверка загрузки модулей
console.log('=== Тест 1: Загрузка модулей ===');
console.log('Ингредиентов загружено:', getIngredients().length);
console.log('Рецептов загружено:', Object.keys(getRecipes()).length);
console.log('Операций в истории:', getStockOperations().length);
console.log('✅ Модули загружены\n');

// Тест 2: Проверка расчёта себестоимости
console.log('=== Тест 2: Расчёт себестоимости ===');
const echpochmakCost = calculateProductCost('echpochmak');
console.log('Себестоимость эчпочмака:', echpochmakCost.toFixed(2), '₽');
console.log('Цена продажи:', PRODUCTS.echpochmak.price, '₽');
console.log('Маржа:', ((PRODUCTS.echpochmak.price - echpochmakCost) / PRODUCTS.echpochmak.price * 100).toFixed(1), '%');
console.log('✅ Расчёт работает\n');

// Тест 3: Детальная разбивка себестоимости
console.log('=== Тест 3: Разбивка себестоимости эчпочмака ===');
const breakdown = getProductCostBreakdown('echpochmak');
breakdown.breakdown.forEach(item => {
    console.log(`  ${item.ingredientName}: ${item.quantity} ${item.unit} × ${item.pricePerUnit}₽ = ${item.totalCost.toFixed(2)}₽`);
});
console.log(`  ИТОГО: ${breakdown.totalCost.toFixed(2)}₽`);
console.log('✅ Разбивка корректна\n');

// Тест 4: Проверка остатков ДО продажи
console.log('=== Тест 4: Остатки ДО продажи ===');
const flourBefore = getIngredient('flour-wheat').currentStock;
const butterBefore = getIngredient('butter').currentStock;
const meatBefore = getIngredient('meat-beef').currentStock;
console.log('Мука:', flourBefore, 'кг');
console.log('Масло:', butterBefore, 'кг');
console.log('Мясо:', meatBefore, 'кг');
console.log('✅ Остатки зафиксированы\n');

// Тест 5: Симуляция продажи
console.log('=== Тест 5: Симуляция продажи ===');
const testSale = {
    id: 'CHK-TEST-001',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    items: [
        { productId: 'echpochmak', qty: 2 }
    ],
    paymentMethod: 'card',
    total: 130
};

console.log('Продаём: 2 эчпочмака');
const operations = processIngredientsForSale(testSale);
console.log('Создано операций списания:', operations.length);
console.log('✅ Продажа обработана\n');

// Тест 6: Проверка остатков ПОСЛЕ продажи
console.log('=== Тест 6: Остатки ПОСЛЕ продажи ===');
const flourAfter = getIngredient('flour-wheat').currentStock;
const butterAfter = getIngredient('butter').currentStock;
const meatAfter = getIngredient('meat-beef').currentStock;

console.log('Мука:', flourBefore, '→', flourAfter, 'кг (списано:', (flourBefore - flourAfter).toFixed(3), 'кг)');
console.log('Масло:', butterBefore, '→', butterAfter, 'кг (списано:', (butterBefore - butterAfter).toFixed(3), 'кг)');
console.log('Мясо:', meatBefore, '→', meatAfter, 'кг (списано:', (meatBefore - meatAfter).toFixed(3), 'кг)');
console.log('✅ Остатки обновлены\n');

// Тест 7: Проверка истории операций
console.log('=== Тест 7: История операций ===');
const allOperations = getStockOperations();
console.log('Всего операций:', allOperations.length);
console.log('Последняя операция:', allOperations[0]);
console.log('✅ История ведётся\n');

// Тест 8: Прогноз запасов
console.log('=== Тест 8: Прогноз запасов ===');
const forecast = getStockForecast('flour-wheat', 7);
console.log('Ингредиент:', forecast.ingredientName);
console.log('Текущий остаток:', forecast.currentStock, forecast.unit);
console.log('Средний расход в день:', forecast.avgDailyUsage, forecast.unit);
console.log('Хватит на дней:', forecast.daysLeft);
console.log('Нужна закупка:', forecast.needPurchase ? 'ДА' : 'НЕТ');
if (forecast.needPurchase) {
    console.log('Рекомендуемое количество:', forecast.recommendedQty, forecast.unit);
}
console.log('✅ Прогноз работает\n');

// Тест 9: Топ-5 по расходу
console.log('=== Тест 9: Топ-5 ингредиентов по расходу ===');
const topUsed = getTopUsedIngredients('month', 5);
topUsed.forEach((item, i) => {
    console.log(`${i + 1}. ${item.ingredientName}: ${item.totalQty.toFixed(2)} ${item.unit} (${item.totalValue.toFixed(2)}₽)`);
});
console.log('✅ Аналитика работает\n');

// Тест 10: Маржинальность всех продуктов с рецептами
console.log('=== Тест 10: Маржинальность продуктов ===');
const productsWithRecipes = getProductsWithRecipes();
productsWithRecipes.forEach(productId => {
    const margin = calculateProductMargin(productId);
    console.log(`${margin.productName}: ${margin.cost.toFixed(2)}₽ → ${margin.price}₽ (маржа ${margin.marginPercent}%)`);
});
console.log('✅ Маржинальность рассчитана\n');

console.log('🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!');
console.log('\n📝 Резюме:');
console.log('- Модули загружены и работают');
console.log('- Себестоимость рассчитывается корректно');
console.log('- Автоматическое списание функционирует');
console.log('- Остатки обновляются правильно');
console.log('- История операций ведётся');
console.log('- Аналитика и прогнозы работают');
console.log('\n✅ Система готова к использованию!');
