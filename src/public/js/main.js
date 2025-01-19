document.addEventListener('DOMContentLoaded', function () {
    const socket = io();

    console.log('Hello from main.js!');

    // Escucha el evento 'products' enviado desde el servidor
    socket.on('products', (products) => {
        console.log("Productos recibidos en el cliente:", products);

        const productList = document.getElementById('products');
        
        // Verifica si se encuentra el contenedor 'products'
        if (!productList) {
            console.error('No se encontró el contenedor de productos');
            return;
        }

        // Limpia la lista antes de agregar nuevos productos
        productList.innerHTML = '';

        // Verifica si 'products' es un arreglo y luego agrega cada producto
        if (Array.isArray(products)) {
            products.forEach(product => {
                const li = createProduct(product);
                productList.appendChild(li);
            });
        } else {
            console.error('No se recibieron productos válidos:', products);
        }
    });

    function createProduct(product) {
        const li = document.createElement('li');
        li.innerHTML = `
            <h2>${product.title}</h2>
            <h3>${product.description}</h3>
            <p>$${product.price}</p>
        `;
        li.className = "collections-product"; 

        return li;
    }

    // Escucha el evento 'product-created' enviado desde el servidor
    socket.on('product-created', (product) => {
        const li = createProduct(product);
        const productList = document.getElementById('products');
        
        if (!productList) {
            console.error('No se encontró el contenedor de productos');
            return;
        }

        productList.appendChild(li);
    });
});
