import { Router } from "express";
import { io } from "../server.js";
import { productService } from "../services/product.service.js";

export const productRoutes = Router();

// GET / - Obtener todos los productos
productRoutes.get('/', async (req, res) => {
    try {
        const products = await productService.getAll();
        res.status(200).json(products);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ 
            message: "Error al obtener los productos", 
            error: error.message 
        });
    }
});

// GET /:id - Obtener producto por ID
productRoutes.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await productService.getById({ id });

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error("Error al obtener producto:", error);
        res.status(500).json({ 
            message: "Error interno del servidor", 
            error: error.message 
        });
    }
});

// POST / - Agregar un producto
productRoutes.post('/', async (req, res) => {
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;

    // Validar que los campos obligatorios estén presentes
    if (!title || !description || !code || price == null || stock == null || !category) {
        return res.status(400).json({
            message: "Faltan campos obligatorios: title, description, code, price, stock o category"
        });
    }

    try {
        // Crear el nuevo producto usando el servicio
        const product = await productService.create({
            title, description, code, price, status, stock, category, thumbnails
        });

        // Emitir el evento 'product-created' a todos los clientes conectados
        io.emit('product-created', product);

        // Devolver el producto creado
        res.status(201).json(product);
    } catch (error) {
        console.error("Error al agregar producto:", error);
        res.status(500).json({ 
            message: "Error al agregar el producto", 
            error: error.message 
        });
    }
});

// PUT /:id - Actualizar un producto
productRoutes.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;

    // Verificar que el ID del cuerpo coincida con el de la URL
    if (req.body.id && req.body.id !== id) {
        return res.status(400).json({ 
            message: "No se permite cambiar el 'id' de un producto." 
        });
    }

    try {
        const product = await productService.update({
            id, title, description, code, price, status, stock, category, thumbnails
        });

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(500).json({ 
            message: "Error interno del servidor", 
            error: error.message 
        });
    }
});

// DELETE /:id - Eliminar un producto
productRoutes.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await productService.delete({ id });

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.status(200).json({ message: "Producto eliminado", product });
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json({ 
            message: "Error interno del servidor", 
            error: error.message 
        });
    }
});
