document.addEventListener("DOMContentLoaded", () => {
    const activeTrack = document.querySelector(".active-products__track");
    let activeSlides = Array.from(activeTrack.children);

    const slideWidth = 185; // 슬라이드 개별 너비
    const gap = 15; // 간격
    const fullSlideWidth = slideWidth + gap;
    const visibleSlides = 3; // 한 화면에 보이는 슬라이드 개수
    let currentIndex = visibleSlides;

    // ✅ 슬라이드 복제 (무한 루프)
    const replicateActiveSlides = () => {
        const firstClones = activeSlides.slice(0, visibleSlides).map(slide => slide.cloneNode(true));
        const lastClones = activeSlides.slice(-visibleSlides).map(slide => slide.cloneNode(true));

        lastClones.forEach(clone => activeTrack.insertBefore(clone, activeSlides[0]));
        firstClones.forEach(clone => activeTrack.appendChild(clone));
    };

    replicateActiveSlides();
    activeSlides = Array.from(activeTrack.children);
    activeTrack.style.width = `${activeSlides.length * fullSlideWidth}px`;

    const moveToActiveSlide = (index) => {
        activeTrack.style.transition = "transform 0.5s ease-in-out";
        activeTrack.style.transform = `translateX(-${fullSlideWidth * index}px)`;
        currentIndex = index;

        if (index >= activeSlides.length - visibleSlides) {
            setTimeout(() => {
                activeTrack.style.transition = "none";
                currentIndex = visibleSlides;
                activeTrack.style.transform = `translateX(-${fullSlideWidth * currentIndex}px)`;
            }, 500);
        }

        if (index < visibleSlides) {
            setTimeout(() => {
                activeTrack.style.transition = "none";
                currentIndex = activeSlides.length - (2 * visibleSlides);
                activeTrack.style.transform = `translateX(-${fullSlideWidth * currentIndex}px)`;
            }, 500);
        }
    };

    const startActiveAutoSlide = () => {
        return setInterval(() => {
            moveToActiveSlide(currentIndex + 1);
        }, 3000);
    };

    let activeAutoSlideInterval = startActiveAutoSlide();

    activeTrack.addEventListener("mouseenter", () => {
        clearInterval(activeAutoSlideInterval);
    });

    activeTrack.addEventListener("mouseleave", () => {
        activeAutoSlideInterval = startActiveAutoSlide();
    });
});
