class CartStore {
    constructor() {
        this.cart = [];
        this.listeners = [];
        this.load();
    }

    load() {
        try {
            const saved = localStorage.getItem('bakery_cart');
            if (saved) {
                this.cart = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error loading cart:', e);
            this.cart = [];
        }
    }

    save() {
        try {
            localStorage.setItem('bakery_cart', JSON.stringify(this.cart));
            this.notify();
        } catch (e) {
            console.error('Error saving cart:', e);
        }
    }

    addItem(productId, qty = 1) {
        const existing = this.cart.find(i => i.productId === productId);
        if (existing) {
            existing.qty += qty;
        } else {
            this.cart.push({ productId, qty });
        }
        this.save();
    }

    removeItem(index) {
        if (index >= 0 && index < this.cart.length) {
            this.cart.splice(index, 1);
            this.save();
        }
    }

    clear() {
        this.cart = [];
        this.save();
    }

    getItems() {
        return [...this.cart];
    }

    getTotal(productsData) {
        return this.cart.reduce((sum, item) => {
            const product = productsData[item.productId];
            return sum + (product ? product.price * item.qty : 0);
        }, 0);
    }

    getTotalItemsCount() {
        return this.cart.reduce((sum, item) => sum + item.qty, 0);
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this.cart));
    }
}

export const cartStore = new CartStore();
