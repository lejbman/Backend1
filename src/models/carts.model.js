import mongoose from 'mongoose';

// Definir el esquema del carrito
const cartSchema = new mongoose.Schema({
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true }
    }]
});

// Agregar método estático para obtener carrito con productos poblados
cartSchema.statics.getCartWithProducts = function (cartId) {
    return this.findById(cartId).populate("products.product");
};

// Crear el modelo de carrito
const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
