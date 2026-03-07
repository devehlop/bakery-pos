// ===== POS System - Kuchtanech Bakery =====

let currentOrder = [];
let orderNumber = 1;
let currentDiscount = 0;
let selectedProduct = null;
let numpadValue = '';
let cashValue = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initPOS();
});

function initPOS() {
    loadOrderNumber();
    renderProducts('national');
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('currentTime').textContent = time;
}

function loadOrderNumber() {
    const saved = localStorage.getItem('kuchtanech_order_number');
    orderNumber = saved ? parseInt(saved) : 1;
    document.getElementById('orderNumber').textContent = orderNumber.toString().padStart(3, '0');
}

function saveOrderNumber() {
    localStorage.setItem('kuchtanech_order_number', orderNumber.toString());
}

// ===== Category Selection =====
function selectCategory(category) {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    renderProducts(category);
}

// ===== Render Products =====
function renderProducts(category) {
    const grid = document.getElementById('productsGrid');
    let products = Object.entries(PRODUCTS);

    if (category !== 'all') {
        products = products.filter(([id, p]) => p.category === category);
    }

    grid.innerHTML = products.map(([id, product]) => `
        <div class="product-card" onclick="showQtyModal('${id}')">
            <span class="product-icon">${product.emoji}</span>
            <span class="product-name">${product.name}</span>
            <span class="product-price">${product.price} ₽</span>
        </div>
    `).join('');
}

// ===== Quantity Modal =====
function showQtyModal(productId) {
    selectedProduct = productId;
    const product = PRODUCTS[productId];

    document.getElementById('modalProductIcon').textContent = product.emoji;
    document.getElementById('modalProductName').textContent = product.name;
    document.getElementById('modalProductPrice').textContent = product.price + ' ₽';

    numpadValue = '1';
    document.getElementById('qtyDisplay').textContent = '1';
    document.getElementById('qtyModal').classList.remove('hidden');
}

function closeQtyModal() {
    document.getElementById('qtyModal').classList.add('hidden');
    selectedProduct = null;
    numpadValue = '';
}

function numpadInput(num) {
    if (numpadValue === '0' || numpadValue === '') {
        numpadValue = num.toString();
    } else if (numpadValue.length < 2) {
        numpadValue += num.toString();
    }
    document.getElementById('qtyDisplay').textContent = numpadValue || '0';
}

function numpadClear() {
    numpadValue = '';
    document.getElementById('qtyDisplay').textContent = '0';
}

function numpadBackspace() {
    numpadValue = numpadValue.slice(0, -1);
    document.getElementById('qtyDisplay').textContent = numpadValue || '0';
}

function confirmQty() {
    const qty = parseInt(numpadValue) || 1;
    if (qty > 0 && selectedProduct) {
        addToOrder(selectedProduct, qty);
    }
    closeQtyModal();
}

// ===== Order Management =====
function addToOrder(productId, qty) {
    const existing = currentOrder.find(item => item.productId === productId);

    if (existing) {
        existing.qty += qty;
    } else {
        currentOrder.push({ productId, qty });
    }

    renderOrder();
    playSound('add');
}

function updateQty(productId, delta) {
    const item = currentOrder.find(i => i.productId === productId);
    if (!item) return;

    item.qty += delta;

    if (item.qty <= 0) {
        currentOrder = currentOrder.filter(i => i.productId !== productId);
    }

    renderOrder();
}

function clearOrder() {
    if (currentOrder.length === 0) return;

    if (confirm('Очистить заказ?')) {
        currentOrder = [];
        currentDiscount = 0;
        renderOrder();
    }
}

function renderOrder() {
    const container = document.getElementById('orderItems');

    if (currentOrder.length === 0) {
        container.innerHTML = `
            <div class="empty-order">
                <span class="empty-icon">🛒</span>
                <p>Выберите товары</p>
            </div>
        `;
    } else {
        container.innerHTML = currentOrder.map(item => {
            const product = PRODUCTS[item.productId];
            const total = product.price * item.qty;
            return `
                <div class="order-item">
                    <span class="item-icon">${product.emoji}</span>
                    <div class="item-info">
                        <div class="item-name">${product.name}</div>
                        <div class="item-price">${product.price} ₽ × ${item.qty}</div>
                    </div>
                    <div class="item-qty">
                        <button class="qty-btn minus" onclick="updateQty('${item.productId}', -1)">−</button>
                        <span class="qty-value">${item.qty}</span>
                        <button class="qty-btn plus" onclick="updateQty('${item.productId}', 1)">+</button>
                    </div>
                    <span class="item-total">${formatMoney(total)}</span>
                </div>
            `;
        }).join('');
    }

    updateTotals();
}

function updateTotals() {
    const totalQty = currentOrder.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = currentOrder.reduce((sum, i) => sum + PRODUCTS[i.productId].price * i.qty, 0);
    const discountAmount = Math.round(subtotal * currentDiscount / 100);
    const total = subtotal - discountAmount;

    document.getElementById('totalQty').textContent = totalQty;
    document.getElementById('subtotal').textContent = formatMoney(subtotal);
    document.getElementById('totalAmount').textContent = formatMoney(total);

    const discountRow = document.getElementById('discountRow');
    if (currentDiscount > 0) {
        discountRow.classList.remove('hidden');
        document.getElementById('discountAmount').textContent = '-' + formatMoney(discountAmount);
    } else {
        discountRow.classList.add('hidden');
    }
}

function formatMoney(amount) {
    return amount.toLocaleString('ru-RU') + ' ₽';
}

// ===== Discount =====
function applyDiscount() {
    if (currentOrder.length === 0) {
        alert('Сначала добавьте товары в заказ');
        return;
    }
    document.getElementById('discountModal').classList.remove('hidden');
}

function closeDiscountModal() {
    document.getElementById('discountModal').classList.add('hidden');
}

function setDiscount(percent) {
    currentDiscount = percent;
    updateTotals();
    closeDiscountModal();
    playSound('add');
}

function removeDiscount() {
    currentDiscount = 0;
    updateTotals();
    closeDiscountModal();
}

// ===== Comment =====
function addComment() {
    const comment = prompt('Комментарий к заказу:');
    if (comment) {
        alert('Комментарий добавлен: ' + comment);
    }
}

// ===== Payment =====
function processPayment(method) {
    if (currentOrder.length === 0) {
        alert('Заказ пуст!');
        return;
    }

    const subtotal = currentOrder.reduce((sum, i) => sum + PRODUCTS[i.productId].price * i.qty, 0);
    const discountAmount = Math.round(subtotal * currentDiscount / 100);
    const total = subtotal - discountAmount;

    if (method === 'cash') {
        showCashModal(total);
    } else {
        // Card or SBP - instant success
        completeSale(method, total, 0);
    }
}

// ===== Cash Modal =====
function showCashModal(total) {
    cashValue = '';
    document.getElementById('cashTotal').textContent = formatMoney(total);
    document.getElementById('cashReceived').textContent = '0 ₽';
    document.getElementById('cashChange').textContent = '0 ₽';
    document.getElementById('confirmCashBtn').disabled = true;
    document.getElementById('cashModal').classList.remove('hidden');
}

function closeCashModal() {
    document.getElementById('cashModal').classList.add('hidden');
    cashValue = '';
}

function cashNumpad(num) {
    if (cashValue.length < 5) {
        cashValue += num.toString();
        updateCashDisplay();
    }
}

function cashClear() {
    cashValue = '';
    updateCashDisplay();
}

function cashBackspace() {
    cashValue = cashValue.slice(0, -1);
    updateCashDisplay();
}

function quickCash(amount) {
    cashValue = amount.toString();
    updateCashDisplay();
}

function updateCashDisplay() {
    const received = parseInt(cashValue) || 0;
    const subtotal = currentOrder.reduce((sum, i) => sum + PRODUCTS[i.productId].price * i.qty, 0);
    const discountAmount = Math.round(subtotal * currentDiscount / 100);
    const total = subtotal - discountAmount;
    const change = received - total;

    document.getElementById('cashReceived').textContent = formatMoney(received);
    document.getElementById('cashChange').textContent = formatMoney(Math.max(0, change));

    const confirmBtn = document.getElementById('confirmCashBtn');
    confirmBtn.disabled = received < total;

    if (received >= total) {
        document.getElementById('cashChangeRow').style.borderColor = '#10b981';
    } else {
        document.getElementById('cashChangeRow').style.borderColor = 'var(--pos-border)';
    }
}

function confirmCashPayment() {
    const received = parseInt(cashValue) || 0;
    const subtotal = currentOrder.reduce((sum, i) => sum + PRODUCTS[i.productId].price * i.qty, 0);
    const discountAmount = Math.round(subtotal * currentDiscount / 100);
    const total = subtotal - discountAmount;
    const change = received - total;

    closeCashModal();
    completeSale('cash', total, change);
}

// ===== Complete Sale =====
function completeSale(method, total, change) {
    // Save to localStorage
    const sale = {
        id: 'CHK-' + orderNumber.toString().padStart(3, '0'),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        items: currentOrder.map(i => ({ productId: i.productId, qty: i.qty })),
        paymentMethod: method,
        discount: currentDiscount,
        total: total
    };

    // Add to existing sales
    const sales = JSON.parse(localStorage.getItem('kuchtanech_sales') || '[]');
    sales.unshift(sale);
    localStorage.setItem('kuchtanech_sales', JSON.stringify(sales));

    // 🆕 НОВОЕ: Автоматическое списание ингредиентов
    if (typeof processIngredientsForSale === 'function') {
        try {
            processIngredientsForSale(sale);
        } catch (error) {
            console.error('Ошибка при списании ингредиентов:', error);
            // Не блокируем продажу при ошибке списания
        }
    }

    // Show success
    document.getElementById('successOrderId').textContent = '#' + orderNumber.toString().padStart(3, '0');
    document.getElementById('successAmount').textContent = formatMoney(total);

    if (change > 0) {
        document.getElementById('successChange').classList.remove('hidden');
        document.getElementById('successChangeAmount').textContent = formatMoney(change);
    } else {
        document.getElementById('successChange').classList.add('hidden');
    }

    document.getElementById('successModal').classList.remove('hidden');
    playSound('success');

    // Increment order number
    orderNumber++;
    saveOrderNumber();
}

function newOrder() {
    document.getElementById('successModal').classList.add('hidden');
    currentOrder = [];
    currentDiscount = 0;
    renderOrder();
    document.getElementById('orderNumber').textContent = orderNumber.toString().padStart(3, '0');
}

// ===== Sound Effects =====
function playSound(type) {
    // Simple beep using Web Audio API
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'add') {
            oscillator.frequency.value = 800;
            gain.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.05);
        } else if (type === 'success') {
            oscillator.frequency.value = 600;
            gain.gain.value = 0.1;
            oscillator.start();
            setTimeout(() => {
                oscillator.frequency.value = 800;
            }, 100);
            oscillator.stop(ctx.currentTime + 0.2);
        }
    } catch (e) {
        // Audio not supported
    }
}

// Export functions for onclick handlers
window.selectCategory = selectCategory;
window.showQtyModal = showQtyModal;
window.closeQtyModal = closeQtyModal;
window.numpadInput = numpadInput;
window.numpadClear = numpadClear;
window.numpadBackspace = numpadBackspace;
window.confirmQty = confirmQty;
window.updateQty = updateQty;
window.clearOrder = clearOrder;
window.applyDiscount = applyDiscount;
window.closeDiscountModal = closeDiscountModal;
window.setDiscount = setDiscount;
window.removeDiscount = removeDiscount;
window.addComment = addComment;
window.processPayment = processPayment;
window.closeCashModal = closeCashModal;
window.cashNumpad = cashNumpad;
window.cashClear = cashClear;
window.cashBackspace = cashBackspace;
window.quickCash = quickCash;
window.confirmCashPayment = confirmCashPayment;
window.newOrder = newOrder;
