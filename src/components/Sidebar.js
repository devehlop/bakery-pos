export function renderSidebar(activeNavItem = 'dashboard') {
    return `
        <aside class="sidebar" id="sidebar">
            <div class="logo">
                <div class="logo-icon">🥐</div>
                <div class="logo-text">
                    <span class="logo-title">Кучтэнэч</span>
                    <span class="logo-subtitle">Аналитика</span>
                </div>
            </div>

            <nav class="nav-menu">
                <a href="/pos.html" class="nav-item"
                    style="background: linear-gradient(135deg, #e94560, #ff6b6b); color: white; border: none;">
                    <span class="nav-icon">🖥️</span>
                    <span>КАССА</span>
                </a>
                <a href="/index.html" class="nav-item ${activeNavItem === 'dashboard' ? 'active' : ''}">
                    <span class="nav-icon">📊</span>
                    <span>Дашборд</span>
                </a>
                <a href="/sales.html" class="nav-item ${activeNavItem === 'sales' ? 'active' : ''}">
                    <span class="nav-icon">💰</span>
                    <span>Продажи</span>
                </a>
                <a href="/add-sale.html" class="nav-item ${activeNavItem === 'add-sale' ? 'active' : ''}">
                    <span class="nav-icon">➕</span>
                    <span>Новая продажа</span>
                </a>
                <a href="/products.html" class="nav-item ${activeNavItem === 'products' ? 'active' : ''}">
                    <span class="nav-icon">🥧</span>
                    <span>Ассортимент</span>
                </a>
                <a href="/reports.html" class="nav-item ${activeNavItem === 'reports' ? 'active' : ''}">
                    <span class="nav-icon">📄</span>
                    <span>Отчёты</span>
                </a>

                <div class="nav-divider"></div>
                <div class="nav-section-title">Учёт</div>

                <a href="/ingredients.html" class="nav-item ${activeNavItem === 'ingredients' ? 'active' : ''}">
                    <span class="nav-icon">📦</span>
                    <span>Ингредиенты</span>
                </a>
                <a href="/recipes.html" class="nav-item ${activeNavItem === 'recipes' ? 'active' : ''}">
                    <span class="nav-icon">📋</span>
                    <span>Рецепты</span>
                </a>
                <a href="/stock.html" class="nav-item ${activeNavItem === 'stock' ? 'active' : ''}">
                    <span class="nav-icon">🏪</span>
                    <span>Склад</span>
                </a>
            </nav>

            <div class="sidebar-footer">
                <div class="user-info">
                    <div class="user-avatar">АК</div>
                    <div class="user-details">
                        <span class="user-name">Айгуль Каримова</span>
                        <span class="user-role">Владелец</span>
                    </div>
                </div>
            </div>
        </aside>
    `;
}
