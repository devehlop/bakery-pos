import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                addSale: resolve(__dirname, 'add-sale.html'),
                ingredients: resolve(__dirname, 'ingredients.html'),
                pos: resolve(__dirname, 'pos.html'),
                products: resolve(__dirname, 'products.html'),
                recipes: resolve(__dirname, 'recipes.html'),
                reports: resolve(__dirname, 'reports.html'),
                sales: resolve(__dirname, 'sales.html'),
                stock: resolve(__dirname, 'stock.html')
            }
        }
    }
});
