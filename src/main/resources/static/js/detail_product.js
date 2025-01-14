$(document).ready(function() {
    $('body').on('click', '#button_red', function () {
        let productId = $('input[name="id"]').val();
        console.log(productId);

        if (!productId) {
            alert('상품 정보를 찾을 수 없습니다.');
            return;
        }

        if (confirm('이 상품을 정말 삭제하시겠습니까?')) {
            deleteProduct(productId);
        }
    });
});

// 상품 삭제 함수
function deleteProduct(productId) {
    $.ajax({
        type: 'DELETE',
        url: '/product/detail/' + productId,  // 해당 상품 ID를 포함한 URL로 요청
        success: function(response) {
            if (response.success) {
                alert(response.message);  // 성공 메시지
                window.location.href = '/product/list';  // 상품 목록 페이지로 리다이렉트
            } else {
                alert(response.message);  // 실패 메시지
            }
        },
        error: function(xhr, status, error) {
            console.error('오류 발생:', error);
            alert('상품 삭제 중 오류가 발생했습니다.');  // 오류 메시지
        }
    });
}

// isCong & condition 동일 이벤트로 통합 처리
// DOMContentLoaded 이벤트: HTML 문서가 완전히 로드된 후 실행
document.addEventListener("DOMContentLoaded", () => {
    const isCongValue = document.getElementById("isCong").value; // 공구 진행 상태
    const conditionInput = document.querySelector('input[name="condition"]'); // condition 값
    const peopleCountElement = document.getElementById("peopleCount"); // 모집 인원 표시
    const discountRateElement = document.getElementById("discountRate"); // 할인율 표시

    console.log(`현재 공구 진행 상태: ${isCongValue}`); // 로그 출력

    if (isCongValue === "true") {
        if (conditionInput && conditionInput.value) {
            const conditionParts = conditionInput.value.replace(/[{}]/g, '').split(':');
            const people = conditionParts[0] || 1;
            const discount = conditionParts[1] || 0;

            // 모집 인원 및 할인율 설정
            if (peopleCountElement && discountRateElement) {
                peopleCountElement.textContent = `모집 인원: ${people}명`;
                discountRateElement.textContent = `할인율: ${discount}%`;
            }
        } else {
            console.warn("Condition 값이 비어 있습니다.");
        }
    } else {
        console.log("공구 진행 상태가 불가입니다. 모집 인원 및 할인율은 표시하지 않습니다.");
    }
});