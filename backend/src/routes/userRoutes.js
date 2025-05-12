const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
    res.status(201).json({ message: 'User created', user: { id: user.id, email, name } });
  } catch (error) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json({ message: 'Logged in', user: { id: user.id, email, name: user.name } });
});

module.exports = router;