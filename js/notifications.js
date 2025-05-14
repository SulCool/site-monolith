class NotificationManager {
    constructor() {
        this.notifications = document.createElement('div');
        this.notifications.id = 'notification-container';
        this.notifications.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 2000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        if (document.body) {
            document.body.appendChild(this.notifications);
            console.log('Notification container added to body');
        } else {
            console.error('document.body is null, waiting for DOM load');
            document.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(this.notifications);
                console.log('Notification container added after DOM load');
            });
        }

        if (!document.getElementById('notification-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'notification-styles';
            styleSheet.textContent = `
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
                .animate-fade-in { animation: fade-in 0.3s ease; }
                .animate-fade-out { animation: fade-out 0.5s ease forwards; }
            `;
            document.head.appendChild(styleSheet);
            console.log('Animation styles added');
        }
    }

    show(message, type = 'info', duration = 3000) {
        if (!this.notifications) {
            console.error('Notification container not initialized');
            return;
        }
        const notification = document.createElement('div');
        notification.className = `p-4 rounded-lg shadow-lg text-white ${type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-gray-600'} animate-fade-in`;
        notification.textContent = message;

        this.notifications.appendChild(notification);
        console.log('Notification shown:', { message, type });

        setTimeout(() => {
            notification.classList.remove('animate-fade-in');
            notification.classList.add('animate-fade-out');
            setTimeout(() => notification.remove(), 500);
        }, duration);
    }
}


let notify;
document.addEventListener('DOMContentLoaded', () => {
    notify = new NotificationManager();
    window.notify = notify; 
});

function showSuccess(message) {
    if (notify) {
        notify.show(message, 'success');
    } else {
        console.warn('notify not initialized, using alert');
        alert(message);
    }
}

function showInfo(message) {
    if (notify) {
        notify.show(message, 'info');
    } else {
        console.warn('notify not initialized, using alert');
        alert(message);
    }
}

function showError(message) {
    if (notify) {
        notify.show(message, 'error');
    } else {
        console.warn('notify not initialized, using alert');
        alert(message);
    }
}

window.submitOrder = function() {
    showSuccess('Заказ успешно отправлен!');
};