document.addEventListener('DOMContentLoaded', async () => {
    const navMenu = document.getElementById('nav-menu');
    if (!navMenu) {
        console.error('nav-menu не найден');
        return;
    }

    let logoutLink = document.getElementById('logout-link');
    let adminLink = document.getElementById('admin-link');
    let profileLink = document.getElementById('profile-link');
    let registerLink = document.getElementById('register-link');
    let loginLink = document.getElementById('login-link');

    if (profileLink) profileLink.classList.add('hidden');
    if (logoutLink) logoutLink.classList.add('hidden');
    if (adminLink) adminLink.classList.add('hidden');
    if (registerLink) registerLink.classList.add('hidden');
    if (loginLink) loginLink.classList.add('hidden');

    try {
        const response = await fetch('http://localhost:3000/api/users/profile', {
            credentials: 'include',
        });
        const data = await response.json();

        if (response.ok) {
            if (!logoutLink) {
                logoutLink = document.createElement('a');
                logoutLink.href = '#';
                logoutLink.id = 'logout-link';
                logoutLink.textContent = 'Выйти';
                navMenu.appendChild(logoutLink);
            }
            logoutLink.classList.remove('hidden');
            attachLogoutEvent(logoutLink); 

            if (profileLink) profileLink.classList.remove('hidden');
            if (adminLink && data.user.role === 'ADMIN') adminLink.classList.remove('hidden');
        } else {
            if (!registerLink) {
                registerLink = document.createElement('a');
                registerLink.href = '/register';
                registerLink.id = 'register-link';
                registerLink.textContent = 'Регистрация';
                navMenu.appendChild(registerLink);
            }
            registerLink.classList.remove('hidden');

            if (!loginLink) {
                loginLink = document.createElement('a');
                loginLink.href = '/pro';
                loginLink.id = 'login-link';
                loginLink.textContent = 'Войти';
                navMenu.appendChild(loginLink);
            }
            loginLink.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        if (!registerLink) {
            registerLink = document.createElement('a');
            registerLink.href = '/register';
            registerLink.id = 'register-link';
            registerLink.textContent = 'Регистрация';
            navMenu.appendChild(registerLink);
        }
        registerLink.classList.remove('hidden');

        if (!loginLink) {
            loginLink = document.createElement('a');
            loginLink.href = '/pro';
            loginLink.id = 'login-link';
            loginLink.textContent = 'Войти';
            navMenu.appendChild(loginLink);
        }
        loginLink.classList.remove('hidden');
        window.notify.show('Ошибка сервера', 'error');
    }
});

function attachLogoutEvent(logoutLink) {
    console.log('Привязка события к logoutLink:', logoutLink);
    logoutLink.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('Клик по кнопке Выйти');
        try {
            const logoutResponse = await fetch('http://localhost:3000/api/users/logout', {
                method: 'POST',
                credentials: 'include',
            });
            console.log('Ответ от сервера:', logoutResponse.status);
            const logoutData = await logoutResponse.json();
            if (logoutResponse.ok) {
                console.log('Выход успешен, перенаправление на /pro');
                window.notify.show('Выход успешен', 'success');
                window.location.href = '/pro';
            } else {
                console.error('Ошибка от сервера:', logoutData.error);
                window.notify.show(logoutData.error || 'Ошибка при выходе', 'error');
            }
        } catch (error) {
            console.error('Ошибка при выходе:', error);
            window.notify.show('Ошибка сервера', 'error');
        }
    });
}