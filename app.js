// ===== Общие функции =====

// Установка текущей даты
function setCurrentDate() {
    const el = document.getElementById('currentDate');
    if (el) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        el.textContent = new Date().toLocaleDateString('ru-RU', options);
    }
}

// Мобильное меню
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    if (btn && sidebar) {
        btn.addEventListener('click', () => sidebar.classList.toggle('open'));
    }
}

// Форматирование числа
function formatNumber(num) {
    return num.toLocaleString('ru-RU');
}

// ===== ДАШБОРД =====
function initDashboard() {
    setCurrentDate();
    initMobileMenu();
    renderDashboardKPI();
    renderTopProducts();
    renderRecentOrders();
    initDashboardCharts();
    initFilters();
}

function renderDashboardKPI() {
    const kpi = getDashboardKPI();

    document.getElementById('revenueValue').textContent = formatNumber(kpi.revenue) + ' ₽';
    document.getElementById('ordersValue').textContent = kpi.orders;
    document.getElementById('avgCheckValue').textContent = kpi.avgCheck + ' ₽';
    document.getElementById('wasteValue').textContent = kpi.waste + '%';
}

function renderTopProducts() {
    const container = document.getElementById('topProducts');
    if (!container) return;

    const products = getTopProducts(5);
    container.innerHTML = products.map((p, i) => `
        <div class="product-item">
            <div class="product-info">
                <span class="product-rank">${i + 1}</span>
                <span class="product-name">${p.emoji} ${p.name}</span>
            </div>
            <div class="product-stats">
                <div class="product-sales">${formatNumber(p.revenue)} ₽</div>
                <div class="product-count">${p.qty} шт</div>
            </div>
        </div>
    `).join('');
}

function renderRecentOrders() {
    const container = document.getElementById('recentOrders');
    if (!container) return;

    const sales = getSalesByPeriod('today').slice(0, 5);
    container.innerHTML = sales.map(s => {
        const items = s.items.map(i => `${PRODUCTS[i.productId].name}${i.qty > 1 ? ' x' + i.qty : ''}`).join(', ');
        return `
            <div class="activity-item">
                <span class="activity-time">${s.time}</span>
                <div class="activity-details">
                    <div class="activity-items">${items.length > 40 ? items.substring(0, 40) + '...' : items}</div>
                </div>
                <span class="activity-amount">${formatNumber(s.total)} ₽</span>
            </div>
        `;
    }).join('');
}

function initDashboardCharts() {
    Chart.defaults.color = '#9ca3af';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.08)';

    // Показываем мини-статистику вместо графика
    renderMiniStats();

    // Категории (маленький график - загружаем сразу)
    const catStats = getCategoryStats();
    new Chart(document.getElementById('categoryChart'), {
        type: 'doughnut',
        data: {
            labels: Object.values(CATEGORY_NAMES),
            datasets: [{
                data: Object.values(catStats),
                backgroundColor: ['#10b981', '#f59e0b', '#ec4899', '#3b82f6'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, cutout: '70%', plugins: { legend: { position: 'bottom' } } }
    });

    // По часам
    new Chart(document.getElementById('hourlyChart'), {
        type: 'bar',
        data: {
            labels: ['8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
            datasets: [{
                data: getHourlyStats(),
                backgroundColor: (ctx) => ctx.dataIndex >= 4 && ctx.dataIndex <= 6 ? '#f59e0b' : 'rgba(245, 158, 11, 0.3)',
                borderRadius: 4
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { grid: { display: false } } } }
    });
}

// Мини-статистика для компактного вида
function renderMiniStats() {
    const salesData = getWeeklySalesData();
    const weekTotal = salesData.revenue.reduce((a, b) => a + b, 0);
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const maxDay = salesData.revenue.indexOf(Math.max(...salesData.revenue));

    // Тренд: сравниваем последние 3 дня с первыми 3
    const firstHalf = salesData.revenue.slice(0, 3).reduce((a, b) => a + b, 0);
    const secondHalf = salesData.revenue.slice(4).reduce((a, b) => a + b, 0);
    const trendPercent = firstHalf > 0 ? Math.round((secondHalf - firstHalf) / firstHalf * 100) : 0;

    document.getElementById('weekRevenue').textContent = formatNumber(weekTotal) + ' ₽';
    document.getElementById('bestDay').textContent = days[maxDay];

    const trendEl = document.getElementById('weekTrend');
    trendEl.textContent = (trendPercent >= 0 ? '+' : '') + trendPercent + '%';
    trendEl.className = 'mini-stat-value ' + (trendPercent >= 0 ? 'trend-up' : 'trend-down');
}

// Ленивая загрузка графика по клику
let salesChartLoaded = false;
function loadSalesChart() {
    if (salesChartLoaded) {
        // Скрыть/показать график
        const container = document.getElementById('chartContainer');
        const btn = document.getElementById('loadChartBtn');
        if (container.classList.contains('hidden')) {
            container.classList.remove('hidden');
            btn.textContent = 'Скрыть график';
        } else {
            container.classList.add('hidden');
            btn.textContent = 'Показать график';
        }
        return;
    }

    // Загружаем график
    const btn = document.getElementById('loadChartBtn');
    btn.textContent = 'Загрузка...';
    btn.disabled = true;

    // Имитация загрузки (для демо)
    setTimeout(() => {
        const salesData = getWeeklySalesData();
        new Chart(document.getElementById('salesChart'), {
            type: 'line',
            data: {
                labels: salesData.labels,
                datasets: [{
                    label: 'Выручка',
                    data: salesData.revenue,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { display: false },
                    x: { ticks: { font: { size: 9 } }, grid: { display: false } }
                }
            }
        });

        document.getElementById('chartContainer').classList.remove('hidden');
        btn.textContent = 'Скрыть график';
        btn.disabled = false;
        salesChartLoaded = true;
    }, 300);
}

window.loadSalesChart = loadSalesChart;

function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// ===== СТРАНИЦА ДОБАВЛЕНИЯ ПРОДАЖИ =====
let cart = [];

function initAddSale() {
    initMobileMenu();

    // Установка текущей даты/времени
    const now = new Date();
    document.getElementById('saleDate').value = now.toISOString().split('T')[0];
    document.getElementById('saleTime').value = now.toTimeString().slice(0, 5);

    // Добавление товара в корзину
    document.getElementById('addProductBtn').addEventListener('click', addToCart);

    // Отправка формы
    document.getElementById('saleForm').addEventListener('submit', submitSale);

    // Очистка
    document.getElementById('clearFormBtn').addEventListener('click', clearCart);

    renderCart();
}

function addToCart() {
    const select = document.getElementById('productSelect');
    const qtyInput = document.getElementById('productQty');

    if (!select.value) return;

    const productId = select.value;
    const qty = parseInt(qtyInput.value) || 1;

    const existing = cart.find(i => i.productId === productId);
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ productId, qty });
    }

    select.value = '';
    qtyInput.value = 1;
    renderCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cartItems');

    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart">Добавьте товары в заказ</div>';
    } else {
        container.innerHTML = cart.map((item, i) => {
            const product = PRODUCTS[item.productId];
            return `
                <div class="cart-item">
                    <span class="cart-item-name">${product.emoji} ${product.name}</span>
                    <span class="cart-item-qty">x${item.qty}</span>
                    <span class="cart-item-price">${formatNumber(product.price * item.qty)} ₽</span>
                    <button type="button" class="cart-item-remove" onclick="removeFromCart(${i})">×</button>
                </div>
            `;
        }).join('');
    }

    // Обновление итогов
    const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
    const totalAmount = cart.reduce((sum, i) => sum + PRODUCTS[i.productId].price * i.qty, 0);

    document.getElementById('totalItems').textContent = totalItems + ' шт';
    document.getElementById('totalAmount').textContent = formatNumber(totalAmount) + ' ₽';
}

function clearCart() {
    cart = [];
    renderCart();
}

function submitSale(e) {
    e.preventDefault();

    if (cart.length === 0) {
        alert('Добавьте товары в заказ');
        return;
    }

    const sale = {
        id: 'CHK-' + Date.now().toString(36).toUpperCase(),
        date: document.getElementById('saleDate').value,
        time: document.getElementById('saleTime').value,
        items: [...cart],
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
        total: cart.reduce((sum, i) => sum + PRODUCTS[i.productId].price * i.qty, 0)
    };

    addSale(sale);

    // Показать успех
    document.getElementById('successDetails').textContent =
        `Чек ${sale.id} на сумму ${formatNumber(sale.total)} ₽`;
    document.getElementById('successModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('successModal').classList.add('hidden');
}

function newSale() {
    closeModal();
    clearCart();
    document.getElementById('saleTime').value = new Date().toTimeString().slice(0, 5);
}

// ===== СТРАНИЦА ПРОДАЖ =====
function initSalesPage() {
    setCurrentDate();
    initMobileMenu();
    renderSalesTable();
    initSalesFilters();
}

function renderSalesTable(filter = 'month') {
    const container = document.getElementById('salesTableBody');
    if (!container) return;

    const sales = getSalesByPeriod(filter);
    const paymentIcons = { card: '💳', cash: '💵', sbp: '📱' };

    container.innerHTML = sales.slice(0, 30).map(s => {
        const items = s.items.map(i => `${PRODUCTS[i.productId].emoji}${i.qty > 1 ? 'x' + i.qty : ''}`).join(' ');
        return `
            <tr>
                <td><code>${s.id}</code></td>
                <td>${s.date} ${s.time}</td>
                <td>${items}</td>
                <td><strong>${formatNumber(s.total)} ₽</strong></td>
                <td>${paymentIcons[s.paymentMethod]}</td>
                <td><button class="btn btn-sm btn-ghost">👁</button></td>
            </tr>
        `;
    }).join('');

    // Обновить сводку
    document.getElementById('totalSalesCount').textContent = sales.length;
    document.getElementById('totalSalesRevenue').textContent = formatNumber(sales.reduce((s, sale) => s + sale.total, 0)) + ' ₽';
    document.getElementById('avgCheck').textContent = sales.length ? formatNumber(Math.round(sales.reduce((s, sale) => s + sale.total, 0) / sales.length)) + ' ₽' : '0 ₽';
}

function initSalesFilters() {
    document.getElementById('dateFilter')?.addEventListener('change', (e) => {
        renderSalesTable(e.target.value);
    });
}

// ===== СТРАНИЦА ТОВАРОВ =====
function initProductsPage() {
    initMobileMenu();
    renderProductsTable();
    initProductFilters();
}

function renderProductsTable(category = 'all') {
    const container = document.getElementById('productsTableBody');
    if (!container) return;

    const sales = getSalesByPeriod('month');
    const productStats = {};

    // Собираем статистику
    Object.entries(PRODUCTS).forEach(([id, p]) => {
        productStats[id] = { sold: 0, revenue: 0 };
    });

    sales.forEach(sale => {
        sale.items.forEach(item => {
            productStats[item.productId].sold += item.qty;
            productStats[item.productId].revenue += PRODUCTS[item.productId].price * item.qty;
        });
    });

    let products = Object.entries(PRODUCTS);
    if (category !== 'all') {
        products = products.filter(([id, p]) => p.category === category);
    }

    container.innerHTML = products.map(([id, p]) => {
        const stats = productStats[id];
        const margin = Math.round((p.price - p.cost) / p.price * 100);
        const trend = stats.sold > 50 ? 'up' : stats.sold < 20 ? 'down' : 'stable';

        return `
            <tr>
                <td><div class="product-cell"><span class="product-emoji">${p.emoji}</span>${p.name}</div></td>
                <td><span class="category-badge ${p.category}">${CATEGORY_NAMES[p.category]}</span></td>
                <td>${p.price} ₽</td>
                <td>${stats.sold} шт</td>
                <td>${formatNumber(stats.revenue)} ₽</td>
                <td>${margin}%</td>
                <td><span class="trend-indicator ${trend}">${trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</span></td>
            </tr>
        `;
    }).join('');
}

function initProductFilters() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProductsTable(btn.dataset.category);
        });
    });

    document.getElementById('productSearch')?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('#productsTableBody tr').forEach(row => {
            const name = row.querySelector('.product-cell')?.textContent.toLowerCase() || '';
            row.style.display = name.includes(query) ? '' : 'none';
        });
    });
}

// ===== СТРАНИЦА ОТЧЁТОВ =====
function initReportsPage() {
    initMobileMenu();
    initReportCards();
    setDefaultDates();
    initExport();
}

function initReportCards() {
    document.querySelectorAll('.report-card').forEach(card => {
        card.addEventListener('click', () => {
            const reportType = card.dataset.report;
            showReportForm(reportType);
        });
    });
}

function showReportForm(type) {
    const titles = {
        daily: 'Дневной отчёт',
        weekly: 'Недельный отчёт',
        monthly: 'Месячный отчёт',
        products: 'Отчёт по товарам',
        waste: 'Отчёт по списаниям',
        custom: 'Произвольный отчёт'
    };

    document.getElementById('reportFormTitle').textContent = titles[type] || 'Отчёт';
    document.getElementById('reportForm').classList.remove('hidden');
    document.getElementById('reportForm').scrollIntoView({ behavior: 'smooth' });
}

function hideReportForm() {
    document.getElementById('reportForm').classList.add('hidden');
}

function setDefaultDates() {
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const fromEl = document.getElementById('reportDateFrom');
    const toEl = document.getElementById('reportDateTo');

    if (fromEl) fromEl.value = monthAgo.toISOString().split('T')[0];
    if (toEl) toEl.value = today.toISOString().split('T')[0];
}

function initExport() {
    document.getElementById('generateReportBtn')?.addEventListener('click', generateReport);
}

function generateReport() {
    const format = document.querySelector('input[name="exportFormat"]:checked').value;
    const dateFrom = document.getElementById('reportDateFrom').value;
    const dateTo = document.getElementById('reportDateTo').value;

    const sales = getSales().filter(s => s.date >= dateFrom && s.date <= dateTo);

    if (format === 'csv') {
        exportToCSV(sales, dateFrom, dateTo);
    } else if (format === 'excel') {
        exportToExcel(sales, dateFrom, dateTo);
    } else {
        exportToPDF(sales, dateFrom, dateTo);
    }
}

function exportToCSV(sales, dateFrom, dateTo) {
    let csv = 'Чек;Дата;Время;Товары;Сумма;Оплата\n';

    sales.forEach(s => {
        const items = s.items.map(i => `${PRODUCTS[i.productId].name} x${i.qty}`).join(', ');
        csv += `${s.id};${s.date};${s.time};"${items}";${s.total};${s.paymentMethod}\n`;
    });

    downloadFile(csv, `kuchtanech_${dateFrom}_${dateTo}.csv`, 'text/csv;charset=utf-8');
    alert('✅ Отчёт CSV скачан!');
}

function exportToExcel(sales, dateFrom, dateTo) {
    // Простой HTML-таблица как Excel
    let html = `
        <html><head><meta charset="UTF-8"></head><body>
        <h1>Пекарня Кучтэнэч — Отчёт</h1>
        <p>Период: ${dateFrom} — ${dateTo}</p>
        <table border="1">
            <tr><th>Чек</th><th>Дата</th><th>Время</th><th>Товары</th><th>Сумма</th><th>Оплата</th></tr>
    `;

    sales.forEach(s => {
        const items = s.items.map(i => `${PRODUCTS[i.productId].name} x${i.qty}`).join(', ');
        html += `<tr><td>${s.id}</td><td>${s.date}</td><td>${s.time}</td><td>${items}</td><td>${s.total}</td><td>${s.paymentMethod}</td></tr>`;
    });

    html += `</table>
        <p><strong>Итого:</strong> ${sales.length} чеков, ${formatNumber(sales.reduce((s, sale) => s + sale.total, 0))} ₽</p>
        </body></html>`;

    downloadFile(html, `kuchtanech_${dateFrom}_${dateTo}.xls`, 'application/vnd.ms-excel');
    alert('✅ Отчёт Excel скачан!');
}

function exportToPDF(sales, dateFrom, dateTo) {
    // Генерируем printable HTML и открываем для печати
    const totalRevenue = sales.reduce((s, sale) => s + sale.total, 0);

    let html = `
        <!DOCTYPE html>
        <html><head>
        <meta charset="UTF-8">
        <title>Отчёт Кучтэнэч</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #f59e0b; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f59e0b; color: white; }
            .summary { background: #fef3c7; padding: 20px; border-radius: 8px; margin-top: 20px; }
        </style>
        </head><body>
        <h1>🥐 Пекарня Кучтэнэч</h1>
        <h2>Отчёт за период: ${dateFrom} — ${dateTo}</h2>
        
        <div class="summary">
            <p><strong>Всего чеков:</strong> ${sales.length}</p>
            <p><strong>Общая выручка:</strong> ${formatNumber(totalRevenue)} ₽</p>
            <p><strong>Средний чек:</strong> ${sales.length ? formatNumber(Math.round(totalRevenue / sales.length)) : 0} ₽</p>
        </div>
        
        <h3>Детализация продаж</h3>
        <table>
            <tr><th>№</th><th>Чек</th><th>Дата</th><th>Время</th><th>Сумма</th></tr>
    `;

    sales.slice(0, 100).forEach((s, i) => {
        html += `<tr><td>${i + 1}</td><td>${s.id}</td><td>${s.date}</td><td>${s.time}</td><td>${s.total} ₽</td></tr>`;
    });

    html += `</table></body></html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob(['\uFEFF' + content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// Экспорт глобальных функций
window.removeFromCart = removeFromCart;
window.closeModal = closeModal;
window.newSale = newSale;
window.hideReportForm = hideReportForm;
