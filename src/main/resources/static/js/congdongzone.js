$(document).ready(() => {
    console.log('공동구매 페이지 로드됨.');

    const $allProducts = $('.all-products'); // 공구 리스트
    const $activeProducts = $('.active-products'); // 진행 중인 공구 리스트
    const itemsPerPage = 9;
    let currentIndex = 0;

    $activeProducts.hide();
    showMoreProducts($allProducts);

    function switchTab(tab) {
        $('.tab').removeClass('selected');
        tab.addClass('selected');
    }

    // "공구리스트" 클릭 시
    $('#showAllProducts').on('click', function () {
        console.log('공구리스트 클릭됨');
        switchTab($(this));
        $activeProducts.hide();
        $allProducts.show();
        currentIndex = 0;
        showMoreProducts($allProducts);
    });

    // "진행중인 공구" 클릭 시
    $('#showActiveProducts').on('click', function () {
        console.log('진행중인 공구 클릭됨');
        switchTab($(this));
        $allProducts.hide();
        $activeProducts.show();
        currentIndex = 0;
        showMoreProducts($activeProducts);
    });

    $('#loadMore').on('click', () => {
        showMoreProducts($('.all-products:visible, .active-products:visible'));
    });

    function showMoreProducts($products) {
        $products.hide();
        const nextIndex = currentIndex + itemsPerPage;
        $products.slice(currentIndex, nextIndex).fadeIn();
        currentIndex = nextIndex;
        if (currentIndex >= $products.length) $('#loadMore').hide();
    }

    $(document).ready(() => {
        console.log('공동구매 페이지 로드됨.');

        $('.all-products, .active-products').each(function () {
            console.log("📌 [DEBUG] 데이터 속성 확인:", $(this).data()); // 전체 data-* 속성 출력
            try {
                const originalPriceText = $(this).find('.original-price').text();
                const originalPrice = parseFloat(originalPriceText.replace(/,/g, ''));
                let conditionData = $(this).data('condition'); // 모집 인원 & 할인율
                const congsData = $(this).data('congs'); // 참여자 목록
                const startAt = $(this).data('startat'); // 시작 시간

                console.log("📌 conditionData 원본:", conditionData);
                console.log("📌 congsData 원본:", congsData);

                // ✅ 모집 인원 & 할인율 추출
                let totalParticipants = 0;
                let discountRate = 0;

                if (conditionData) {
                    try {
                        if (typeof conditionData === "string") {
                            // 여러 개의 {key:value} 쌍이 있을 경우, JSON 배열 형태로 변환
                            conditionData = `[${conditionData.replace(/},\s*{/g, '},{')}]`;
                            conditionData = JSON.parse(conditionData.replace(/(\d+):/g, '"$1":'));
                        }

                        console.log("✅ 변환된 conditionData:", conditionData);

                        if (Array.isArray(conditionData) && conditionData.length > 0) {
                            // 모집 인원 기준으로 정렬 후 가장 큰 값을 가져옴
                            conditionData.sort((a, b) => Object.keys(b)[0] - Object.keys(a)[0]);
                            const bestCondition = conditionData[0]; // 가장 높은 모집 인원 데이터
                            totalParticipants = parseInt(Object.keys(bestCondition)[0], 10);
                            discountRate = parseInt(Object.values(bestCondition)[0], 10);
                        }
                    } catch (error) {
                        console.error("❌ conditionData 파싱 오류:", error);
                    }
                }

                console.log(`✅ 총 모집 인원: ${totalParticipants}, 할인율: ${discountRate}`);

                // ✅ 할인율 적용
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
                        if (typeof congsData === "string" && congsData.startsWith("[")) {
                            const parsedArray = JSON.parse(congsData);
                            participantCount = parsedArray.length;
                        } else if (!isNaN(parseInt(congsData, 10))) {
                            participantCount = 1;
                        }
                    } catch (error) {
                        console.error("❌ 참여자 데이터 처리 중 오류 발생:", error);
                        participantCount = 1;
                    }
                }

                console.log(`✅ 참가자 수: ${participantCount}, 총 모집 인원: ${totalParticipants}`);
                $(this).find('.participants').text(`(${participantCount}/${totalParticipants}명)`);

// ✅ 시작 및 종료 날짜 설정
                if (startAt) {
                    console.log("📌 startAt 원본 데이터:", startAt);

                    // 밀리초까지 포함된 경우, 공백을 'T'로 변경해 ISO 형식으로 변환
                    let formattedStartAt = startAt.replace(" ", "T").split(".")[0]; // "2025-02-03T08:15:36"

                    const startDate = new Date(formattedStartAt);
                    console.log("📌 변환된 startDate:", startDate);

                    if (isNaN(startDate.getTime())) {
                        console.error("❌ 잘못된 날짜 형식입니다:", formattedStartAt);
                    } else {
                        const endDate = new Date(startDate);
                        endDate.setDate(startDate.getDate() + 7);
                        console.log("📌 종료일 (endDate):", endDate);

                        $(this).find('.start-time').text(startDate.toLocaleDateString());
                        $(this).find('.end-time').text(endDate.toLocaleDateString());
                    }
                }


            } catch (error) {
                console.error('❌ 공구 데이터 처리 중 오류 발생:', error);
            }
        });
    });


});



