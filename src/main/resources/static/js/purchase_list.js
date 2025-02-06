$(document).ready(function () {
    getToken()
        .then(() => {
            setupAjax();
            return checkToken();
        })
        .catch(error => {
            console.error('토큰을 가져오는 데 실패했습니다:', error);
        });

    loadUserInfo().then(({ userInfo, memberNo }) => {  // 구조 분해 할당 사용
        if (!memberNo) {
            alert('사용자 정보를 불러오고 있습니다. 잠시 후 다시 시도해주세요.');
            return;
        }
        window.memberNo = memberNo; // 전역 변수로 저장
    }).catch(error => console.error('Error loading user info:', error));

    // 클릭 이벤트를 동적으로 바인딩
    $(document).on("click", ".reviewed-button", function (event) {
        event.preventDefault(); // 기본 동작 막기

        let productId = $(this).data("product-id"); // data-* 속성에서 값 가져오기
        let purchaseId = $(this).data("purchase-id");

        if (!window.memberNo) {
            alert("로그인이 필요한 서비스입니다.");
            window.location.href = '/webs/signin';
            return;
        }

        // URL 이동
        window.location.href = `/customer/history/review/detail/${productId}/${purchaseId}/${window.memberNo}`;
    });
});