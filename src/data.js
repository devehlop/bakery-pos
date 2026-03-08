// ===== Данные пекарни Кучтэнэч =====

const PRODUCTS = {
    'echpochmak': { name: 'Эчпочмак', emoji: '🥟', price: 65, category: 'national', cost: 38 },
    'elesh': { name: 'Элеш с курицей', emoji: '🥧', price: 120, category: 'national', cost: 74 },
    'gubadia': { name: 'Губадия (1 кг)', emoji: '🎂', price: 890, category: 'national', cost: 490 },
    'kystyby': { name: 'Кыстыбый', emoji: '🫓', price: 45, category: 'national', cost: 22 },
    'chak-chak': { name: 'Чак-чак', emoji: '🍯', price: 350, category: 'national', cost: 182 },
    'bread-white': { name: 'Хлеб белый', emoji: '🍞', price: 55, category: 'bread', cost: 36 },
    'bread-rye': { name: 'Хлеб ржаной', emoji: '🍞', price: 65, category: 'bread', cost: 40 },
    'baguette': { name: 'Багет', emoji: '🥖', price: 75, category: 'bread', cost: 45 },
    'croissant': { name: 'Круассан', emoji: '🥐', price: 95, category: 'pastry', cost: 43 },
    'muffin': { name: 'Маффин', emoji: '🧁', price: 85, category: 'pastry', cost: 36 },
    'pirog': { name: 'Пирог с яблоком', emoji: '🥧', price: 120, category: 'pastry', cost: 55 },
    'coffee': { name: 'Кофе американо', emoji: '☕', price: 120, category: 'drinks', cost: 42 },
    'latte': { name: 'Латте', emoji: '☕', price: 180, category: 'drinks', cost: 65 },
    'tea': { name: 'Чай', emoji: '🫖', price: 60, category: 'drinks', cost: 18 }
};

const CATEGORY_NAMES = {
    'national': 'Национальное',
    'bread': 'Хлеб',
    'pastry': 'Выпечка',
    'drinks': 'Напитки'
};

// Генерация моковых продаж
function generateMockSales() {
    const sales = JSON.parse(localStorage.getItem('kuchtanech_sales') || '[]');
    if (sales.length > 0) return sales;

    const productKeys = Object.keys(PRODUCTS);
    const paymentMethods = ['card', 'cash', 'sbp'];
    const mockSales = [];

    // Генерируем продажи за последние 30 дней
    for (let d = 0; d < 30; d++) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        const dateStr = date.toISOString().split('T')[0];

        // 10-25 продаж в день
        const salesCount = 10 + Math.floor(Math.random() * 15);

        for (let s = 0; s < salesCount; s++) {
            const hour = 8 + Math.floor(Math.random() * 12);
            const minute = Math.floor(Math.random() * 60);
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

            // 1-5 товаров в чеке
            const itemCount = 1 + Math.floor(Math.random() * 4);
            const items = [];

            for (let i = 0; i < itemCount; i++) {
                const productKey = productKeys[Math.floor(Math.random() * productKeys.length)];
                const qty = 1 + Math.floor(Math.random() * 3);
                items.push({ productId: productKey, qty });
            }

            mockSales.push({
                id: `CHK-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase(),
                date: dateStr,
                time: time,
                items: items,
                paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                total: items.reduce((sum, item) => sum + PRODUCTS[item.productId].price * item.qty, 0)
            });
        }
    }

    localStorage.setItem('kuchtanech_sales', JSON.stringify(mockSales));
    return mockSales;
}

// Получить все продажи
function getSales() {
    return generateMockSales();
}

// Добавить продажу
function addSale(sale) {
    const sales = getSales();
    sales.unshift(sale);
    localStorage.setItem('kuchtanech_sales', JSON.stringify(sales));
    return sale;
}

// Получить продажи за период
function getSalesByPeriod(period) {
    const sales = getSales();
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (period) {
        case 'today':
            return sales.filter(s => s.date === today);
        case 'yesterday':
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            return sales.filter(s => s.date === yesterday.toISOString().split('T')[0]);
        case 'week':
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return sales.filter(s => new Date(s.date) >= weekAgo);
        case 'month':
        default:
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return sales.filter(s => new Date(s.date) >= monthAgo);
    }
}

// Получить топ товаров
function getTopProducts(limit = 5) {
    const sales = getSalesByPeriod('month');
    const productStats = {};

    sales.forEach(sale => {
        sale.items.forEach(item => {
            if (!productStats[item.productId]) {
                productStats[item.productId] = { qty: 0, revenue: 0 };
            }
            productStats[item.productId].qty += item.qty;
            productStats[item.productId].revenue += PRODUCTS[item.productId].price * item.qty;
        });
    });

    return Object.entries(productStats)
        .map(([id, stats]) => ({
            id,
            name: PRODUCTS[id].name,
            emoji: PRODUCTS[id].emoji,
            ...stats
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);
}

// Статистика по категориям
function getCategoryStats() {
    const sales = getSalesByPeriod('month');
    const stats = { national: 0, bread: 0, pastry: 0, drinks: 0 };

    sales.forEach(sale => {
        sale.items.forEach(item => {
            const product = PRODUCTS[item.productId];
            stats[product.category] += product.price * item.qty;
        });
    });

    return stats;
}

// Статистика по часам
function getHourlyStats() {
    const sales = getSalesByPeriod('week');
    const hourly = Array(13).fill(0); // 8:00 - 20:00

    sales.forEach(sale => {
        const hour = parseInt(sale.time.split(':')[0]) - 8;
        if (hour >= 0 && hour < 13) {
            hourly[hour] += sale.total;
        }
    });

    return hourly;
}

// Статистика по дням недели
function getWeekdayStats() {
    const sales = getSalesByPeriod('month');
    const weekdays = Array(7).fill(0);

    sales.forEach(sale => {
        const day = new Date(sale.date).getDay();
        weekdays[day] += sale.total;
    });

    // Перемещаем воскресенье в конец
    return [...weekdays.slice(1), weekdays[0]];
}

// KPI дашборда
function getDashboardKPI() {
    const todaySales = getSalesByPeriod('today');
    const yesterdaySales = getSalesByPeriod('yesterday');

    const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
    const yesterdayRevenue = yesterdaySales.reduce((sum, s) => sum + s.total, 0);

    const todayOrders = todaySales.length;
    const yesterdayOrders = yesterdaySales.length;

    const avgCheck = todayOrders > 0 ? Math.round(todayRevenue / todayOrders) : 0;
    const yesterdayAvgCheck = yesterdayOrders > 0 ? Math.round(yesterdayRevenue / yesterdayOrders) : 0;

    const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1) : 0;

    return {
        revenue: todayRevenue,
        revenueChange,
        orders: todayOrders,
        ordersChange: todayOrders - yesterdayOrders,
        avgCheck,
        avgCheckChange: avgCheck - yesterdayAvgCheck,
        waste: 3.2
    };
}

// Данные для графика продаж за неделю
function getWeeklySalesData() {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const revenue = [];
    const orders = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const daySales = getSales().filter(s => s.date === dateStr);
        revenue.push(daySales.reduce((sum, s) => sum + s.total, 0));
        orders.push(daySales.length);
    }

    return { labels: days, revenue, orders };
}

// Экспорт данных
export {
    PRODUCTS,
    CATEGORY_NAMES,
    getSales,
    addSale,
    getSalesByPeriod,
    getTopProducts,
    getCategoryStats,
    getHourlyStats,
    getWeekdayStats,
    getDashboardKPI,
    getWeeklySalesData
};
