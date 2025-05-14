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
    const productId = 1; // Замените на динамический выбор productId

    if (!name || !phone || !address || !concreteType || isNaN(concreteAmount) || isNaN(concretePrice)) {
        window.notify.show('Пожалуйста, заполните все поля и выберите бетон.', 'error');
        return;
    }

    const orderData = {
        concreteType,
        volume: concreteAmount,
        deliveryType,
        price: concretePrice * concreteAmount,
        productId,
    };
    console.log('Отправка заказа:', orderData, 'Типы данных:', {
        concreteType: typeof concreteType,
        volume: typeof concreteAmount,
        deliveryType: typeof deliveryType,
        price: typeof (concretePrice * concreteAmount),
        productId: typeof productId,
    });

    try {
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
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
            if (response.status === 401 || response.status === 403) {
                window.notify.show('Пожалуйста, войдите в аккаунт.', 'error');
                window.location.href = '/pro';
            }
        }
    } catch (error) {
        console.error('Ошибка при отправке заказа:', error);
        window.notify.show('Произошла ошибка. Попробуйте позже.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateSummary();
});