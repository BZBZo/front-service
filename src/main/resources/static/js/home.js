document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 [DEBUG] DOMContentLoaded 실행됨!");

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


    function setupSlider(trackClass, slideWidth, gap, visibleSlides) {
        const track = document.querySelector(`.${trackClass}`);
        let slides = Array.from(track.children);
        const fullSlideWidth = slideWidth + gap;
        let currentIndex = visibleSlides;

        const replicateSlides = () => {
            const firstClones = slides.slice(0, visibleSlides).map(slide => slide.cloneNode(true));
            const lastClones = slides.slice(-visibleSlides).map(slide => slide.cloneNode(true));

            lastClones.forEach(clone => track.insertBefore(clone, slides[0]));
            firstClones.forEach(clone => track.appendChild(clone));
        };

        replicateSlides();
        slides = Array.from(track.children);
        track.style.width = `${slides.length * fullSlideWidth}px`;

        const moveToSlide = (index) => {
            track.style.transition = "transform 0.5s ease-in-out";
            track.style.transform = `translateX(-${fullSlideWidth * index}px)`;
            currentIndex = index;

            if (index >= slides.length - visibleSlides) {
                setTimeout(() => {
                    track.style.transition = "none";
                    currentIndex = visibleSlides;
                    track.style.transform = `translateX(-${fullSlideWidth * currentIndex}px)`;
                }, 500);
            }

            if (index < visibleSlides) {
                setTimeout(() => {
                    track.style.transition = "none";
                    currentIndex = slides.length - (2 * visibleSlides);
                    track.style.transform = `translateX(-${fullSlideWidth * currentIndex}px)`;
                }, 500);
            }
        };

        const startAutoSlide = () => {
            return setInterval(() => {
                moveToSlide(currentIndex + 1);
            }, 3000);
        };

        let autoSlideInterval = startAutoSlide();

        track.addEventListener("mouseenter", () => {
            clearInterval(autoSlideInterval);
        });

        track.addEventListener("mouseleave", () => {
            autoSlideInterval = startAutoSlide();
        });
    }

    // ✅ OOTD 슬라이드 적용
    setupSlider("ootd-slider-track", 343, 10, 3);
    setupSlider("cong-products__track", 185, 15, 5);
    setupSlider("related-products__track", 185, 15, 5);


    // 🔹 OOTD 클릭 시 상세 페이지 이동
    $(document).ready(function() {
        $(".ootd-slide").click(function () {
            let ootdId = $(this).attr("data-id");
            if (ootdId) {
                window.location.href = `/ootd/list?selectedOotdId=` + ootdId;
            }
        });
    });


    $(document).ready(() => {
        // ✅ 기존 이벤트 핸들러 제거 후 다시 등록 (중복 방지)
        $(document).off('click', '.join-button').on('click', '.join-button', function () {
            let $parent = $(this).closest('.active-products');

            // ✅ 슬라이드 영역에서는 `.related-products__card`에서 정보 가져오기
            if ($parent.length === 0) {
                $parent = $(this).closest('.related-products__card');
            }

            const productId = $parent.data('product-id');
            const conditionData = $parent.data('condition');
            const token = localStorage.getItem('accessToken');

            console.log('공동구매 참여 - 상품 ID:', productId, '조건:', conditionData);

            if (!productId || !conditionData) {
                alert('상품 ID 또는 조건이 올바르지 않습니다. 다시 시도해주세요.');
                return;
            }

            // 공동구매 참여 요청 (중복 이벤트 등록 방지)
            $.ajax({
                type: "PUT",
                url: "/product/congdong",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                data: JSON.stringify({
                    productId: productId,
                    condition: conditionData
                }),
                success: function (response) {
                    console.log("Response:", response);
                    if (response.alreadyJoined) {
                        alert("이미 참여중인 공동구매입니다!");
                    } else {
                        alert("공동구매 참여 완료!");
                    }
                },
                error: function (xhr, status, error) {
                    console.error("XHR 상태 코드:", xhr.status);
                    console.error("에러 메시지:", error);
                    alert("공동구매 참여에 실패했습니다. 다시 시도해주세요.");
                }
            });
        });
    });

});
