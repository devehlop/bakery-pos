// ===== Stock Validator =====
// Validates that enough ingredients are available before confirming a sale

import { getIngredient } from '../ingredients.js';
import { getRecipe } from '../recipes.js';

/**
 * Check if there are enough ingredients to fulfill the cart items
 * @param {Array<{productId: string, qty: number}>} cartItems
 * @returns {{ valid: boolean, warnings: string[], shortages: Array }}
 */
export function validateStockForSale(cartItems) {
    if (!cartItems || cartItems.length === 0) {
        return { valid: true, warnings: [], shortages: [] };
    }

    // Accumulate total ingredient requirements across all items
    const required = {}; // ingredientId -> { needed, unit, name }

    for (const item of cartItems) {
        const recipe = getRecipe(item.productId);
        if (!recipe) continue; // No recipe - skip stock check for this product

        for (const ing of recipe.ingredients) {
            if (!required[ing.ingredientId]) {
                required[ing.ingredientId] = { needed: 0, unit: ing.unit };
            }
            required[ing.ingredientId].needed += ing.quantity * item.qty;
        }
    }

    const shortages = [];
    const warnings = [];

    for (const [ingredientId, req] of Object.entries(required)) {
        const ingredient = getIngredient(ingredientId);
        if (!ingredient) continue;

        const available = ingredient.currentStock;
        const needed = req.needed;

        if (available < needed) {
            shortages.push({
                ingredientId,
                name: ingredient.name,
                needed: needed.toFixed(2),
                available: available.toFixed(2),
                unit: ingredient.unit,
                deficit: (needed - available).toFixed(2)
            });
        } else if (available < needed * 1.1) {
            // Within 10% of needed — low stock warning
            warnings.push(`⚠️ Низкий остаток: ${ingredient.name} (осталось ${available.toFixed(2)} ${ingredient.unit})`);
        }
    }

    return {
        valid: shortages.length === 0,
        warnings,
        shortages
    };
}

/**
 * Format a shortages list into a human-readable message
 * @param {Array} shortages
 * @returns {string}
 */
export function formatShortagesMessage(shortages) {
    if (shortages.length === 0) return '';
    const lines = shortages.map(s =>
        `• ${s.name}: нужно ${s.needed} ${s.unit}, есть ${s.available} ${s.unit} (нехватка ${s.deficit} ${s.unit})`
    );
    return `Недостаточно ингредиентов на складе:\n\n${lines.join('\n')}`;
}
