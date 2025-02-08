$(document).ready(function () {
    let token = localStorage.getItem('accessToken');

    if (!token) {
        alert("로그인이 필요한 서비스입니다.");
        window.location.href = '/webs/signin';
        return;
    }

    // 모달 관련 요소 가져오기
    const modal = $("#ootdModal");
    const modalContent = $("#modalOotdContent");
    const closeModalBtn = $(".close-btn");

    // 사용자 정보 로드
    loadUserInfo();

    function loadUserInfo() {
        $.ajax({
            url: '/webs/user/info',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function (userInfo) {
                $('#userNickname').text(userInfo.nickname);
                $('#userProfilePic').attr('src', userInfo.profilePic || '/images/default-profile.png');
            },
            error: function (err) {
                console.error("사용자 정보를 가져오지 못했습니다: ", err);
                alert('사용자 정보를 가져오는데 실패했습니다.');
            }
        });
    }

    // 모달 숨기기 (초기 상태)
    modal.hide();

    // OOTD 컨테이너 클릭 시 모달 띄우기 (동적 이벤트 바인딩)
    $(document).on("click", ".ootd-container", function () {
        let cloneOotd = $(this).clone(); // 클릭한 OOTD 컨테이너 복제
        cloneOotd.removeAttr("id"); // 중복 ID 방지
        cloneOotd.find(".ootd-main-img").css("width", "100%"); // 이미지 크기 조절

        // hover 효과 제거
        cloneOotd.removeClass("ootd-container").addClass("modal-ootd-container");

        // 모달 내부에서 이벤트 적용 (이전 이벤트 제거 후 새로 바인딩)
        modalContent.html(cloneOotd);
        bindModalEvents();

        modal.fadeIn();
    });

    // 닫기 버튼 클릭 시 모달 닫기
    closeModalBtn.click(function () {
        modal.fadeOut();
    });

    // 모달 바깥 클릭 시 닫기
    $(window).click(function (event) {
        if (event.target.id === "ootdModal") {
            modal.fadeOut();
        }
    });

    // 🔹 모달 내부 이벤트 바인딩 (동적으로 생성된 요소에 이벤트 추가)
    function bindModalEvents() {
        // 작성자 프로필 또는 닉네임 클릭 시, 해당 작성자의 스타일 페이지로 이동
        $(".modal-ootd-container").on("click", "#userProfilePic, #userNickname", function () {
            let memberNo = $(this).closest(".modal-ootd-container").find("#memberNo").val();
            if (memberNo) {
                window.location.href = `/mystyle/${memberNo}`;
            }
        });

        // 연관 상품 클릭 시, 해당 상품의 상세 페이지로 이동
        $(".modal-ootd-container").on("click", ".ootd-product-item", function () {
            let productId = $(this).find("#productId").val();
            if (productId) {
                window.location.href = `/product/detail/${productId}`;
            }
        });
    }
});
