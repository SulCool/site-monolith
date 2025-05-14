document.addEventListener('DOMContentLoaded', async () => {
    updateSummary();
    await loadConcreteCards();
});

let selectedCard = null;

async function loadConcreteCards() {
    try {
        const response = await fetch('http://localhost:3000/api/products', {
            credentials: 'include',
        });
        const products = await response.json();
        if (response.ok) {
            const cardsContainer = document.getElementById('concreteCards');
            cardsContainer.innerHTML = products.map(product => `
                <div class="concrete-card bg-white border border-gray-200 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:border-[#7fbf94] selected:border-blue-400"
                    onclick="selectConcrete('${product.name}', ${product.price}, ${product.id})">
                    <div class="flex justify-between items-start">
                        <h3 class="font-bold text-lg">${product.name}</h3>
                        <span class="bg-${product.label === 'Эконом' ? 'blue' : product.label === 'Популярный' ? 'green' : 'purple'}-100 text-${product.label === 'Эконом' ? 'blue' : product.label === 'Популярный' ? 'green' : 'purple'}-800 text-xs font-medium px-2.5 py-0.5 rounded">${product.label || 'Без категории'}</span>
                    </div>
                    <p class="text-gray-600 text-sm mt-2">${product.description || ''}</p>
                    <div class="mt-4 flex items-center justify-between">
                        <span class="text-gray-500 text-sm">от</span>
                        <span class="font-bold text-[#7fbf94]">${product.price.toLocaleString('ru-RU')} ₽/м³</span>
                    </div>
                </div>
            `).join('');
        } else {
            window.notify.show('Ошибка загрузки продуктов', 'error');
        }
    } catch (error) {
        console.error('Ошибка загрузки продуктов:', error);
        window.notify.show('Ошибка сервера', 'error');
    }
}

function selectConcrete(type, price, productId) {
    if (selectedCard) {
        selectedCard.classList.remove('selected');
    }
    const card = event.target.closest('.concrete-card');
    card.classList.add('selected');
    selectedCard = card;
    document.getElementById('concreteType').value = type;
    document.getElementById('concretePrice').value = price;
    document.getElementById('productId').value = productId;
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
    const concretePrice = parseFloat(document.getElementById('concretePrice').value) || 0;
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
    const concretePrice = parseFloat(document.getElementById('concretePrice').value);
    const deliveryType = document.getElementById('deliveryType').value || 'Стандартная';
    const productId = parseInt(document.getElementById('productId').value);

    if (!name || !phone || !address || !concreteType || isNaN(concreteAmount) || isNaN(concretePrice) || !productId) {
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
    console.log('Отправка заказа:', orderData);

    try {
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
            credentials: 'include',
        });

        const data = await response.json();
        console.log('Ответ от сервера:', { status: response.status, data });
        if (response.ok) {
            window.notify.show(`Заказ успешно отправлен! Статус: ${data.order.statusDisplay}`, 'success');
            document.getElementById('orderForm').reset();
            if (selectedCard) selectedCard.classList.remove('selected');
            selectedCard = null;
            document.getElementById('orderSummary').classList.add('hidden');
            document.getElementById('concreteType').value = '';
            document.getElementById('concretePrice').value = '';
            document.getElementById('productId').value = '';
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