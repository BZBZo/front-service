$(document).ready(function () {
    let token = localStorage.getItem('accessToken') || "";  // ✅ null이면 빈 문자열로 대체
    if (!token.startsWith('Bearer ') && token !== "") {
        token = `Bearer ${token}`;
    }

    // 모달 관련 요소 가져오기
    const modal = $("#ootdModal");
    const modalContent = $("#modalOotdContent");
    const closeModalBtn = $(".close-btn");

    // 사용자 정보 로드
    loadUserInfo().then(({userInfo, memberNo}) => {  // 구조 분해 할당 사용
        if (!memberNo) {
            alert('사용자 정보를 불러오고 있습니다. 잠시 후 다시 시도해주세요.');
            return;
        }
        window.memberNo = memberNo; // 전역 변수로 저장
    }).catch(error => console.error('Error loading user info:', error));

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
            let writerNo = $(this).closest(".modal-ootd-container").find("#writerNo").val();
            if (writerNo) {
                window.location.href = `/mystyle/${writerNo}`;
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

function toggleLike(element) {
    let ootdId = element.getAttribute("data-id");
    let token = localStorage.getItem('accessToken');

    if (!token) {
        alert("로그인이 필요합니다.");
        return;
    }

    let heart = element;
    let heartNum = heart.nextElementSibling;
    let count = parseInt(heartNum.innerText, 10);

    // 중복 클릭 방지 (잠시 비활성화)
    heart.style.pointerEvents = "none";

    fetch(`/ootd/like/${ootdId}/${memberNo}`, {
        method: "POST",
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (data.isLiked) {
                    heart.classList.add("liked");
                } else {
                    heart.classList.remove("liked");
                }
                // 서버에서 받아온 정확한 좋아요 개수 반영
                heartNum.innerText = data.heartNum;

                updateFeedLike(ootdId, data.isLiked, data.heartNum);

            } else {
                alert("좋아요 처리 중 오류 발생!");
            }
        })
        .catch(error => {
            console.error("좋아요 처리 중 오류:", error);
            alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
        })
        .finally(() => {
            // 다시 클릭 가능하도록 복구
            heart.style.pointerEvents = "auto";
        });
}

// 🔹 피드 목록의 좋아요 상태를 업데이트하는 함수
function updateFeedLike(ootdId, isLiked, heartNum) {
    // 피드 목록에서 해당 OOTD 찾기
    let feedHeart = $(`.ootd-heart[data-id="${ootdId}"]`);
    let feedHeartNum = feedHeart.next();

    if (isLiked) {
        feedHeart.addClass("liked");
    } else {
        feedHeart.removeClass("liked");
    }

    // 피드 목록의 좋아요 개수 업데이트
    feedHeartNum.text(heartNum);
}