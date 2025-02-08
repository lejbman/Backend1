import { Router } from "express";
import Cart from "../models/carts.model.js"; // Importar el modelo de carritos
import productsModel from "../models/products.model.js"; // Importar el modelo de productos

export const viewsRoutes = Router();

// Ruta para la página de inicio (http://localhost:8080/)
viewsRoutes.get("/", async (req, res) => {
    try {
        const products = await productsModel.find(); // Obtener productos usando Mongoose
        res.render("home", { products });
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).send("Error al obtener productos");
    }
});

// Ruta para listar productos con paginación (http://localhost:8080/productos)
viewsRoutes.get("/productos", async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query; // Página y límite de productos por página
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            lean: true // Retorna objetos simples en lugar de instancias de Mongoose
        };

        const result = await productsModel.paginate({}, options);

        res.render("products", {
            products: result.docs,
            currentPage: result.page,
            totalPages: result.totalPages
        });
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).send("Error al obtener productos");
    }
});

// Ruta para ver detalles de un producto (http://localhost:8080/productos/:id)
viewsRoutes.get("/productos/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const product = await productsModel.findById(id);
        if (!product) {
            return res.status(404).send("Producto no encontrado");
        }
        res.render("productDetail", { product });
    } catch (error) {
        console.error("Error al obtener el producto:", error);
        res.status(500).send("Error al obtener el producto");
    }
});

// Ruta para ver un carrito específico (http://localhost:8080/carts/:cid)
viewsRoutes.get("/carts/:cid", async (req, res) => {
    try {
        const { cid } = req.params;

        // Buscar el carrito por ID y poblar los productos
        const cart = await Cart.findById(cid).populate("products.product"); // Asegúrate de que 'product' sea una referencia a productos

        if (!cart) {
            return res.status(404).send("Carrito no encontrado");
        }

        res.render("cartDetail", { cart });
    } catch (error) {
        console.error("Error al obtener el carrito:", error);
        res.status(500).send("Error interno del servidor");
    }
});

// Ruta para la página en tiempo real (http://localhost:8080/realTimeProducts)
viewsRoutes.get("/realTimeProducts", async (req, res) => {
    try {
        // Renderiza la vista 'realTimeProducts' sin enviar productos directamente
        res.render("realTimeProducts"); // Esta es la vista donde se conectará el cliente via Socket.io
    } catch (error) {
        console.error("Error al cargar la vista realTimeProducts:", error);
        res.status(500).send("Error al cargar la vista de productos en tiempo real");
    }
});
