import { Router } from 'express';
import cartsModel from '../models/carts.model.js';

const cartRoutes = Router();

// POST /api/carts/ - Crear un nuevo carrito
cartRoutes.post('/', async (req, res) => {
    try {
        const cart = await cartsModel.create({});
        res.status(201).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el carrito', error: error.message });
    }
});

// GET /api/carts/:cid - Obtener los productos del carrito por ID con populate
cartRoutes.get('/:cid', async (req, res) => {
    const { cid } = req.params;

    try {
        const cart = await cartsModel.findOne({ _id: cid }).populate('products.product');

        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        res.status(200).json(cart.products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el carrito', error: error.message });
    }
});

// POST /api/carts/:cid/product/:pid - Agregar un producto al carrito
cartRoutes.post('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;

    try {
        const cart = await cartsModel.findOne({ _id: cid });

        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        // Buscar si el producto ya está en el carrito
        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);

        if (productIndex >= 0) {
            cart.products[productIndex].quantity += 1; // Aumenta la cantidad
        } else {
            cart.products.push({ product: pid, quantity: 1 }); // Agrega el producto
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar el producto al carrito', error: error.message });
    }
});

// DELETE /api/carts/:cid/products/:pid - Eliminar un producto del carrito
cartRoutes.delete('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;

    try {
        const cart = await cartsModel.findOne({ _id: cid });

        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        // Buscar el producto en el carrito
        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);

        if (productIndex === -1) {
            return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
        }

        // Eliminar el producto del carrito
        cart.products.splice(productIndex, 1);
        await cart.save();

        res.status(200).json({ message: 'Producto eliminado del carrito', cart });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el producto del carrito', error: error.message });
    }
});

// PUT /api/carts/:cid/products/:pid - Actualizar la cantidad de un producto en el carrito
cartRoutes.put('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
        return res.status(400).json({ message: "Cantidad inválida o no proporcionada" });
    }

    try {
        const cart = await cartsModel.findOne({ _id: cid });

        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        // Buscar el producto en el carrito
        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);

        if (productIndex === -1) {
            return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
        }

        // Actualizar la cantidad del producto
        cart.products[productIndex].quantity = quantity;
        await cart.save();

        res.status(200).json({ message: 'Cantidad actualizada', cart });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la cantidad en el carrito', error: error.message });
    }
});

// DELETE /api/carts/:cid - Eliminar todos los productos del carrito
cartRoutes.delete('/:cid', async (req, res) => {
    const { cid } = req.params;

    try {
        const cart = await cartsModel.findOne({ _id: cid });

        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        // Vaciar el carrito
        cart.products = [];
        await cart.save();

        res.status(200).json({ message: 'Carrito vaciado', cart });
    } catch (error) {
        res.status(500).json({ message: 'Error al vaciar el carrito', error: error.message });
    }
});

export { cartRoutes };
