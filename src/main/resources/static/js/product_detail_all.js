$(document).ready(function () {
    // 페이지 로드 후 추가 작업 필요 시 여기에 작성
    console.log('상세 페이지가 로드되었습니다.');

    // 공동구매 버튼 클릭 이벤트
    $('#congdongBtn').click(function () {
        const modal = $('#congdongModal'); // 모달 선택
        const conditionString = $('#condition').val(); // 히든 필드에서 condition 값 가져오기

        if (conditionString) {
            const conditionList = $('#conditionList'); // 조건 목록 영역 선택
            conditionList.empty(); // 기존 내용 초기화

            // condition 값 파싱
            const conditions = conditionString.split(',');
            conditions.forEach(condition => {
                const [people, discount] = condition.replace(/{|}/g, '').split(':');
                conditionList.append(`<p>${people}명 뭉치면 ${discount}% DC</p>`);
            });
        } else {
            $('#conditionList').html('<p>공동구매 조건이 없습니다.</p>');
        }

        modal.show(); // 모달 표시
    });

    // 모달 닫기 버튼 클릭 이벤트
    $('.close-button').click(function () {
        const modal = $('#congdongModal'); // 모달 선택
        modal.hide(); // 모달 숨기기
    });

    // 모달 외부 클릭 시 닫기
    $(window).click(function (event) {
        const modal = $('#congdongModal');
        if ($(event.target).is(modal)) {
            modal.hide(); // 모달 숨기기
        }
    });

    // // "구매하기" 버튼 클릭 이벤트
    // $('#purchaseBtn').click(function (e) {
    //     e.preventDefault();
    //
    //     // 제품 ID 가져오기
    //     const productId = $('#productId').val();
    //     const customerId = $('#customerId').val(); // 추가 필드가 필요합니다.
    //
    //     // JSON 데이터 생성
    //     const jsonData = JSON.stringify({
    //         "productId": productId,
    //         "customerId": customerId
    //     });
    //
    //     if (confirm('제품을 바로 구매하시겠습니까?')) {
    //         $.ajax({
    //             type: "POST",
    //             url: "/user/purchase/direct",
    //             contentType: "application/json",
    //             data: jsonData,
    //             success: function (response) {
    //                 if (response.message) {
    //                     alert(response.message);
    //                     window.location.href = '/mypage/history';
    //                 }
    //             },
    //             error: function (xhr, status, error) {
    //                 console.error("구매 실패:", error);
    //                 alert("상품 구매를 실패했습니다. 다시 시도해 주세요.");
    //             }
    //         });
    //     }
    // });
    //
    // // "장바구니 담기" 버튼 클릭 이벤트
    // $('#addToCartBtn').click(function (e) {
    //     e.preventDefault();
    //
    //     // 제품 ID 가져오기
    //     const productId = $('#productId').val();
    //     const customerId = $('#customerId').val(); // 추가 필드가 필요합니다.
    //
    //     // JSON 데이터 생성
    //     const jsonData = JSON.stringify({
    //         "productId": productId,
    //         "customerId": customerId
    //     });
    //
    //     $.ajax({
    //         type: "POST",
    //         url: "/mypage/shoppingcart",
    //         contentType: "application/json",
    //         data: jsonData,
    //         success: function (response) {
    //             if (response.message) {
    //                 alert(response.message);
    //                 window.location.href = '/mypage/shoppingcart';
    //             }
    //         },
    //         error: function (xhr, status, error) {
    //             console.error("장바구니 추가 실패:", error);
    //             alert("상품 추가에 실패했습니다. 다시 시도해 주세요.");
    //         }
    //     });
    // });
});
document.addEventListener('DOMContentLoaded', () => {
    const categoryMap = {
        "Home": "가구가구",
        "Clothing": "옷",
        "Books": "책",
        "Toys": "장난감",
        "Electronics": "가전"
    };

    const categoryElement = document.getElementById('productCategory'); // 요소 선택
    categoryElement.textContent = categoryMap[categoryElement.textContent.trim()] || "기타";
});