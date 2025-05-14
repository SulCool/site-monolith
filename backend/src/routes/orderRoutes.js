require('dotenv').config();

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    console.log('Получен токен из cookies:', token);
    if (!token) return res.status(401).json({ error: 'Токен не предоставлен' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Ошибка верификации токена:', err);
            return res.status(403).json({ error: 'Неверный токен' });
        }
        console.log('Токен верифицирован, пользователь:', user);
        req.user = user;
        next();
    });
};

router.post('/', authenticateToken, async (req, res) => {
    const { concreteType, volume, deliveryType, price, productId } = req.body;
    console.log('Получены данные заказа:', { concreteType, volume, deliveryType, price, productId, userId: req.user.id });

    if (!concreteType || typeof volume !== 'number' || volume <= 0 || !deliveryType || typeof price !== 'number' || price <= 0) {
        console.error('Некорректные данные заказа:', { concreteType, volume, deliveryType, price, productId });
        return res.status(400).json({ error: 'Все поля обязательны и должны быть корректного типа' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) {
            console.error('Пользователь не найден:', req.user.id);
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const order = await prisma.order.create({
            data: {
                userId: req.user.id,
                productId: productId || null,
                concreteType,
                volume: parseFloat(volume),
                deliveryType,
                price: parseFloat(price),
                status: 'NEW',
            },
        });
        console.log('Заказ успешно создан:', order);
        res.status(201).json({ message: 'Заказ создан', order });
    } catch (error) {
        console.error('Ошибка при создании заказа:', {
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack,
        });
        res.status(400).json({ error: `Ошибка при создании заказа: ${error.message}` });
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