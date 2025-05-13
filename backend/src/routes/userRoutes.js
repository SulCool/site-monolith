require('dotenv').config();

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;
const RESET_SECRET = process.env.JWT_SECRET;
const transporter = nodemailer.createTransport({
    service: 'mail.ru',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
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

    const { email, password, rememberMe } = req.body;
    console.log('Попытка входа:', { email, rememberMe });

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log('Пользователь не найден:', email);
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: 'Неверный пароль' });

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '1h' });

        const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000;

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge,
            sameSite: 'Strict',
        });

        res.json({ message: 'Вход успешен', user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        console.error('Ошибка при входе:', error);
        res.status(500).json({ error: 'Ошибка при входе' });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    });
    res.json({ message: 'Выход успешен' });
});

router.post('/reset-password', async (req, res) => {
    const { token, newPassword, confirmPassword } = req.body;
    console.log('Запрос на сброс пароля:', { token });

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'Пароли не совпадают' });
    }

    try {
        const decoded = jwt.verify(token, RESET_SECRET);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: decoded.id },
            data: { password: hashedPassword },
        });
        console.log('Пароль обновлён для пользователя:', decoded.email);
        res.status(200).json({ message: 'Пароль успешно обновлён' });
    } catch (error) {
        console.error('Ошибка при сбросе пароля:', error);
        res.status(500).json({ error: 'Ошибка при сбросе пароля' });
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

router.post('/forgot-password', [
    body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Ошибки валидации:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    console.log('Запрос сброса пароля для:', email);

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log('Пользователь не найден:', email);
            return res.status(404).json({ error: 'Пользователь с таким email не найден' });
        }

        const resetToken = jwt.sign({ id: user.id, email: user.email }, RESET_SECRET, { expiresIn: '1h' });
        const resetLink = `http://localhost:3000/reset-password-confirm?token=${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Сброс пароля',
            text: `Щелкните по ссылке для сброса пароля: ${resetLink}`,
        };

        await transporter.sendMail(mailOptions);
        console.log('Email с инструкциями отправлен:', email);
        res.status(200).json({ message: 'Инструкции по сбросу пароля отправлены на ваш email' });
    } catch (error) {
        console.error('Ошибка при отправке email:', error);
        res.status(500).json({ error: 'Ошибка при запросе сброса пароля' });
    }
});

module.exports = router;