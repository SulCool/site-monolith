document.addEventListener('DOMContentLoaded', () => {
    const slidesContainer = document.getElementById('slides-container');
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    let currentIndex = 0;
    let slideInterval;

    function startSlider() {
        slideInterval = setInterval(() => {
            goToSlide((currentIndex + 1) % slides.length);
        }, 6000);
    }

    function goToSlide(index) {
        if (index === currentIndex) return;
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

    prevBtn.addEventListener('click', () => goToSlide((currentIndex - 1 + slides.length) % slides.length));
    nextBtn.addEventListener('click', () => goToSlide((currentIndex + 1) % slides.length));
    dots.forEach(dot => dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index))));

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

    reviewForm.addEventListener('submit', e => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const company = document.getElementById('company').value || 'Частный клиент';
        const rating = document.getElementById('rating').value;
        const reviewText = document.getElementById('review').value;
        const concreteType = document.getElementById('concrete-type').value;
        const volume = document.getElementById('volume').value;
        const deliveryType = document.getElementById('delivery-type').value;

        if (!rating) {
            alert('Пожалуйста, поставьте оценку');
            return;
        }

        const newSlide = document.createElement('div');
        newSlide.className = 'slide';
        newSlide.style.opacity = '0';
        newSlide.style.visibility = 'hidden';

        const concreteInfo = concreteType && volume > 0 ? `Бетон ${concreteType} • ${volume} м³` : '';
        const deliveryTag = deliveryType ? `<span class="tag">${deliveryType}</span>` : '';

        newSlide.innerHTML = `
            <div class="user-info">
                <div class="avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div>
                    <h3>${name}</h3>
                    <p>${company}</p>
                </div>
            </div>
            <div class="rating">
                ${Array(5).fill().map((_, i) => `<i class="fas fa-star rating-star ${i < rating ? 'active' : ''}"></i>`).join('')}
            </div>
            <p class="review-text">"${reviewText}"</p>
            <div class="order-info">
                <div class="details">
                    <div>
                        ${concreteInfo ? `<p class="font-medium">${concreteInfo}</p>` : ''}
                        <p>Доставка ${new Date().toLocaleDateString('ru-RU')}</p>
                    </div>
                    ${deliveryTag}
                </div>
            </div>
        `;

        slidesContainer.appendChild(newSlide);
        const updatedSlides = document.querySelectorAll('.slide');
        const dotsContainer = document.querySelector('.dots');
        const newDot = document.createElement('button');
        newDot.className = 'dot';
        newDot.dataset.index = updatedSlides.length - 1;
        dotsContainer.appendChild(newDot);

        const updatedDots = document.querySelectorAll('.dot');
        newDot.addEventListener('click', () => goToSlide(parseInt(newDot.dataset.index)));

        reviewForm.reset();
        ratingStars.forEach(star => star.classList.remove('active', 'hovered'));
        ratingInput.value = '';

        setTimeout(() => {
            updatedSlides[currentIndex].classList.remove('active');
            updatedDots[currentIndex].classList.remove('active');
            currentIndex = updatedSlides.length - 1;
            newSlide.classList.add('active');
            newDot.classList.add('active');
            clearInterval(slideInterval);
            startSlider();
        }, 100);

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
    });

    startSlider();
});