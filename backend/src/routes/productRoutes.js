const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

router.post('/', async (req, res) => {
  const { name, description, price, stock } = req.body;
  const product = await prisma.product.create({
    data: { name, description, price, stock },
  });
  res.status(201).json(product);
});

module.exports = router;