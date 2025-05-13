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

router.post('/', authenticateToken, async (req, res) => {
    const { rating, text, concreteType, volume, deliveryType, company } = req.body;
    try {
        const review = await prisma.review.create({
            data: {
                userId: req.user.id,
                rating,
                text,
                concreteType,
                volume,
                deliveryType,
                company,
            },
            include: { user: true }, 
        });
        res.status(201).json(review);
    } catch (error) {
        console.error('Ошибка при создании отзыва:', error);
        res.status(400).json({ error: 'Ошибка при создании отзыва' });
    }
});

router.get('/', async (req, res) => {
    const reviews = await prisma.review.findMany({
        include: { user: true },
    });
    res.json(reviews);
});

module.exports = router;