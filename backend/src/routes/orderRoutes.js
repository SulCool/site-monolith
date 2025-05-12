const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { userId, productId, quantity } = req.body;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.stock < quantity) {
    return res.status(400).json({ error: 'Product not available' });
  }
  const total = product.price * quantity;
  const order = await prisma.order.create({
    data: {
      userId,
      productId,
      quantity,
      total,
    },
  });


  await prisma.product.update({
    where: { id: productId },
    data: { stock: product.stock - quantity },
  });
  res.status(201).json(order);
});


router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const orders = await prisma.order.findMany({
    where: { userId: parseInt(userId) },
    include: { product: true },
  });
  res.json(orders);
});

module.exports = router;