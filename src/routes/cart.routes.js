// cart.routes.js
import { Router } from 'express';
import { cartService } from '../services/cart.service.js';

export const cartRoutes = Router();

// POST /api/carts/ - Crear un nuevo carrito
cartRoutes.post('/', async (req, res) => {
    try {
        const cart = await cartService.create();
        res.status(201).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el carrito' });
    }
});

// GET /api/carts/:cid - Obtener los productos del carrito por ID
cartRoutes.get('/:cid', async (req, res) => {
    const { cid } = req.params;
    const cart = await cartService.getById(cid);

    if (!cart) {
        return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    res.status(200).json(cart.products);
});

// POST /api/carts/:cid/product/:pid - Agregar un producto al carrito
cartRoutes.post('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;

    try {
        const updatedCart = await cartService.addProductToCart(cid, pid);
        res.status(200).json(updatedCart);
    } catch (error) {
        if (error.message === 'Carrito no encontrado') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al agregar el producto al carrito' });
    }
});
