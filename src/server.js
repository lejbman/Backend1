import { productService } from "./services/product.service.js";
import express from 'express';
import { productRoutes } from './routes/product.routes.js';
import { cartService } from "./services/cart.service.js";
import { cartRoutes } from './routes/cart.routes.js';


const app = express();
const PORT = 8080;

// App Config
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes

app.use('/api/products', productRoutes); // Endpoint para las peticiones relacionadas con products

app.use('/api/carts', cartRoutes); // Endpoint para las peticiones relacionadas con cart

// App listen

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


