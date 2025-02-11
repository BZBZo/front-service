$(document).ready(function () {
    let token = localStorage.getItem('accessToken') || "";
    if (token && !token.startsWith('Bearer ')) {
        token = `Bearer ${token}`;
    }

    // 모달 관련 요소 가져오기
    const modal = $("#ootdModal");
    const modalContent = $("#modalOotdContent");
    const closeModalBtn = $(".close-btn");

    const urlParams = new URLSearchParams(window.location.search);
    const selectedOotdId = urlParams.get("selectedOotdId");

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

    // 모달 숨기기 (초기 상태)
    modal.hide();

    // ✅ URL에서 받은 selectedOotdId가 있다면, 해당 OOTD 자동으로 모달 띄우기
    if (selectedOotdId) {
        let targetOotd = $(`.ootd-container .ootd-like-section .ootd-heart[data-id="${selectedOotdId}"]`).closest(".ootd-container");
        if (targetOotd.length) {
            openOotdModal(targetOotd);
        }
    }

    // OOTD 컨테이너 클릭 시 모달 띄우기
    $(document).on("click", ".ootd-container", function () {
        openOotdModal($(this));
    });

    closeModalBtn.click(function () {
        modal.fadeOut();
    });

    $(window).click(function (event) {
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
                window.location.href = `/product/detail/${productId}`;
            }
        });
    }

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

        heart.style.pointerEvents = "none";

        fetch(`/ootd/like/${ootdId}/${window.memberNo}`, {
            method: "POST",
            headers: {
                "Authorization": token
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (data.isLiked) {
                        heart.classList.add("liked");
                    } else {
                        heart.classList.remove("liked");
                    }
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
                heart.style.pointerEvents = "auto";
            });
    }

    function updateFeedLike(ootdId, isLiked, heartNum) {
        let feedHeart = $(`.ootd-heart[data-id="${ootdId}"]`);
        let feedHeartNum = feedHeart.next();

        if (isLiked) {
            feedHeart.addClass("liked");
        } else {
            feedHeart.removeClass("liked");
        }

        feedHeartNum.text(heartNum);
    }
});