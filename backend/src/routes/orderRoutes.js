require('dotenv').config();

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

const statusTranslations = {
  NEW: 'Новый',
  PROCESSING: 'В обработке',
  SHIPPED: 'Отправлен',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён'
};

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

const isAdmin = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user || user.role !== 'ADMIN') {
            console.error('Доступ запрещён: пользователь не администратор', { userId: req.user.id });
            return res.status(403).json({ error: 'Доступ запрещён' });
        }
        next();
    } catch (error) {
        console.error('Ошибка проверки роли администратора:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
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
        res.status(201).json({ 
            message: 'Заказ создан', 
            order: {
                ...order,
                statusDisplay: statusTranslations[order.status]
            }
        });
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
    try {
        const orders = await prisma.order.findMany({
            where: { userId: parseInt(userId) },
        });
        const ordersWithTranslation = orders.map(order => ({
            ...order,
            statusDisplay: statusTranslations[order.status]
        }));
        res.json(ordersWithTranslation);
    } catch (error) {
        console.error('Ошибка при загрузке заказов:', error);
        res.status(500).json({ error: 'Ошибка при загрузке заказов' });
    }
});

router.get('/admin', authenticateToken, isAdmin, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: { user: true },
            orderBy: { createdAt: 'desc' },
        });
        const ordersWithTranslation = orders.map(order => ({
            ...order,
            statusDisplay: statusTranslations[order.status]
        }));
        res.json({ orders: ordersWithTranslation });
    } catch (error) {
        console.error('Ошибка при загрузке заказов:', error);
        res.status(500).json({ error: 'Ошибка при загрузке заказов' });
    }
});

router.patch('/:id/status', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['NEW', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    
    if (!validStatuses.includes(status)) {
        console.error('Некорректный статус:', status);
        return res.status(400).json({ error: 'Некорректный статус заказа' });
    }

    try {
        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: { status },
            include: { user: true },
        });
        console.log('Статус заказа обновлён:', order);
        res.json({ 
            message: 'Статус заказа обновлён', 
            order: {
                ...order,
                statusDisplay: statusTranslations[order.status]
            }
        });
    } catch (error) {
        console.error('Ошибка при обновлении статуса:', error);
        res.status(400).json({ error: `Ошибка при обновлении статуса: ${error.message}` });
    }
});

module.exports = router;