const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Токен не предоставлен' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Неверный токен' });
        req.user = user;
        next();
    });
};

const isAdmin = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Доступ запрещён' });
        }
        next();
    } catch (error) {
        console.error('Ошибка проверки роли администратора:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

router.get('/', async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (error) {
        console.error('Ошибка при загрузке продуктов:', error);
        res.status(500).json({ error: 'Ошибка при загрузке продуктов' });
    }
});

router.post('/', authenticateToken, isAdmin, async (req, res) => {
    const { name, description, price, stock, category, label } = req.body;
    if (!name || !price || !stock) {
        return res.status(400).json({ error: 'Название, цена и количество обязательны' });
    }
    try {
        const product = await prisma.product.create({
            data: { name, description, price: parseFloat(price), stock: parseInt(stock), category, label },
        });
        res.status(201).json(product);
    } catch (error) {
        console.error('Ошибка при создании продукта:', error);
        res.status(400).json({ error: 'Ошибка при создании продукта' });
    }
});

router.patch('/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock, category, label } = req.body;
    try {
        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                price: price ? parseFloat(price) : undefined,
                stock: stock ? parseInt(stock) : undefined,
                category,
                label,
            },
        });
        res.json(product);
    } catch (error) {
        console.error('Ошибка при обновлении продукта:', error);
        res.status(400).json({ error: 'Ошибка при обновлении продукта' });
    }
});

router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.product.delete({
            where: { id: parseInt(id) },
        });
        res.json({ message: 'Продукт удалён' });
    } catch (error) {
        console.error('Ошибка при удалении продукта:', error);
        res.status(400).json({ error: 'Ошибка при удалении продукта' });
    }
});

module.exports = router;