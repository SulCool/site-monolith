require('dotenv').config();

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET; 

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Токен не предоставлен' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Неверный токен' });
        req.user = user;
        next();
    });
};

router.post('/', authenticateToken, async (req, res) => {
    const { concreteType, volume, deliveryType, price } = req.body;
    try {
        const order = await prisma.order.create({
            data: {
                userId: req.user.id,
                concreteType,
                volume,
                deliveryType,
                price,
                status: 'NEW',
            },
        });
        res.status(201).json({ message: 'Заказ создан', order });
    } catch (error) {
        console.error('Ошибка при создании заказа:', error);
        res.status(400).json({ error: 'Ошибка при создании заказа' });
    }
});

router.get('/user/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    if (parseInt(userId) !== req.user.id) {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    const orders = await prisma.order.findMany({
        where: { userId: parseInt(userId) },
    });
    res.json(orders);
});

module.exports = router;