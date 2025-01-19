import { productService } from "./services/product.service.js";
import express from 'express';
import path from 'path';
import handlebars from 'express-handlebars';
import { __dirname } from "./dirname.js";
import { Server } from "socket.io";
import morgan from "morgan";
import { productRoutes } from './routes/product.routes.js';
import { cartService } from "./services/cart.service.js";
import { cartRoutes } from './routes/cart.routes.js';
import { viewsRoutes } from './routes/views.routes.js';

const app = express();
const PORT = 8080;

// App Config
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.static(path.resolve(__dirname, '../src/public')));

// Handlebars Config
app.engine(
    'hbs',
    handlebars.engine({
        extname: '.hbs',
        defaultLayout: 'main',
        layoutsDir: path.resolve(__dirname, '../src/views/layouts'),
    })
);
app.set('view engine', 'hbs');
app.set('views', path.resolve(__dirname, '../src/views'));

// Routes
app.use('/', viewsRoutes);
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);

// Socket.io Config
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export const io = new Server(server);

io.on('connection', (socket) => {
    console.log('New connection', socket.id);

    // Enviar los productos cuando el cliente se conecte
    productService.getAll().then(products => {
        console.log("Productos enviados al cliente:", products);
        socket.emit('products', products);
    }).catch(err => {
        console.error("Error al enviar los productos:", err);
    });

    // Escuchar eventos como 'product-created' o cualquier otro que decidas emitir
    socket.on('product-created', (product) => {
        io.emit('product-created', product);
    });
});
