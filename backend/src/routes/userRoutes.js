const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); 
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
        res.status(201).json({ message: 'Пользователь зарегистрирован', user });
    } catch (error) {
        res.status(400).json({ error: 'Ошибка при регистрации' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Неверный пароль' });
        }
        res.json({ message: 'Вход успешен', user });
    } catch (error) {
        res.status(400).json({ error: 'Ошибка при входе' });
    }
});

module.exports = router;