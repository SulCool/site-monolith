document.addEventListener('DOMContentLoaded', () => {
    const slidesContainer = document.getElementById('slides-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    let currentIndex = 0;
    let slideInterval;

    async function loadReviews() {
        try {
            const response = await fetch('http://localhost:3000/api/reviews', {
                credentials: 'include',
            });
            const reviews = await response.json();
            slidesContainer.innerHTML = '';
            const dotsContainer = document.querySelector('.dots');
            dotsContainer.innerHTML = '';

            reviews.forEach((review, index) => {
                const slide = document.createElement('div');
                slide.className = `slide ${index === 0 ? 'active' : ''}`;
                const concreteInfo =
                    review.concreteType && review.volume > 0 ? `Бетон ${review.concreteType} • ${review.volume} м³` : '';
                const deliveryTag = review.deliveryType ? `${review.deliveryType}` : '';

                slide.innerHTML = `
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
                            <span class="tag">${deliveryTag}</span>
                        </div>
                    </div>
                `;

                slidesContainer.appendChild(slide);

                const dot = document.createElement('button');
                dot.className = `dot ${index === 0 ? 'active' : ''}`;
                dot.dataset.index = index;
                dot.addEventListener('click', () => goToSlide(index));
                dotsContainer.appendChild(dot);
            });

            const updatedSlides = document.querySelectorAll('.slide');
            const updatedDots = document.querySelectorAll('.dot');
            if (updatedSlides.length > 0) {
                currentIndex = 0;
                updatedSlides[currentIndex].classList.add('active');
                updatedDots[currentIndex].classList.add('active');
                startSlider();
            } else {
                slidesContainer.innerHTML = '<p>Отзывов пока нет.</p>';
            }
        } catch (error) {
            console.error('Ошибка загрузки отзывов:', error);
            slidesContainer.innerHTML = '<p>Ошибка загрузки отзывов.</p>';
        }
    }

    function startSlider() {
        clearInterval(slideInterval);
        const slides = document.querySelectorAll('.slide');
        if (slides.length > 0) {
            slideInterval = setInterval(() => {
                goToSlide((currentIndex + 1) % slides.length);
            }, 6000);
        }
    }

    function goToSlide(index) {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        if (index === currentIndex || slides.length === 0) return;
        slides[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');
        currentIndex = index;
        slides[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');
        clearInterval(slideInterval);
        startSlider();
    }

    slidesContainer.addEventListener('mouseenter', () => clearInterval(slideInterval));
    slidesContainer.addEventListener('mouseleave', startSlider);

    prevBtn.addEventListener('click', () => {
        const slides = document.querySelectorAll('.slide');
        goToSlide((currentIndex - 1 + slides.length) % slides.length);
    });

    nextBtn.addEventListener('click', () => {
        const slides = document.querySelectorAll('.slide');
        goToSlide((currentIndex + 1) % slides.length);
    });

    const ratingStars = document.querySelectorAll('.rating-input i');
    const ratingInput = document.getElementById('rating');

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

    const reviewForm = document.getElementById('review-form');

    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const authResponse = await fetch('http://localhost:3000/api/users/profile', {
                credentials: 'include',
            });
            const userData = await authResponse.json();

            if (!authResponse.ok) {
                alert('Сессия истекла. Пожалуйста, войдите снова.');
                window.location.href = '/pro';
                return;
            }

            const company = document.getElementById('company').value || 'Частный клиент';
            const rating = document.getElementById('rating').value;
            const reviewText = document.getElementById('review').value;
            const concreteType = document.getElementById('concrete-type').value;
            const volume = parseFloat(document.getElementById('volume').value) || null;
            const deliveryType = document.getElementById('delivery-type').value;

            if (!rating) {
                alert('Пожалуйста, поставьте оценку');
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

                const notification = document.createElement('div');
                notification.className = 'notification';
                notification.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    Спасибо! Ваш отзыв добавлен
                `;
                document.body.appendChild(notification);

                setTimeout(() => {
                    notification.classList.add('fade-out');
                    setTimeout(() => notification.remove(), 300);
                }, 3000);
            } else {
                alert(newReview.error || 'Ошибка при добавлении отзыва');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка сервера');
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