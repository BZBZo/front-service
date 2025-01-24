$(document).ready(() => {
    console.log('공구 리스트 페이지 로드됨.');

    // // 모든 상품 요소 가져오기
    // const $productItems = $('.product-item');
    //
    // // 처음 9개만 표시
    // $productItems.hide().slice(0, 9).show();

    const $productItems = $('.product-item'); // 모든 상품 요소 가져오기
    const itemsPerPage = 9; // 한 번에 표시할 상품 개수
    let currentIndex = 0; // 현재 표시된 상품의 마지막 인덱스

    // 초기에는 모든 상품 숨기기
    $productItems.hide();

    // 처음 페이지 로드 시 9개의 상품만 표시
    showMoreProducts();

    // "더보기" 버튼 클릭 이벤트
    $('#loadMore').on('click', () => {
        console.log(`"더보기" 클릭 - 현재 인덱스: ${currentIndex}`);
        showMoreProducts();
    });

    function showMoreProducts() {
        const nextIndex = currentIndex + itemsPerPage; // 다음에 보여줄 상품 범위
        $productItems.slice(currentIndex, nextIndex).fadeIn(); // 현재 인덱스부터 다음 인덱스까지 표시
        currentIndex = nextIndex; // 현재 인덱스를 업데이트

        // 더 이상 표시할 상품이 없으면 "더보기" 버튼 숨기기
        if (currentIndex >= $productItems.length) {
            console.log('더 이상 로드할 상품이 없습니다.');
            $('#loadMore').hide();
        }
    }

    $('.product-item').each(function () {
        try {
            // 원래 가격 추출
            const originalPriceText = $(this).find('.original-price').text();
            console.log('Original Price Text:', originalPriceText);

            const originalPrice = parseFloat(originalPriceText.replace(/,/g, ''));
            console.log('Parsed Original Price:', originalPrice);

            // 조건 데이터 추출
            const conditionData = $(this).data('condition');
            console.log('Original Condition Data:', conditionData);

            if (!conditionData) {
                console.warn('Condition Data가 비어있습니다. 기본값 처리 중...');
                return;
            }

            // 첫 번째 조건 추출 시도
            const conditions = conditionData.split(',');
            console.log('Split Conditions:', conditions);

            const firstCondition = conditions[0];
            console.log('First Condition:', firstCondition);

            const match = firstCondition.match(/:(\d+)/);
            if (!match) {
                console.warn('할인율을 찾을 수 없습니다. 조건 데이터 형식 확인 필요:', firstCondition);
                return;
            }

            // 할인율 추출 및 계산
            const discountRate = parseInt(match[1], 10);
            console.log('Parsed Discount Rate:', discountRate);

            const discountedPrice = originalPrice - (originalPrice * (discountRate / 100));
            console.log(`Original Price: ${originalPrice}, Discount Rate: ${discountRate}%, Final Price: ${discountedPrice}`);

            // HTML 업데이트
            $(this).find('.discount').text(`${discountRate}%`); // 할인율 표시
            $(this).find('.final-price').text(`${Math.round(discountedPrice).toLocaleString()}원`); // 공구가 표시
        } catch (error) {
            console.error('조건 처리 중 오류 발생:', error);
        }
    });
});