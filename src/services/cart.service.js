// cart.service.js
import fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid'; // Importamos la función uuidv4
import { productService } from './product.service.js'; // Para asegurarnos de que los productos existan

class CartService {
    constructor({ path }) {
        this.path = path;
        this.carts = [];

        // Cargar carritos desde archivo si existe
        if (fs.existsSync(path)) {
            try {
                this.carts = JSON.parse(fs.readFileSync(path, 'utf-8'));
            } catch (error) {
                console.error('Error al leer el archivo:', error);
                this.carts = [];
            }
        }
    }

    /**
     * Crea un nuevo carrito con un ID único y lo guarda en el archivo.
     */
    async create() {
        const id = uuidv4(); // Generamos un ID único utilizando uuidv4()
        const cart = { id, products: [] };
        this.carts.push(cart);

        try {
            await this.saveOnFile();
            return cart;
        } catch (error) {
            console.error('Error al guardar el carrito:', error);
            throw new Error('No se pudo crear el carrito.');
        }
    }

    /**
     * Obtiene un carrito por su ID.
     * @param {string} cid - El ID del carrito
     */
    async getById(cid) {
        return this.carts.find((cart) => cart.id === cid);
    }

    /**
     * Agrega un producto al carrito.
     * Si el producto ya está, incrementa la cantidad.
     * @param {string} cid - El ID del carrito
     * @param {string} pid - El ID del producto
     */
    async addProductToCart(cid, pid) {
        const cart = await this.getById(cid);

        if (!cart) {
            throw new Error('Carrito no encontrado');
        }

        // Verificamos si el producto ya existe en el carrito
        const productIndex = cart.products.findIndex((item) => item.product === pid);

        if (productIndex !== -1) {
            // Si el producto ya existe, incrementamos la cantidad
            cart.products[productIndex].quantity += 1;
        } else {
            // Si no existe, agregamos el producto con cantidad 1
            cart.products.push({ product: pid, quantity: 1 });
        }

        try {
            await this.saveOnFile();
            return cart;
        } catch (error) {
            console.error('Error al agregar el producto:', error);
            throw new Error('No se pudo agregar el producto al carrito.');
        }
    }

    /**
     * Guarda los carritos en el archivo.
     */
    async saveOnFile() {
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, 2));
        } catch (error) {
            console.error('Error al guardar el archivo:', error);
        }
    }
}

// Exportamos el servicio con exportación nombrada
export const cartService = new CartService({ path: './src/db/carts.json' });
