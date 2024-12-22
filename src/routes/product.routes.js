import { Router } from "express";
import { productService } from "../services/product.service.js";

export const productRoutes = Router();

// GET /
productRoutes.get('/', async (req, res) => {
    const products = await productService.getAll();

    res.status(200).json(products);
});

// GET /:id
productRoutes.get('/:id', async (req, res) => {
    const { id } = req.params;
    const product = await productService.getById({ id });

    if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json(product);
});

// POST /
productRoutes.post('/', async (req, res) => {
    const { title, description, code, price, status,stock, category, thumbnails } = req.body;
    try {
        const product = await productService.create({ title, description, code, price, status,stock, category, thumbnails });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// PUT /:id
productRoutes.put('/:id', async (req, res) => {
    const { id } = req.params; // Obtén el id desde la URL
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;
    
    // Verificamos si el id en el cuerpo es diferente del id en la URL
    if (req.body.id && req.body.id !== id) {
        return res.status(400).json({ message: "No se permite cambiar el 'id' de un producto." });
    }

    try {
        const product = await productService.update({ id, title, description, code, price, status, stock, category, thumbnails });

        // Si el producto se encuentra, lo devolvemos
        res.status(200).json(product);
    } catch (error) {
        // Si el error es por intentar modificar el ID, devolvemos un error 400
        if (error.message === 'El campo "id" no puede ser modificado.') {
            return res.status(400).json({ message: error.message });
        }
        // Si el producto no se encuentra, devolvemos un error 404
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ message: error.message });
        }
        // En cualquier otro error, devolvemos un 500
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});




// DELETE /:id
productRoutes.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Llamada al servicio para eliminar el producto
        const product = await productService.delete({ id });

        // Si no se encuentra el producto, se retorna 404
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Si el producto fue eliminado, devolver el producto eliminado
        res.status(200).json(product);
    } catch (error) {
        // Loguear detalles del error para depuración
        console.error('Error al intentar eliminar el producto:', error);

        // Si hay un error, devuelvo 500 con un mensaje de error general
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message, // Incluye el mensaje de error para depuración
        });
    }
});


