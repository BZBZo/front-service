$(document).ready(() => {
    console.log('공동구매 페이지 로드됨.');

    const $allProductsContainer = $('.all-products-container');
    const $activeProductsContainer = $('.active-products-container');
    const $loadMoreButton = $('#loadMore'); // ✅ 더보기 버튼 캐싱
    const itemsPerPage = 9;
    let currentIndex = 0;

    function switchTab(tab) {
        $('.tab').removeClass('selected');
        tab.addClass('selected');
    }

    function updateLoadMoreButton($products) {
        if ($products.length > itemsPerPage) {
            $loadMoreButton.show();
        } else {
            $loadMoreButton.hide();
        }
    }

    function showMoreProducts($products) {
        $products.hide(); // ✅ 모든 상품을 먼저 숨기고
        const nextIndex = currentIndex + itemsPerPage;
        $products.slice(0, nextIndex).fadeIn(); // ✅ 처음부터 다시 slice() 처리
        currentIndex = nextIndex;

        // ✅ "더보기" 버튼 표시 여부 체크
        updateLoadMoreButton($products);
    }

    function loadProducts() {
        console.log('🔄 데이터 갱신 중...');
        $('.all-products, .active-products').each(function () {
            try {
                const originalPriceText = $(this).find('.original-price').text();
                const originalPrice = parseFloat(originalPriceText.replace(/,/g, ''));
                let conditionData = $(this).data('condition'); // 모집 인원 & 할인율
                const congsData = $(this).data('congs'); // 참여자 목록
                const startAt = $(this).data('startat');

                let totalParticipants = 0;
                let discountRate = 0;

                if (conditionData) {
                    try {
                        if (typeof conditionData === "string") {
                            conditionData = `[${conditionData.replace(/},\s*{/g, '},{')}]`;
                            conditionData = JSON.parse(conditionData.replace(/(\d+):/g, '"$1":'));
                        }

                        if (Array.isArray(conditionData) && conditionData.length > 0) {
                            conditionData.sort((a, b) => Object.keys(b)[0] - Object.keys(a)[0]);
                            const bestCondition = conditionData[0];
                            totalParticipants = parseInt(Object.keys(bestCondition)[0], 10);
                            discountRate = parseInt(Object.values(bestCondition)[0], 10);
                        }
                    } catch (error) {
                        console.error("❌ conditionData 파싱 오류:", error);
                    }
                }

                if (!isNaN(discountRate)) {
                    const discountedPrice = originalPrice - (originalPrice * (discountRate / 100));
                    $(this).find('.discount').text(`${discountRate}%`);
                    $(this).find('.final-price').text(`${Math.round(discountedPrice).toLocaleString()}원`);
                } else {
                    console.warn("🚨 할인율 데이터가 올바르지 않음:", discountRate);
                }

                // ✅ 참가자 수 계산
                let participantCount = 0;
                if (congsData) {
                    try {
                        if (Array.isArray(congsData)) {
                            participantCount = congsData.length;
                        } else if (typeof congsData === "string" && congsData.startsWith("[") && congsData.endsWith("]")) {
                            const parsedArray = JSON.parse(congsData);
                            if (Array.isArray(parsedArray)) {
                                participantCount = parsedArray.length;
                            }
                        } else {
                            participantCount = 1;
                        }
                    } catch (error) {
                        console.error("❌ 참여자 데이터 처리 중 오류 발생:", error);
                        participantCount = 1;
                    }
                }

                console.log(`✅ 참가자 수: ${participantCount}, 총 모집 인원: ${totalParticipants}`);
                $(this).find('.participants').text(`(${participantCount}/${totalParticipants}명)`);

                // ✅ 시작일과 종료일 처리 (startAt 값이 존재하는 경우에만 처리)
                console.log("📌 startAt 값 확인:", startAt);  // startAt 값 출력

                if (startAt) {
                    console.log("📌 startAt 원본 데이터:", startAt);

                    // 공백을 T로 변경하여 ISO 8601 형식으로 변환
                    let formattedStartAt = startAt.replace(" ", "T").split(".")[0];
                    const startDate = new Date(formattedStartAt);  // Date 객체로 변환
                    console.log("📌 변환된 startDate:", startDate);

                    if (isNaN(startDate.getTime())) {
                        console.error("❌ 잘못된 날짜 형식입니다:", formattedStartAt);
                    } else {
                        // 종료일 계산 (7일 후)
                        const endDate = new Date(startDate);
                        endDate.setDate(startDate.getDate() + 7);
                        console.log("📌 종료일 (endDate):", endDate);

                        // 시작일 및 종료일을 날짜 형식으로 표시
                        $(this).find('.start-time').text(startDate.toLocaleDateString('ko-KR'));  // 한국 날짜 형식
                        $(this).find('.end-time').text(endDate.toLocaleDateString('ko-KR'));  // 한국 날짜 형식
                    }
                } else {
                    console.warn("🚨 startAt 값이 없습니다.");
                }

            } catch (error) {
                console.error('❌ 공구 데이터 처리 중 오류 발생:', error);
            }
        });


    }

    // "공구리스트" 클릭 시
    $('#showAllProducts').on('click', function () {
        console.log('공구리스트 클릭됨');
        switchTab($(this));
        $('.product-list').css('display', 'flex'); // ✅ 부모 요소 다시 표시
        $('.active-products').hide();
        $('.all-products').show();
        currentIndex = 0;
        showMoreProducts($('.all-products'));
        loadProducts();
    });

    // "진행중인 공구" 클릭 시
    $('#showActiveProducts').on('click', function () {
        console.log('진행중인 공구 클릭됨');
        switchTab($(this));
        $allProductsContainer.hide();
        $activeProductsContainer.show();

        // ✅ currentIndex 초기화
        currentIndex = 0;

        // ✅ active-products의 개수를 정확하게 9개로 설정
        $('.active-products').hide();
        showMoreProducts($('.active-products').slice(0, itemsPerPage));

        // ✅ "더보기" 버튼 다시 체크
        updateLoadMoreButton($('.active-products'));

        loadProducts();
    });

    $('#loadMore').on('click', () => {
        const visibleProducts = $('.all-products-container:visible .all-products, .active-products-container:visible .active-products');
        showMoreProducts(visibleProducts);
    });

    // ✅ 초기 로딩 시 all-products만 표시
    $('.all-products').hide();
    showMoreProducts($('.all-products').slice(0, itemsPerPage));

    // ✅ "더보기" 버튼 초기 상태 확인
    updateLoadMoreButton($('.all-products'));

    loadProducts();

// '공동구매 참여하기' 버튼을 클릭할 때
    $(document).on('click', '.join-button', function () {
        const $product = $(this).closest('.active-products');  // 'active-products' 클래스에서 부모 요소 찾기
        const productId = $product.data('product-id');  // data-product-id에서 ID 추출
        const conditionData = $product.data('condition');  // 조건 데이터 추출

        const token = localStorage.getItem('accessToken');  // 액세스 토큰

        // 확인 로그 추가
        console.log('공동구매 참여 - 상품 ID:', productId, '조건:', conditionData);

        if (!productId || !conditionData) {
            alert('상품 ID 또는 조건이 올바르지 않습니다. 다시 시도해주세요.');
            return; // ID나 조건이 없으면 요청을 보내지 않음
        }

        // 공동구매 참여 요청
        $.ajax({
            type: "PUT",
            url: "/product/congdong",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            data: JSON.stringify({
                productId: productId,
                condition: conditionData  // 조건을 그대로 전달
            }),
            success: function (response) {
                alert("공동구매 참여 완료!");
                console.log("Response:", response);
            },
            error: function (xhr, status, error) {
                console.error("XHR 상태 코드:", xhr.status);
                console.error("에러 메시지:", error);
                alert("공동구매 참여에 실패했습니다. 다시 시도해주세요.");
            }
        });
    });


});
