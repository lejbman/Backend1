import { Router } from "express";
import { io } from "../server.js";
import productsModel from "../models/products.model.js";

const router = Router();

// GET / - Obtener todos los productos con paginación
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            lean: true
        };

        const result = await productsModel.paginate({}, options);

        // Respuesta con el formato solicitado
        res.status(200).json({
            status: 'success',
            payload: result.docs,            // Productos solicitados
            totalPages: result.totalPages,    // Total de páginas
            prevPage: result.prevPage,        // Página anterior
            nextPage: result.nextPage,        // Página siguiente
            page: result.page,                // Página actual
            hasPrevPage: result.hasPrevPage,  // Si hay página previa
            hasNextPage: result.hasNextPage,  // Si hay página siguiente
            prevlink: result.prevPage ? `/api/products?page=${result.prevPage}&limit=${limit}` : null, // Link a la página previa
            nextlink: result.nextPage ? `/api/products?page=${result.nextPage}&limit=${limit}` : null  // Link a la página siguiente
        });
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ 
            message: "Error al obtener los productos", 
            error: error.message 
        });
    }
});

// GET /:id - Obtener producto por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await productsModel.findById(id);

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
router.post('/', async (req, res) => {
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;

    if (!title || !description || !code || price == null || stock == null || !category) {
        return res.status(400).json({
            message: "Faltan campos obligatorios: title, description, code, price, stock o category"
        });
    }

    try {
        const product = await productsModel.create({
            title, description, code, price, status, stock, category, thumbnails
        });

        io.emit('product-created', product);

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
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;

    if (req.body.id && req.body.id !== id) {
        return res.status(400).json({ 
            message: "No se permite cambiar el 'id' de un producto." 
        });
    }

    try {
        const updatedProduct = await productsModel.findByIdAndUpdate(id, {
            title, description, code, price, status, stock, category, thumbnails
        }, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(500).json({ 
            message: "Error al actualizar el producto", 
            error: error.message 
        });
    }
});

// DELETE /:id - Eliminar un producto
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await productsModel.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.status(200).json({ message: "Producto eliminado", product: deletedProduct });
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json({ 
            message: "Error interno del servidor al eliminar el producto", 
            error: error.message 
        });
    }
});

export { router as productRoutes };
