document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav');

    async function updateNavigation() {
        try {
            const response = await fetch('http://localhost:3000/api/users/profile', {
                credentials: 'include',
            });
            const data = await response.json();

            if (response.ok) {
                const isAdmin = data.user.role === 'ADMIN';
                nav.innerHTML = `
                    <a href="/">Главная</a>
                    <a href="/order">Заказ</a>
                    <a href="/catalog">Категории товара</a>
                    <a href="/reviews">Отзывы</a>
                    <a href="/register">Регистрация</a>
                    <a href="/profile">Профиль</a>
                    ${isAdmin ? '<a href="/admin">Админка</a>' : ''}
                `;
            } else {
                nav.innerHTML = `
                    <a href="/">Главная</a>
                    <a href="/order">Заказ</a>
                    <a href="/catalog">Категории товара</a>
                    <a href="/reviews">Отзывы</a>
                    <a href="/register">Регистрация</a>
                    <a href="/pro">Вход</a>
                `;
            }
        } catch (error) {
            console.error('Ошибка при проверке авторизации:', error);
            nav.innerHTML = `
                <a href="/">Главная</a>
                <a href="/order">Заказ</a>
                <a href="/catalog">Категории товара</a>
                <a href="/reviews">Отзывы</a>
                <a href="/register">Регистрация</a>
                <a href="/pro">Вход</a>
            `;
        }
    }

    if (nav) {
        updateNavigation();
    }
});