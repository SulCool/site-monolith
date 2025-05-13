const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const morgan = require('morgan');
const helmet = require('helmet');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                'script-src': ["'self'", "'unsafe-inline'"], 
                'script-src-attr': ["'self'", "'unsafe-inline'"],
                'default-src': ["'self'"],
                'style-src': ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
                'img-src': ["'self'", 'data:', 'https:'],
            },
        },
    })
);

app.use(express.static(path.join(__dirname, '../..')));
app.use(express.urlencoded({ extended: true }));

const pages = ['index', 'order', 'catalog', 'register', 'pro', 'slider', 'profile', 'reset-password', 'reset-password-confirm'];
pages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(__dirname, '../..', 'html', `${page}.html`));
    });
});

app.get('/', (req, res) => {
    res.redirect('/index');
});

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

app.listen(3000, () => console.log('Server running on http://localhost:3000'));