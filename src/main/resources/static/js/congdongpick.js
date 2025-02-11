$(document).ready(() => {
    console.log('📢 document.ready 실행됨'); // 디버깅 로그

    getToken()
        .then(() => {
            console.log('✅ getToken 성공');
            setupAjax();
            return checkToken();
        })
        .then(() => {
            return loadUserInfo(); // ✅ 사용자 정보 로드 (memberNo 필요할 경우)
        })
        .then(() => {
            console.log('✅ 사용자 정보 로딩 완료');
        })
        .catch(error => {
            console.error('❌ 토큰을 가져오는 데 실패했습니다:', error);
        });

    // 모든 '상태' 셀에 대해 참여 인원 수를 계산하여 표시
    $('td[data-congs]').each(function () {
        let congsText = $(this).data('congs'); // ✅ data-congs 속성에서 가져오기

        if (congsText) {
            try {
                let congsArray;

                if (typeof congsText === "string") {
                    congsArray = JSON.parse(congsText.replace(/'/g, '"')); // ✅ 문자열이면 JSON 변환
                } else if (Array.isArray(congsText)) {
                    congsArray = congsText; // ✅ 이미 배열이면 그대로 사용
                } else {
                    throw new Error("Invalid data format for congsText"); // ❌ 유효하지 않은 경우 에러 처리
                }

                const participantCount = congsArray.length;
                $(this).text(`${participantCount}명 참여`);
            } catch (e) {
                console.error('❌ 참여 인원 수 계산 실패', e, congsText);
            }
        }
    });


    // '지불하기' 버튼 클릭 이벤트
    $('body').on('click', '.order-now', function () {
        let quantity = 1;

        const productId = $(this).data('product-id');
        const discountedPrice = $(this).data('product-price');
        const congId = $(this).data('cong-id');

        if (!productId || !discountedPrice || !congId) {
            console.error('❌ 상품 정보가 없습니다! productId:', productId, 'price:', discountedPrice, 'congId:', congId);
            return;
        }

        if (!memberNo) {
            alert('사용자 정보를 불러오고 있습니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        console.log('Redirecting to purchase page with productId:', productId, 'price:', discountedPrice, 'congId:', congId);

        // ✅ GET 요청 URL 생성 (congId 포함)
        const purchaseUrl = `/customer/purchase/direct?productId=${productId}&price=${discountedPrice}&memberNo=${memberNo}&quantity=${quantity}&congId=${congId}`;
        window.location.href = purchaseUrl;
    });

});
