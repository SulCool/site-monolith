document.addEventListener('DOMContentLoaded', () => {
    const reviewsContainer = document.getElementById('reviews-container');
    const reviewForm = document.getElementById('review-form');
    const ratingStars = document.querySelectorAll('.rating-input i');
    const ratingInput = document.getElementById('rating');

    async function loadReviews() {
        try {
            const response = await fetch('http://localhost:3000/api/reviews', {
                credentials: 'include',
            });
            const reviews = await response.json();
            reviewsContainer.innerHTML = '';

            if (reviews.length === 0) {
                reviewsContainer.innerHTML = '<p>Отзывов пока нет.</p>';
                return;
            }

            reviews.forEach(review => {
                const reviewCard = document.createElement('div');
                reviewCard.className = 'review-card';
                const concreteInfo =
                    review.concreteType && review.volume > 0 ? `Бетон ${review.concreteType} • ${review.volume} м³` : '';
                const deliveryTag = review.deliveryType ? `${review.deliveryType}` : '';

                reviewCard.innerHTML = `
                    <div class="user-info">
                        <div class="avatar"><i class="fas fa-user"></i></div>
                        <div>
                            <h3>${review.user.name}</h3>
                            <p>${review.company || 'Частный клиент'}</p>
                        </div>
                    </div>
                    <div class="rating">
                        ${Array(5)
                        .fill()
                        .map((_, i) => `<i class="fas fa-star rating-star ${i < review.rating ? 'active' : ''}"></i>`)
                        .join('')}
                    </div>
                    <p class="review-text">"${review.text}"</p>
                    <div class="order-info">
                        <div class="details">
                            <div>
                                ${concreteInfo ? `<p>${concreteInfo}</p>` : ''}
                                <p>Доставка ${new Date(review.createdAt).toLocaleDateString('ru-RU')}</p>
                            </div>
                            ${deliveryTag ? `<span class="tag">${deliveryTag}</span>` : ''}
                        </div>
                    </div>
                `;

                reviewsContainer.appendChild(reviewCard);
            });
        } catch (error) {
            console.error('Ошибка загрузки отзывов:', error);
            reviewsContainer.innerHTML = '<p>Ошибка загрузки отзывов.</p>';
        }
    }

    ratingStars.forEach(star => {
        star.addEventListener('mouseenter', () => {
            const hoverRating = parseInt(star.dataset.rating);
            ratingStars.forEach((s, i) => {
                s.classList.toggle('hovered', i < hoverRating);
            });
        });

        star.addEventListener('mouseleave', () => {
            const currentRating = ratingInput.value ? parseInt(ratingInput.value) : 0;
            ratingStars.forEach((s, i) => {
                s.classList.toggle('hovered', i < currentRating);
            });
        });

        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            ratingInput.value = rating;
            ratingStars.forEach((s, i) => {
                s.classList.toggle('active', i < rating);
                s.classList.remove('hovered');
            });
        });
    });

    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const authResponse = await fetch('http://localhost:3000/api/users/profile', {
                credentials: 'include',
            });
            const userData = await authResponse.json();

            if (!authResponse.ok) {
                showNotification('Сессия истекла. Пожалуйста, войдите снова.', 'error');
                setTimeout(() => window.location.href = '/pro', 1000);
                return;
            }

            const company = document.getElementById('company').value || 'Частный клиент';
            const rating = document.getElementById('rating').value;
            const reviewText = document.getElementById('review').value;
            const concreteType = document.getElementById('concrete-type').value;
            const volume = parseFloat(document.getElementById('volume').value) || null;
            const deliveryType = document.getElementById('delivery-type').value;

            if (!rating) {
                showNotification('Пожалуйста, поставьте оценку', 'error');
                return;
            }

            const response = await fetch('http://localhost:3000/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rating: parseInt(rating),
                    text: reviewText,
                    concreteType,
                    volume,
                    deliveryType,
                    company,
                }),
                credentials: 'include',
            });

            const newReview = await response.json();

            if (response.ok) {
                reviewForm.reset();
                ratingStars.forEach(star => star.classList.remove('active', 'hovered'));
                ratingInput.value = '';
                await loadReviews();
                showNotification('Спасибо! Ваш отзыв добавлен', 'success');
            } else {
                showNotification(newReview.error || 'Ошибка при добавлении отзыва', 'error');
            }
        } catch (error) {
            showNotification('Ошибка сервера', 'error');
        }
    });

    const scrollToTopBtn = document.getElementById('scroll-to-top');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    });

    loadReviews();
});