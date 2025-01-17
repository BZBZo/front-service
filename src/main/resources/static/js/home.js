$(document).ready(() => {
    getToken()
        .then(() => {
            setupAjax();
            return checkToken();
        })
        .catch(error => {
            console.error('토큰을 가져오는 데 실패했습니다:', error);
        });

    // 회원 정보 수정 버튼을 클릭 시 /webs/profile 로 이동
    $('#profileEdit').click(() => {
        window.location.href = '/webs/profile';
    });

    // 서버에서 상품 목록을 가져와서 동적으로 슬라이드 생성
    $(document).ready(() => {
        $.ajax({
            url: '/loginSuccess', // 상품 데이터를 받아올 URL
            method: 'GET',
            success: function (response) {
                // response에서 제품 목록을 가져오기
                const products = response.products; // 전체 상품 목록
                const congproducts = response.congproducts; // 공구 가능 상품 목록

                // 관련 상품 슬라이드에 상품 추가
                const relatedTrack = document.querySelector(".related-products__track");

                // 기존 슬라이드 삭제
                relatedTrack.innerHTML = '';

                // 전체 상품 목록을 슬라이드로 추가
                products.forEach(product => {
                    const productSlide = document.createElement('li');
                    productSlide.classList.add('related-products__slide');

                    productSlide.innerHTML = `
                    <div class="related-products__card">
                        <div class="related-products__image">
                            ${product.mainPicturePath ?
                        `<img src="${product.mainPicturePath}" alt="상품 이미지">` :
                        `<p>상품 이미지 없음</p>`}
                        </div>
                        <span class="related-products__badge" ${product.isCong ? '' : 'style="display:none;"'}>
                            <img src="/images/group_yes.png" alt="공구 가능 아이콘">
                        </span>
                        <p class="related-products__name">${product.name}</p>
                        <p class="related-products__price">${product.price} 원</p>
                    </div>
                `;
                    relatedTrack.appendChild(productSlide);
                });

                // 공구 가능 상품 슬라이드 추가
                const congTrack = document.querySelector(".cong-products__track");  // 별도로 공구 가능 상품을 위한 트랙

                // 기존 슬라이드 삭제
                congTrack.innerHTML = '';

                // 공구 가능 상품 목록을 슬라이드로 추가
                congproducts.forEach(product => {
                    const productSlide = document.createElement('li');
                    productSlide.classList.add('related-products__slide');

                    productSlide.innerHTML = `
                    <div class="related-products__card">
                        <div class="related-products__image">
                            ${product.mainPicturePath ?
                        `<img src="${product.mainPicturePath}" alt="상품 이미지">` :
                        `<p>상품 이미지 없음</p>`}
                        </div>
                        <span class="related-products__badge" ${product.isCong ? '' : 'style="display:none;"'}>
                            <img src="/images/group_yes.png" alt="공구 가능 아이콘">
                        </span>
                        <p class="related-products__name">${product.name}</p>
                        <p class="related-products__price">${product.price} 원</p>
                    </div>
                `;
                    congTrack.appendChild(productSlide);
                });

                // 슬라이드 갱신 후 슬라이더 초기화 (기존 슬라이더 복제 로직)
                replicateRelatedSlides();
            },
            error: function (error) {
                console.error("상품 목록을 가져오는 데 실패했습니다:", error);
            }
        });
    });

});

document.addEventListener("DOMContentLoaded", () => {
    // ************ 메인 3열 배너 슬라이드 ************
    const sliderTrack = document.querySelector(".slider-track");
    let slides = Array.from(sliderTrack.children);

    const slideWidth = 700; // 슬라이드 너비
    const gap = 20; // 슬라이드 간 간격
    const fullSlideWidth = slideWidth + gap; // 슬라이드 하나의 전체 크기
    const visibleSlides = 3; // 화면에 표시되는 슬라이드 수
    let currentIndex = visibleSlides; // 복제된 뒤 실제 첫 슬라이드 시작 위치

    // 슬라이드 복제 함수
    const replicateSlides = () => {
        const firstClones = slides.slice(0, visibleSlides).map((slide) => slide.cloneNode(true));
        const lastClones = slides.slice(-visibleSlides).map((slide) => slide.cloneNode(true));

        // 앞뒤로 복제 슬라이드 추가
        lastClones.forEach((clone) => sliderTrack.insertBefore(clone, slides[0]));
        firstClones.forEach((clone) => sliderTrack.appendChild(clone));
    };

    // 초기 복제 및 트랙 설정
    replicateSlides();
    slides = Array.from(sliderTrack.children); // 복제 후 전체 슬라이드 목록 갱신
    sliderTrack.style.width = `${slides.length * fullSlideWidth}px`; // 트랙의 전체 너비 설정

    // 초기 위치 설정 (중앙 배너가 가운데 오도록 조정)
    const initialOffset = fullSlideWidth * (currentIndex - Math.floor(visibleSlides / 2));
    sliderTrack.style.transform = `translateX(-${initialOffset}px)`;

    // 슬라이드 이동 함수
    const moveToSlide = (index) => {
        sliderTrack.style.transition = "transform 0.5s ease-in-out"; // 애니메이션 적용
        sliderTrack.style.transform = `translateX(-${fullSlideWidth * (index - Math.floor(visibleSlides / 2))}px)`;
        currentIndex = index;

        // 마지막 슬라이드에서 첫 번째 슬라이드로 루프 처리
        if (index >= slides.length - visibleSlides) {
            setTimeout(() => {
                sliderTrack.style.transition = "none"; // 애니메이션 제거
                currentIndex = visibleSlides; // 복제된 첫 번째 슬라이드로 이동
                sliderTrack.style.transform = `translateX(-${fullSlideWidth * (currentIndex - Math.floor(visibleSlides / 2))}px)`;
            }, 500);
        }

        // 첫 번째 슬라이드에서 마지막 슬라이드로 루프 처리
        if (index < visibleSlides) {
            setTimeout(() => {
                sliderTrack.style.transition = "none"; // 애니메이션 제거
                currentIndex = slides.length - (2 * visibleSlides); // 복제된 마지막 슬라이드로 이동
                sliderTrack.style.transform = `translateX(-${fullSlideWidth * (currentIndex - Math.floor(visibleSlides / 2))}px)`;
            }, 500);
        }
    };

    // 자동 슬라이드
    const startAutoSlide = () => {
        return setInterval(() => {
            moveToSlide(currentIndex + 1);
        }, 3000); // 3초 간격으로 슬라이드 이동
    };

    let autoSlideInterval = startAutoSlide();

    // 마우스 이벤트로 자동 슬라이드 제어
    sliderTrack.addEventListener("mouseenter", () => {
        clearInterval(autoSlideInterval);
    });

    sliderTrack.addEventListener("mouseleave", () => {
        autoSlideInterval = startAutoSlide();
    });

    //************************ */ 두 번째 슬라이더: 연관 상품 슬라이더
    const relatedTrack = document.querySelector(".related-products__track");
    const relatedSlides = Array.from(relatedTrack.children);

    const relatedCardWidth = 185; // 카드 크기
    const relatedGap = 15; // 카드 간격
    const relatedVisibleSlides = 5; // 화면에 표시되는 카드 수
    const relatedSlideWidth = relatedCardWidth + relatedGap; // 카드 하나의 전체 크기
    const relatedTotalSlides = relatedSlides.length;

// 슬라이드 복제 (앞뒤 복제)
    const replicateRelatedSlides = () => {
        const firstClones = relatedSlides.slice(0, relatedVisibleSlides).map((slide) => slide.cloneNode(true));
        const lastClones = relatedSlides.slice(-relatedVisibleSlides).map((slide) => slide.cloneNode(true));

        lastClones.forEach((clone) => relatedTrack.insertBefore(clone, relatedSlides[0]));
        firstClones.forEach((clone) => relatedTrack.appendChild(clone));
    };

// 초기 복제 및 트랙 설정
    replicateRelatedSlides();
    const allSlides = Array.from(relatedTrack.children);
    const totalSlideCount = allSlides.length;
    // 트랙을 중앙으로 정렬
    const initialOffset1 = fullSlideWidth * (currentIndex - 2); // 중앙 배너 위치 조정
    sliderTrack.style.transform = `translateX(-${initialOffset1}px)`;

// 트랙 너비 설정
    relatedTrack.style.width = `${totalSlideCount * relatedSlideWidth}px`;

// 트랙 초기 위치 설정
    let relatedCurrentIndex = relatedVisibleSlides; // 첫 번째 슬라이드의 인덱스
    const relatedInitialOffset = relatedSlideWidth * relatedCurrentIndex; // 초기 위치
    relatedTrack.style.transition = "none"; // 초기 애니메이션 제거
    relatedTrack.style.transform = `translateX(-${relatedInitialOffset}px)`; // 정확히 5개 슬라이드 표시

// 슬라이드 이동 함수
    const moveToRelatedSlide = (index) => {
        // 이동 거리 계산
        const offset = index * relatedSlideWidth;

        // 트랙 이동
        relatedTrack.style.transition = "transform 0.3s ease-in-out";
        relatedTrack.style.transform = `translateX(-${offset}px)`;

        // 현재 인덱스 업데이트
        relatedCurrentIndex = index;

        // 마지막 슬라이드에서 첫 번째 슬라이드로 루프 처리
        if (index >= totalSlideCount - relatedVisibleSlides) {
            setTimeout(() => {
                relatedTrack.style.transition = "none";
                relatedCurrentIndex = relatedVisibleSlides; // 복제된 첫 번째 슬라이드로 이동
                relatedTrack.style.transform = `translateX(-${relatedCurrentIndex * relatedSlideWidth}px)`;
            }, 300);
        }

        // 첫 번째 슬라이드에서 마지막 슬라이드로 루프 처리
        if (index < relatedVisibleSlides) {
            setTimeout(() => {
                relatedTrack.style.transition = "none";
                relatedCurrentIndex = totalSlideCount - (2 * relatedVisibleSlides); // 복제된 마지막 슬라이드로 이동
                relatedTrack.style.transform = `translateX(-${relatedCurrentIndex * relatedSlideWidth}px)`;
            }, 300);
        }
    };

// 다음 슬라이드로 이동
    const goToNextRelatedSlide = () => {
        moveToRelatedSlide(relatedCurrentIndex + 1);
    };

// 이전 슬라이드로 이동
    const goToPrevRelatedSlide = () => {
        moveToRelatedSlide(relatedCurrentIndex - 1);
    };

// 자동 슬라이드 설정
    let relatedAutoSlideInterval = setInterval(goToNextRelatedSlide, 3000);

    const stopRelatedAutoSlide = () => {
        clearInterval(relatedAutoSlideInterval);
    };

    const startRelatedAutoSlide = () => {
        relatedAutoSlideInterval = setInterval(goToNextRelatedSlide, 3000);
    };

// 버튼 이벤트 설정
    const prevButton = document.querySelector(".related-products__button--prev");
    const nextButton = document.querySelector(".related-products__button--next");

    prevButton.addEventListener("click", () => {
        stopRelatedAutoSlide();
        goToPrevRelatedSlide();
        startRelatedAutoSlide();
    });

    nextButton.addEventListener("click", () => {
        stopRelatedAutoSlide();
        goToNextRelatedSlide();
        startRelatedAutoSlide();
    });

// 마우스 오버 시 자동 슬라이드 중지
    relatedTrack.addEventListener("mouseenter", stopRelatedAutoSlide);
    relatedTrack.addEventListener("mouseleave", startRelatedAutoSlide);




    // ************** ootd 슬라이더
    const ootdSliderTrack = document.querySelector(".ootd-slider-track");
    let ootdSlides = Array.from(ootdSliderTrack.children);

    const ootdSlideWidth = 343; // 슬라이드 너비 (계산된 값)
    const ootdGap = 10; // 슬라이드 간 간격
    const ootdFullSlideWidth = ootdSlideWidth + ootdGap; // 슬라이드 하나의 전체 크기
    let ootdCurrentIndex = 3; // 시작 인덱스 (중앙 배치)

// 슬라이드 복제 함수
    const replicateOotdSlides = () => {
        const firstClones = ootdSlides.slice(0, 3).map((slide) => slide.cloneNode(true));
        const lastClones = ootdSlides.slice(-3).map((slide) => slide.cloneNode(true));

        lastClones.forEach((clone) => ootdSliderTrack.insertBefore(clone, ootdSlides[0]));
        firstClones.forEach((clone) => ootdSliderTrack.appendChild(clone));
    };

// 초기 복제 및 트랙 설정
    replicateOotdSlides();
    ootdSlides = Array.from(ootdSliderTrack.children);
    ootdSliderTrack.style.width = `${ootdSlides.length * ootdFullSlideWidth}px`;

// 트랙을 초기 위치로 정렬
    const initialOffset2 = ootdFullSlideWidth * ootdCurrentIndex; // 중앙 배치
    ootdSliderTrack.style.transition = "none"; // 애니메이션 없이 설정
    ootdSliderTrack.style.transform = `translateX(-${initialOffset2}px)`;

// 슬라이드 이동 함수
    const moveToOotdSlide = (index) => {
        ootdSliderTrack.style.transition = "transform 0.5s ease-in-out";
        ootdSliderTrack.style.transform = `translateX(-${ootdFullSlideWidth * index}px)`;
        ootdCurrentIndex = index;

        // 마지막 슬라이드에서 첫 번째 슬라이드로 루프 처리
        if (index >= ootdSlides.length - 3) {
            setTimeout(() => {
                ootdSliderTrack.style.transition = "none";
                ootdCurrentIndex = 3; // 복제된 첫 번째 슬라이드로 이동
                ootdSliderTrack.style.transform = `translateX(-${ootdFullSlideWidth * ootdCurrentIndex}px)`;
            }, 500);
        }

        // 첫 번째 슬라이드에서 마지막 슬라이드로 루프 처리
        if (index <= 2) {
            setTimeout(() => {
                ootdSliderTrack.style.transition = "none";
                ootdCurrentIndex = ootdSlides.length - 6; // 복제된 마지막 슬라이드로 이동
                ootdSliderTrack.style.transform = `translateX(-${ootdFullSlideWidth * ootdCurrentIndex}px)`;
            }, 500);
        }
    };

// 3초마다 슬라이드 이동
    setInterval(() => {
        moveToOotdSlide(ootdCurrentIndex + 1);
    }, 3000);
});

//우측 사이드 광고 배너
const banner = document.querySelector(".floating-banner");

window.addEventListener("scroll", () => {
    if (window.scrollY > 200) {
        banner.style.opacity = "1"; // 스크롤 위치에 따라 보임
    } else {
        banner.style.opacity = "0.5"; // 덜 보이게 설정
    }
});