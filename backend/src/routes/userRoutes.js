const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = ''; 

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Токен не предоставлен' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Неверный токен' });
        req.user = user;
        next();
    });
};

router.post('/register', [
    body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов'),
    body('name').notEmpty().withMessage('Имя обязательно'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Ошибки валидации:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;
    console.log('Регистрация пользователя:', { email, name });

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            console.log('Пользователь с таким email уже существует:', email);
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Хешированный пароль:', hashedPassword);

        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name },
        });
        console.log('Пользователь создан:', user);
        res.status(201).json({ message: 'Пользователь зарегистрирован', user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(500).json({ error: 'Ошибка при регистрации' });
    }
});

router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
    body('password').notEmpty().withMessage('Пароль обязателен'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Ошибки валидации:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log('Попытка входа:', { email });

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log('Пользователь не найден:', email);
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        console.log('Найденный пользователь:', user);
        console.log('Введённый пароль:', password);
        console.log('Хеш пароля в базе:', user.password);
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Сравнение пароля:', { password, isValid: isPasswordValid });

        if (!isPasswordValid) return res.status(401).json({ error: 'Неверный пароль' });

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
        console.log('Токен сгенерирован:', token);
        res.json({ message: 'Вход успешен', token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        console.error('Ошибка при входе:', error);
        res.status(500).json({ error: 'Ошибка при входе' });
    }
});

router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { orders: true },
        });
        if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
        res.json({ user: { id: user.id, email: user.email, name: user.name, orders: user.orders } });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при загрузке профиля' });
    }
});

module.exports = router;