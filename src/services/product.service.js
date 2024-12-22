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

    /**
     * @return {Promise<Array>} - Devuelve todos los productos
     */
    async getAll() {
        return this.products;
    }

    /**
     * @param {string} id - Id del producto a buscar
     * @return {object} - Devuelve el producto con el id pasado por parámetro
     */
    async getById({ id }) {
        return this.products.find((product) => product.id === id);
    }

    /**
     * @param {object} product - Producto a crear
     * @return {object} - Producto creado
     */
    
    async create({ title, description, code, price, status = true, stock = 0, category, thumbnails = [] }) {
        // Validaciones de los campos
        if (!title || typeof title !== 'string') {
            throw new Error('El campo "title" es obligatorio y debe ser un string.');
        }
        if (!description || typeof description !== 'string') {
            throw new Error('El campo "description" es obligatorio y debe ser un string.');
        }
        if (!code || typeof code !== 'string') {
            throw new Error('El campo "code" es obligatorio y debe ser un string.');
        }
        if (!category || typeof category !== 'string') {
            throw new Error('El campo "category" es obligatorio y debe ser un string.');
        }
        if (typeof price !== 'number' || price <= 0) {
            throw new Error('El campo "price" debe ser un número mayor a 0.');
        }
        if (typeof stock !== 'number' || stock < 0) {
            throw new Error('El campo "stock" debe ser un número mayor o igual a 0.');
        }
        if (typeof status !== 'boolean') {
            throw new Error('El campo "status" debe ser un booleano.');
        }
        if (!Array.isArray(thumbnails) || !thumbnails.every((thumb) => typeof thumb === 'string')) {
            throw new Error('El campo "thumbnails" debe ser un array de strings.');
        }
    
        // Verificar duplicación del código
        if (this.products.some((product) => product.code === code)) {
            throw new Error('El código del producto ya existe.');
        }
    
        const id = uuid();
        const product = {
            id,
            title,
            description,
            code,
            price,
            status, // Por defecto será true si no se especifica
            stock,
            category,
            thumbnails,
        };
    
        this.products.push(product);
    
        try {
            await this.saveOnFile();
            return product;
        } catch (error) {
            console.error('Error al guardar el archivo:', error);
            throw new Error('No se pudo guardar el producto.');
        }
    }
    
    

    /**
 * @param {object} product - Producto a actualizar
 * @return {object} - Producto actualizado
 * @throws {Error} Si el producto no se encuentra o hay un error de validación
 */
async update({ id, title, description, code, price, status, stock, category, thumbnails }) {
    // Buscar el producto por ID
    const product = this.products.find((product) => product.id === id);

    // Si no se encuentra el producto, lanzamos un error
    if (!product) {
        throw new Error(`Producto con id ${id} no encontrado.`);
    }

    // Verificar que no se intente cambiar el ID
    if (id !== product.id) {
        throw new Error('El campo "id" no puede ser modificado.');
    }

    // Validaciones de los campos proporcionados
    if (title !== undefined && typeof title !== 'string') {
        throw new Error('El campo "title" debe ser un string.');
    }
    if (description !== undefined && typeof description !== 'string') {
        throw new Error('El campo "description" debe ser un string.');
    }
    if (code !== undefined && typeof code !== 'string') {
        throw new Error('El campo "code" debe ser un string.');
    }
    if (category !== undefined && typeof category !== 'string') {
        throw new Error('El campo "category" debe ser un string.');
    }
    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
        throw new Error('El campo "price" debe ser un número mayor a 0.');
    }
    if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
        throw new Error('El campo "stock" debe ser un número mayor o igual a 0.');
    }
    if (status !== undefined && typeof status !== 'boolean') {
        throw new Error('El campo "status" debe ser un booleano.');
    }
    if (thumbnails !== undefined && (!Array.isArray(thumbnails) || !thumbnails.every((thumb) => typeof thumb === 'string'))) {
        throw new Error('El campo "thumbnails" debe ser un array de strings.');
    }

    // Actualizar el producto con los nuevos valores o mantener los actuales si no se pasan
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

    // Intentar guardar los cambios en el archivo o base de datos
    try {
        await this.saveOnFile();
        return product;
    } catch (error) {
        console.error('Error al actualizar el archivo:', error);
        throw new Error('No se pudo actualizar el producto.');
    }
}

    

   /**
 * @param {string} id - Id del producto a eliminar
 * @return {object|null} - Producto eliminado o null si no se encuentra
 */
async delete({ id }) {
    const index = this.products.findIndex((product) => product.id === id);

    if (index === -1) {
        return null; // Retorna null si no encuentra el producto
    }

    const [product] = this.products.splice(index, 1);

    try {
        await this.saveOnFile(); // Guardamos los cambios en el archivo
        return product; // Devuelve el producto eliminado
    } catch (error) {
        console.error('Error al guardar el archivo después de eliminar el producto:', error);
        throw new Error('No se pudo eliminar el producto.');
    }
}

    

    /**
     * Guarda los products en el archivo
     */
    async saveOnFile() {
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, 2));
        } catch (error) {
            console.error('Error al guardar el archivo:', error);
        }
    }
}

// Exporto una instancia del servicio
export const productService = new ProductService({
    path: './src/db/products.json',
});
