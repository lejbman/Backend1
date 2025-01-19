import { Router } from "express";
import { productService } from "../services/product.service.js";

export const viewsRoutes = Router();

// Ruta para la página de inicio (http://localhost:8080/)

viewsRoutes.get("/", async (req, res) => {
    try {
        const products = await productService.getAll(); // Obtener productos desde el servicio
        res.render("home", { products }); // Renderiza la vista "home" con los productos
    } catch (error) {
        res.status(500).send("Error al obtener productos");
    }
});

// Ruta para listar productos
viewsRoutes.get("/productos", async (req, res) => {
    const products = await productService.getAll(); // Obtener productos del servicio
    res.render("products", { products }); // Renderiza la vista "products" con los datos
});

// Ruta para detalle de producto
viewsRoutes.get("/productos/:id", async (req, res) => {
    const productId = req.params.id;
    const product = await productService.getById(productId); // Obtener el producto por ID
    res.render("productDetail", { product }); // Renderiza la vista "productDetail" con los datos
});

// Ruta para productos en tiempo real (http://localhost:8080/realTimeProducts)
viewsRoutes.get("/realTimeProducts", async (req, res) => {
    try {
        const products = await productService.getAll(); // Obtener productos desde el servicio
        res.render("realTimeProducts", { products }); // Renderiza la vista "realTimeProducts" con los productos
    } catch (error) {
        res.status(500).send("Error al obtener productos en tiempo real");
    }
});

// Ruta para productos en home (http://localhost:8080/home)
viewsRoutes.get("/home", async (req, res) => {
    try {
        const products = await productService.getAll(); // Obtener productos desde el servicio
        res.render("home", { products }); // Renderiza la vista "home" con los productos
    } catch (error) {
        res.status(500).send("Error al obtener productos");
    }
});
