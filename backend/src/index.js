// const express = require('express');
// const cors = require('cors');
// const path = require('path'); 
// const { PrismaClient } = require('@prisma/client');
// const userRoutes = require('./routes/userRoutes');
// const productRoutes = require('./routes/productRoutes');
// const orderRoutes = require('./routes/orderRoutes');
// const reviewRoutes = require('./routes/reviewRoutes');

// const app = express();
// const prisma = new PrismaClient();

// app.use(cors());
// app.use(express.json());

// app.use(express.static(path.join(__dirname, '../../html')));

// app.get('/', (req, res) => {
//    res.sendFile(path.join(__dirname, '../../html', 'index.html'));
// });

// app.use('/api/users', userRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/reviews', reviewRoutes);

// app.listen(3000, () => console.log('Server running on http://localhost:3000'));
const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Раздача статических файлов из корневой директории
app.use(express.static(path.join(__dirname, '../..')));

// Маршрут для корневого URL (/)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../..', 'html', 'index.html'));
});

// API маршруты
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

app.listen(3000, () => console.log('Server running on http://localhost:3000'));