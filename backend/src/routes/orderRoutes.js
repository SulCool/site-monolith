const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
    const { userId, concreteType, volume, deliveryType, price } = req.body;
    try {
        const order = await prisma.order.create({
            data: {
                userId,
                concreteType,
                volume,
                deliveryType,
                price,
                status: 'NEW',
            },
        });
        res.status(201).json({ message: 'Заказ создан', order });
    } catch (error) {
        res.status(400).json({ error: 'Ошибка при создании заказа' });
    }
});

router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    const orders = await prisma.order.findMany({
        where: { userId: parseInt(userId) },
    });
    res.json(orders);
});

module.exports = router;