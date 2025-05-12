const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { userId, rating, text, concreteType, volume, deliveryType } = req.body;
  try {
    const review = await prisma.review.create({
      data: {
        userId,
        rating,
        text,
        concreteType,
        volume,
        deliveryType,
      },
    });
    res.status(201).json(review);
  } catch (error) {
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