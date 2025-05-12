function selectConcrete(type, price) {
    document.getElementById('concreteType').value = type;
    document.getElementById('concretePrice').value = price;

    document.querySelectorAll('.concrete-card').forEach(card => {
        card.classList.remove('border-blue-500', 'ring-2', 'ring-blue-300');
        card.classList.add('border-gray-200');
    });

    event.currentTarget.classList.remove('border-gray-200');
    event.currentTarget.classList.add('border-blue-500', 'ring-2', 'ring-blue-300');
}

function changeAmount(value) {
    const amountInput = document.getElementById('concreteAmount');
    let newValue = parseFloat(amountInput.value) + value;

    if (newValue < 0.5) newValue = 0.5;
    amountInput.value = newValue.toFixed(1);
}

function showSummary() {
    const form = document.getElementById('orderForm');
    const summary = document.getElementById('orderSummary');

    if (!form.fullName.value || !form.phone.value || !form.address.value || !form.concreteType.value) {
        alert('Пожалуйста, заполните все обязательные поля и выберите марку бетона');
        return;
    }

    document.getElementById('summaryName').textContent = form.fullName.value;
    document.getElementById('summaryPhone').textContent = form.phone.value;
    document.getElementById('summaryAddress').textContent = form.address.value;
    document.getElementById('summaryConcrete').textContent = form.concreteType.value;
    document.getElementById('summaryAmount').textContent = form.concreteAmount.value + ' м³';

    const total = parseFloat(form.concretePrice.value) * parseFloat(form.concreteAmount.value);
    document.getElementById('summaryTotal').textContent = total.toLocaleString('ru-RU') + ' ₽';

    summary.classList.remove('hidden');
    summary.scrollIntoView({ behavior: 'smooth' });
}

function hideSummary() {
    document.getElementById('orderSummary').classList.add('hidden');
}

async function submitOrder() {
    const form = document.getElementById('orderForm');
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Пожалуйста, войдите в аккаунт');
        window.location.href = '/pro';
        return;
    }

    const orderData = {
        concreteType: form.concreteType.value,
        volume: parseFloat(form.concreteAmount.value),
        deliveryType: 'Стандартная', 
        price: parseFloat(form.concretePrice.value) * parseFloat(form.concreteAmount.value),
    };

    try {
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(orderData),
        });
        const data = await response.json();
        if (response.ok) {
            alert('Заказ успешно оформлен! Мы свяжемся с вами.');
            form.reset();
            hideSummary();
            document.querySelectorAll('.concrete-card').forEach(card => {
                card.classList.remove('border-blue-500', 'ring-2', 'ring-blue-300');
                card.classList.add('border-gray-200');
            });

            const successMessage = document.createElement('div');
            successMessage.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center';
            successMessage.innerHTML = `
                <i class="fas fa-check-circle mr-2 text-xl"></i>
                <span>Ваш заказ успешно отправлен!</span>
            `;
            document.body.appendChild(successMessage);
            setTimeout(() => successMessage.remove(), 3000);
        } else {
            alert(data.error || 'Ошибка при оформлении заказа');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка сервера');
    }
}

document.getElementById('phone').addEventListener('input', function (e) {
    let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
    e.target.value = !x[2] ? x[1] : '+7 (' + x[2] + ') ' + x[3] + (x[4] ? '-' + x[4] : '') + (x[5] ? '-' + x[5] : '');
});