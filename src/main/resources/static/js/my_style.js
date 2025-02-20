$(document).ready(function () {


    // 사용자 정보 로드
    loadUserInfo().then(({ userInfo, memberNo }) => {
        if (!memberNo) {
            alert('사용자 정보를 불러오고 있습니다. 잠시 후 다시 시도해주세요.');
            return;
        }
        window.memberNo = memberNo;
    }).catch(error => {
        console.error('Error loading user info:', error);
        alert('사용자 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.');
    });

    const modal = $("#ootdModal");
    const modalContent = $("#modalOotdContent");
    const closeModalBtn = $(".close-btn");

    console.log("모달 초기 상태 확인:", modal);
    modal.hide();  // 모달 숨기기


    // OOTD 컨테이너 클릭 시 모달 띄우기
    $(document).on("click", ".ootd-container", function () {
        openOotdModal($(this));
    });

    $(document).on("click", ".close-btn", function () {
        console.log("X 버튼 클릭됨");
        modal.fadeOut();
    });

    $(document).on("click", function (event) {
        console.log("모달 바깥 클릭됨", event.target.id);
        if (event.target.id === "ootdModal") {
            modal.fadeOut();
        }
    });

    function openOotdModal(targetOotd) {
        let cloneOotd = targetOotd.clone();
        cloneOotd.removeAttr("id");
        cloneOotd.find(".ootd-main-img").css("width", "100%");
        cloneOotd.removeClass("ootd-container").addClass("modal-ootd-container");

        modalContent.html(cloneOotd);
        bindModalEvents();

        modal.fadeIn();
    }

    function bindModalEvents() {
        modalContent.on("click", "#userProfilePic, #userNickname", function () {
            let writerNo = $(this).closest(".modal-ootd-container").find("#writerNo").val();
            if (writerNo) {
                window.location.href = `/ootd/${writerNo}`;
            }
        });

        modalContent.on("click", ".ootd-product-item", function () {
            let productId = $(this).find("#productId").val();
            if (productId) {
                window.location.href = `/customer/product/detail/${productId}`;
            }
        });
    }
});


// ✅ OOTD 좋아요 토글 기능
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