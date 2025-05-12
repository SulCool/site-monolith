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

router.post('/seed', async (req, res) => {
  const products = [
    { name: 'M50', price: 4300, stock: 100, description: 'Для подготовительных работ' },
    { name: 'M100', price: 5700, stock: 100, description: 'Для фундаментов' },
    { name: 'M150', price: 4200, stock: 100, description: 'Для дорожек' },
    { name: 'M200', price: 1300, stock: 100, description: 'Для полов' },
    { name: 'M250', price: 6200, stock: 100, description: 'Для фундаментов' },
    { name: 'M300', price: 5300, stock: 100, description: 'Для монолитных стен' },
    { name: 'M350', price: 6600, stock: 100, description: 'Для перекрытий' },
    { name: 'M400', price: 7300, stock: 100, description: 'Для мостов' },
    { name: 'M450', price: 8500, stock: 100, description: 'Для плотин' },
    { name: 'M500', price: 9100, stock: 100, description: 'Для сейфов' },
    { name: 'W2', price: 3000, stock: 100, description: 'Для внутренних работ' },
    { name: 'W4', price: 4500, stock: 100, description: 'Для внутренних работ' },
    { name: 'W6', price: 5300, stock: 100, description: 'Для большинства работ' },
    { name: 'W8', price: 5800, stock: 100, description: 'Для бассейнов' },
    { name: 'W10', price: 6700, stock: 100, description: 'Для гидротехники' },
    { name: 'W15', price: 7200, stock: 100, description: 'Для гидротехники' },
    { name: 'W20', price: 8700, stock: 100, description: 'Для сложных конструкций' },
    { name: 'F50', price: 3200, stock: 100, description: 'Для помещений' },
    { name: 'F100', price: 4100, stock: 100, description: 'Для умеренного климата' },
    { name: 'F150', price: 4800, stock: 100, description: 'Для суровых зим' },
    { name: 'F200', price: 5300, stock: 100, description: 'Для суровых зим' },
    { name: 'F250', price: 6100, stock: 100, description: 'Для гидротехники' },
    { name: 'F300', price: 6900, stock: 100, description: 'Для гидротехники' },
    { name: 'F350', price: 7600, stock: 100, description: 'Для сложных условий' },
    { name: 'F400', price: 8200, stock: 100, description: 'Для сложных условий' },
    { name: 'F450', price: 9100, stock: 100, description: 'Для сложных условий' },
    { name: 'F500', price: 10500, stock: 100, description: 'Для экстремальных условий' },
  ];

  await prisma.product.createMany({ data: products });
  res.status(201).json({ message: 'Products seeded' });
});

module.exports = router;