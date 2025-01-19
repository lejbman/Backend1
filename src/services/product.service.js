import fs from 'node:fs';
import { v4 as uuid } from 'uuid';

class ProductService {
    path;
    products = [];

    constructor({ path }) {
        this.path = path;

        // Verifico si el archivo existe
        if (fs.existsSync(path)) {
            try {
                // Si el archivo existe y es legible, leo el contenido y lo parseo
                this.products = JSON.parse(fs.readFileSync(this.path, 'utf-8'));
            } catch (error) {
                // Si hubo un error al leer el archivo, lo seteo como vacío
                console.error('Error al leer el archivo:', error);
                this.products = [];
            }
        } else {
            // Si el archivo no existe, lo seteo como vacío
            this.products = [];
        }
    }

    // Obtener todos los productos
    async getAll() {
        return this.products;
    }

    // Obtener un producto por ID
    async getById({ id }) {
        return this.products.find((product) => product.id === id);
    }

    // Crear un nuevo producto
    async create({ title, description, code, price, status = true, stock = 0, category, thumbnails = [] }) {
        const id = uuid();
        const product = {
            id,
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails,
        };

        // Agregar el producto a la lista
        this.products.push(product);

        try {
            // Guardar el producto en el archivo
            await this.saveOnFile();
            return product;
        } catch (error) {
            console.error('Error al guardar el archivo:', error);
            throw new Error('No se pudo guardar el producto.');
        }
    }

    // Actualizar un producto
    async update({ id, title, description, code, price, status, stock, category, thumbnails }) {
        const product = this.products.find((product) => product.id === id);

        if (!product) {
            throw new Error(`Producto con id ${id} no encontrado.`);
        }

        if (id !== product.id) {
            throw new Error('El campo "id" no puede ser modificado.');
        }

        // Actualizar el producto con los nuevos valores
        Object.assign(product, {
            title: title ?? product.title,
            description: description ?? product.description,
            code: code ?? product.code,
            price: price ?? product.price,
            status: status ?? product.status,
            stock: stock ?? product.stock,
            category: category ?? product.category,
            thumbnails: thumbnails ?? product.thumbnails,
        });

        try {
            // Guardar el archivo después de la actualización
            await this.saveOnFile();
            return product;
        } catch (error) {
            console.error('Error al actualizar el archivo:', error);
            throw new Error('No se pudo actualizar el producto.');
        }
    }

    // Eliminar un producto
    async delete({ id }) {
        const index = this.products.findIndex((product) => product.id === id);

        if (index === -1) {
            return null; // Retorna null si no encuentra el producto
        }

        const [product] = this.products.splice(index, 1);

        try {
            // Guardar el archivo después de eliminar el producto
            await this.saveOnFile();
            return product;
        } catch (error) {
            console.error('Error al guardar el archivo después de eliminar el producto:', error);
            throw new Error('No se pudo eliminar el producto.');
        }
    }

    // Guardar los productos en el archivo
    async saveOnFile() {
        try {
            console.log("Guardando productos en el archivo...");
            // Guardar productos en formato JSON con indentación para mayor legibilidad
            await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, 2));
            console.log("Productos guardados exitosamente.");
        } catch (error) {
            console.error('Error al guardar el archivo:', error);
            throw new Error('No se pudo guardar el archivo.');
        }
    }
}

// Exportar una instancia del servicio
export const productService = new ProductService({
    path: './src/db/products.json', // Aquí defines el path donde se guardarán los productos
});
