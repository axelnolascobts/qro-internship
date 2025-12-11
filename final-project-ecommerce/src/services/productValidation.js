/*
Purpose: Backend rules when adding a new product.
*/

function validateProduct(data) {
    if (!data.title || data.title.trim().length === 0) {
        return "Title is required";
    }
    if (!data.description || data.description.trim().length === 0) {
        return "Description is required";
    }
    if (!data.category || data.category.trim().length === 0) {
        return "Category is required";
    }
    if (typeof data.price !== "number" || data.price <= 0) {
        return "Price must be greater than 0";
    }
    if (typeof data.stock !== "number" || data.stock < 0) {
        return "Stock must be 0 or greater";
    }
    return null;
}

module.exports = { validateProduct };
