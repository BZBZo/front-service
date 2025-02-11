$(document).ready(() => {
    console.log('공동구매 페이지 로드됨.');

    const $loadMoreButton = $('#loadMore'); // ✅ 더보기 버튼 캐싱
    const itemsPerPage = 9;
    let currentIndex = 0;

    function switchTab(tab) {
        $('.tab').removeClass('selected');
        tab.addClass('selected');

        // ✅ currentIndex 초기화 (더보기 버튼 관련)
        currentIndex = 0;

        console.log('🔄 탭 변경됨. 기존 데이터 숨김 처리 완료.');
    }



    function updateLoadMoreButton($products) {
        // ✅ 현재 표시된 상품 개수를 기준으로 버튼 표시 여부 결정
        const visibleProducts = $products.filter(':visible'); // 현재 보여지는 상품만 필터링
        if (visibleProducts.length < $products.length && visibleProducts.length >= itemsPerPage) {
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

                // ✅ 모집 인원 다 찼다면 버튼 텍스트 변경
                const $joinButton = $(this).find('.join-button');
                if (participantCount >= totalParticipants) {
                    $joinButton.text('[마감]').prop('disabled', true).addClass('closed');
                }

                // ✅ 시작일과 종료일 처리 (startAt 값이 존재하는 경우에만 처리)
                console.log("📌 startAt 값 확인:", startAt);

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
        switchTab($(this)); // ✅ 기존 데이터 숨기기 처리

        // ✅ 진행중인 공구 데이터 숨김
        $('.active-products-container').hide();
        $('.active-products').hide();

        // ✅ "공구리스트" 탭에서는 all-products만 다시 표시
        $('.all-products-container').show();
        $('.all-products').show();

        // ✅ "더보기" 버튼 상태 업데이트
        updateLoadMoreButton($('.all-products'));
    });


// "진행중인 공구" 클릭 시
    $('#showActiveProducts').on('click', function () {
        console.log('진행중인 공구 클릭됨');
        switchTab($(this)); // ✅ 기존 데이터 숨기기 처리

        // ✅ 공구리스트 데이터 숨김
        $('.all-products-container').hide();
        $('.all-products').hide();

        // ✅ 진행중인 공구 데이터 표시
        $('.active-products-container').show();
        $('.active-products').show();

        // ✅ "더보기" 버튼 상태 업데이트
        updateLoadMoreButton($('.active-products'));
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
    $(document).ready(() => {
        console.log('공동구매 페이지 로드됨.');

        // ✅ 중복 방지: 기존 이벤트 핸들러를 제거하고 다시 등록
        $(document).off('click', '.join-button').on('click', '.join-button', function () {
            const $product = $(this).closest('.active-products');
            const productId = $product.data('product-id');
            const conditionData = $product.data('condition');
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
