let selectedCard = null;

function selectConcrete(type, price) {
    if (selectedCard) {
        selectedCard.classList.remove('selected');
    }
    const card = event.target.closest('.concrete-card');
    card.classList.add('selected');
    selectedCard = card;
    document.getElementById('concreteType').value = type;
    document.getElementById('concretePrice').value = price;
    updateSummary();
}

function changeAmount(delta) {
    let amount = parseFloat(document.getElementById('concreteAmount').value) + delta;
    if (amount < 0.5) amount = 0.5;
    document.getElementById('concreteAmount').value = amount.toFixed(1);
    updateSummary();
}

function updateSummary() {
    const name = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const concreteType = document.getElementById('concreteType').value;
    const concretePrice = parseInt(document.getElementById('concretePrice').value) || 0;
    const concreteAmount = parseFloat(document.getElementById('concreteAmount').value) || 0;
    const deliveryType = document.getElementById('deliveryType').value || 'Стандартная';

    document.getElementById('summaryName').textContent = name || 'Не указано';
    document.getElementById('summaryPhone').textContent = phone || 'Не указан';
    document.getElementById('summaryAddress').textContent = address || 'Не указан';
    document.getElementById('summaryConcrete').textContent = concreteType || 'Не выбрана';
    document.getElementById('summaryAmount').textContent = concreteAmount ? `${concreteAmount} м³` : '0 м³';
    document.getElementById('summaryDeliveryType').textContent = deliveryType || 'Не указан';
    document.getElementById('summaryTotal').textContent = concretePrice ? (concretePrice * concreteAmount).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' }) : '0 ₽';
}

function showSummary() {
    updateSummary();
    document.getElementById('orderSummary').classList.remove('hidden');
}

function hideSummary() {
    document.getElementById('orderSummary').classList.add('hidden');
}

async function submitOrder() {
    const name = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const concreteType = document.getElementById('concreteType').value;
    const concreteAmount = parseFloat(document.getElementById('concreteAmount').value);
    const concretePrice = parseInt(document.getElementById('concretePrice').value);
    const deliveryType = document.getElementById('deliveryType').value || 'Стандартная';

    if (!name || !phone || !address || !concreteType || !concreteAmount) {
        window.notify.show('Пожалуйста, заполните все поля и выберите бетон.', 'error');
        return;
    }

    const tokenRow = document.cookie.split('; ').find(row => row.startsWith('token='));
    const token = tokenRow ? tokenRow.split('=')[1] : null;
    if (!token) {
        window.notify.show('Пожалуйста, войдите в аккаунт для оформления заказа.', 'error');
        window.location.href = '/pro';
        return;
    }

    try {
        console.log('Отправка заказа:', { concreteType, volume: concreteAmount, deliveryType, price: concretePrice * concreteAmount });
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                concreteType,
                volume: concreteAmount,
                deliveryType,
                price: concretePrice * concreteAmount,
            }),
            credentials: 'include',
        });

        const data = await response.json();
        console.log('Ответ от сервера:', { status: response.status, data });
        if (response.ok) {
            window.notify.show('Заказ успешно отправлен!', 'success');
            document.getElementById('orderForm').reset();
            if (selectedCard) selectedCard.classList.remove('selected');
            selectedCard = null;
            document.getElementById('orderSummary').classList.add('hidden');
            document.getElementById('concreteType').value = '';
            document.getElementById('concretePrice').value = '';
            updateSummary();
        } else {
            window.notify.show(data.error || 'Ошибка при создании заказа.', 'error');
        }
    } catch (error) {
        console.error('Ошибка при отправке заказа:', error);
        window.notify.show('Произошла ошибка. Попробуйте позже.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateSummary();
});