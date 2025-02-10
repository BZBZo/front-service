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
                }

            } catch (error) {
                console.error('❌ 공구 데이터 처리 중 오류 발생:', error);
            }
        });
    }

    // "공구리스트" 클릭 시 (전체 상품)
    $('#showAllProducts').on('click', function () {
        console.log('공구리스트 클릭됨');
        switchTab($(this));
        $activeProductsContainer.hide();
        $allProductsContainer.show();

        // ✅ currentIndex 초기화
        currentIndex = 0;

        // ✅ active-products를 포함하는 요소가 남아 있으면 삭제
        $('.all-products-container .active-products').remove();

        // ✅ all-products의 개수를 정확하게 9개로 설정
        $('.all-products').hide();
        showMoreProducts($('.all-products').slice(0, itemsPerPage));

        // ✅ "더보기" 버튼 다시 체크
        updateLoadMoreButton($('.all-products'));

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
});
