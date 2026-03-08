// ===== Toast Notification System =====

const toastContainer = (() => {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
    return container;
})();

const TOAST_ICONS = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
};

const TOAST_COLORS = {
    success: { bg: '#10b981', border: '#059669' },
    error: { bg: '#ef4444', border: '#dc2626' },
    warning: { bg: '#f59e0b', border: '#d97706' },
    info: { bg: '#3b82f6', border: '#2563eb' }
};

/**
 * Show a toast notification
 * @param {string} message - Message to show
 * @param {'success'|'error'|'warning'|'info'} type - Type of notification
 * @param {number} duration - Duration in ms (default 3500)
 */
export function showToast(message, type = 'info', duration = 3500) {
    const colors = TOAST_COLORS[type] || TOAST_COLORS.info;
    const icon = TOAST_ICONS[type] || TOAST_ICONS.info;

    const toast = document.createElement('div');
    toast.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 18px;
        background: ${colors.bg};
        border-left: 4px solid ${colors.border};
        border-radius: 8px;
        color: white;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        max-width: 360px;
        pointer-events: all;
        cursor: pointer;
        transform: translateX(120%);
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
        opacity: 0;
        font-family: 'Inter', sans-serif;
    `;
    toast.innerHTML = `
        <span style="font-size:18px;flex-shrink:0;">${icon}</span>
        <span style="flex:1;line-height:1.4;">${message}</span>
        <span style="flex-shrink:0;opacity:0.7;font-size:18px;">×</span>
    `;

    toast.addEventListener('click', () => dismissToast(toast));
    toastContainer.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });
    });

    // Auto dismiss
    const timer = setTimeout(() => dismissToast(toast), duration);
    toast._timer = timer;

    return toast;
}

function dismissToast(toast) {
    if (!toast.isConnected) return;
    clearTimeout(toast._timer);
    toast.style.transform = 'translateX(120%)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 350);
}

// Convenience shortcuts
export const toast = {
    success: (msg, duration) => showToast(msg, 'success', duration),
    error: (msg, duration) => showToast(msg, 'error', duration),
    warning: (msg, duration) => showToast(msg, 'warning', duration),
    info: (msg, duration) => showToast(msg, 'info', duration),
};

/**
 * Custom confirm dialog (replaces native confirm())
 * @returns {Promise<boolean>}
 */
export function showConfirm(message, { title = 'Подтверждение', confirmText = 'Да', cancelText = 'Отмена', danger = false } = {}) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.6);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.2s ease;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: #1e2130;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 28px;
            max-width: 420px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            animation: slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
            font-family: 'Inter', sans-serif;
        `;
        dialog.innerHTML = `
            <h3 style="margin:0 0 12px;color:#f1f5f9;font-size:18px;">${title}</h3>
            <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;line-height:1.6;">${message}</p>
            <div style="display:flex;gap:12px;justify-content:flex-end;">
                <button id="confirmCancel" style="
                    padding: 10px 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15);
                    background: transparent; color: #94a3b8; cursor: pointer; font-size: 14px; font-family: inherit;
                ">${cancelText}</button>
                <button id="confirmOk" style="
                    padding: 10px 20px; border-radius: 8px; border: none;
                    background: ${danger ? '#ef4444' : '#10b981'}; color: white;
                    cursor: pointer; font-size: 14px; font-weight: 600; font-family: inherit;
                ">${confirmText}</button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        const close = (result) => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 200);
            resolve(result);
        };

        dialog.querySelector('#confirmOk').addEventListener('click', () => close(true));
        dialog.querySelector('#confirmCancel').addEventListener('click', () => close(false));
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });

        // Add CSS animations if not present
        if (!document.getElementById('toast-keyframes')) {
            const style = document.createElement('style');
            style.id = 'toast-keyframes';
            style.textContent = `
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `;
            document.head.appendChild(style);
        }
    });
}
