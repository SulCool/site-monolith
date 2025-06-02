document.addEventListener('DOMContentLoaded', () => {
    console.log('register.js загружен');

    const registerForm = document.getElementById('register-form');
    if (!registerForm) {
        console.error('Форма с id="register-form" не найдена');
        return;
    }

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Форма отправлена');

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        console.log('Данные формы:', { name, email, password, confirmPassword });

        if (password !== confirmPassword) {
            showError('Пароли не совпадают');
            return;
        }

        try {
            console.log('Отправка запроса на регистрацию...');
            const response = await fetch('http://localhost:3000/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            console.log('Ответ сервера:', response.status, response.statusText);

            const data = await response.json();
            console.log('Данные ответа:', data);

            if (!response.ok) {
                if (data.errors) {
                    showError(data.errors.map(err => err.msg).join(', ')); // Ошибки валидации
                } else {
                    showError(data.error || 'Ошибка при регистрации'); // Другие ошибки
                }
                return;
            }

            showSuccess('Регистрация успешна! Теперь вы можете войти.'); 
            setTimeout(() => {
                window.location.href = '/pro';
            }, 2000); 
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
            showError('Ошибка подключения к серверу');
        }
    });
});