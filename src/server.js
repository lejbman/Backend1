import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import handlebars from 'express-handlebars';
import { __dirname } from './dirname.js';
import { Server } from 'socket.io';
import morgan from 'morgan';
import { productRoutes } from './routes/product.routes.js';
import { cartRoutes } from './routes/cart.routes.js';
import { viewsRoutes } from './routes/views.routes.js';
import productsModel from './models/products.model.js';
import sessionsRoutes from './routes/sessions.routes.js';
import initializePassport from './config/passport.config.js';
import passport from 'passport';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 8080;

// App Config
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.static(path.resolve(__dirname, '../src/public')));
app.use(cookieParser());
app.use(passport.initialize());
initializePassport();

// Handlebars Config sin helpers externos
app.engine(
  'hbs',
  handlebars.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.resolve(__dirname, '../src/views/layouts'),
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set('view engine', 'hbs');
app.set('views', path.resolve(__dirname, '../src/views'));

// Rutas
app.use('/', viewsRoutes);
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/sessions', sessionsRoutes);

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export const io = new Server(server);

// Configuración de Socket.IO
io.on('connection', (socket) => {
  console.log('New connection', socket.id);

  // Enviar los productos cuando el cliente se conecte
  productsModel
    .find()
    .then((products) => {
      console.log("Productos enviados al cliente:", products);
      socket.emit('products', products);
    })
    .catch((err) => {
      console.error("Error al enviar los productos:", err);
    });

  // Escuchar eventos, por ejemplo, 'product-created'
  socket.on('product-created', (product) => {
    io.emit('product-created', product);
  });
});

// Conexión a MongoDB
mongoose
  .connect()
  .then(() => console.log('MongoDB conectado correctamente'))
  .catch((err) => console.error('Error en la conexión a MongoDB:', err));
