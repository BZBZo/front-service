$(document).ready(function () {
    var productId = $('#productId').val();
    console.log(productId, " product Id");

    // 회원 정보를 먼저 로딩한 후 후속 작업 수행
    loadMemberInfo().then(function (userInfo) {
        // 회원 정보 전역 변수에 저장 (이미 loadMemberInfo에서 memberNo는 window.memberNo에 저장)
        window.userinfo = userInfo;

        // 회원 정보가 로딩된 후에 writeBtn의 href를 설정합니다.
        $('#writeBtn').attr('href', '/customer/history?memberNo=' + window.memberNo);

        // 최초 리뷰 목록 로딩
        const start = performance.now();
        loadReviews(0, start);
    }).catch(function (error) {
        console.error("회원 정보 로딩 실패:", error);
    });

    // 리뷰 로딩 함수 (페이지 번호와 시작 시점을 인자로 받음)
    function loadReviews(page, start) {
        $.ajax({
            url: `/customer/review/list/${productId}?page=${page}&size=5`,
            type: 'GET',
            success: function (response) {
                $('#boardContent').empty();
                var reviews = response.reviews;
                reviews.forEach(function (review) {
                    // 회원 정보가 로딩되었으면 window.userinfo.nickname을 사용하고, 그렇지 않으면 '익명'
                    var nickname = window.userinfo ? window.userinfo.nickname : '익명';

                    // 리뷰 날짜 포맷 변경 ('ko-KR'로 한국 형식)
                    var formattedDate = new Date(review.date).toLocaleDateString('ko-KR');

                    // 리뷰 이미지 처리: review.imgUrls가 문자열로 전달됩니다.
                    var imageTag = '';
                    if (review.imgUrls && review.imgUrls.trim() !== '') {
                        // 콤마로 구분된 URL 목록을 배열로 분리합니다.
                        var urls = review.imgUrls.split(',');
                        // 각 URL에 대해 이미지 태그를 생성합니다.
                        urls.forEach(function (url) {
                            url = url.trim();
                            if (url !== '') {
                                imageTag += `<img class="review-image" src="${url}" alt="리뷰 이미지" /> `;
                            }
                        });
                    }

                    $('#boardContent').append(
                        `<tr>
                            <td>${review.reviewId}</td>
                            <td>${nickname}</td>
                            <td>${review.content}</td>
                            <td>${imageTag}</td>
                            <td>${formattedDate}</td>
                        </tr>`
                    );

                });
                updatePagination(response.startPage, response.endPage, response.totalPages, page);
            },
            error: function (xhr, status, error) {
                console.error("리뷰를 불러오는데 실패했습니다: " + error);
            },
            complete: function () {
                const end = performance.now();
                console.log(`Page loaded in ${end - start} milliseconds`);
            }
        });
    }

    // 페이징 링크에 대한 이벤트 핸들러 (동적으로 생성된 a 태그에 대해)
    $('#pagination').on('click', 'a', function (event) {
        event.preventDefault();
        var page = $(this).data('page'); // data-page 속성을 통해 페이지 번호를 얻음
        const start = performance.now();
        loadReviews(page, start);
    });

    // 페이징 UI 업데이트 함수
    function updatePagination(startPage, endPage, totalPages, currentPage) {
        var pagination = $('#pagination');
        pagination.empty();

        if (currentPage > 0) {
            pagination.append(`<li class="page-item"><a class="page-link" href="#" data-page="0">처음</a></li>`);
            pagination.append(`<li class="page-item"><a class="page-link" href="#" data-page="${currentPage - 1}">이전</a></li>`);
        }

        for (let i = startPage; i <= endPage; i++) {
            let activeClass = currentPage === i ? 'active' : '';
            pagination.append(`<li class="${activeClass} page-item"><a class="page-link" href="#" data-page="${i}">${i + 1}</a></li>`);
        }

        if (currentPage < totalPages - 1) {
            pagination.append(`<li class="page-item"><a class="page-link" href="#" data-page="${currentPage + 1}">다음</a></li>`);
            pagination.append(`<li class="page-item"><a class="page-link" href="#" data-page="${totalPages - 1}">마지막</a></li>`);
        }
    }



// 리뷰 행을 클릭하면 모달 창에 상세 내용을 채워 넣고 보여줌
    $("#boardContent").on("click", "tr", function () {
        console.log("Row clicked:", $(this));
        var reviewId = $(this).find("td:nth-child(1)").text();
        var writer   = $(this).find("td:nth-child(2)").text();
        var content  = $(this).find("td:nth-child(3)").text();
        var imageHtml = $(this).find("td:nth-child(4)").html();
        var date     = $(this).find("td:nth-child(5)").text();

        // 이미지가 존재하면 왼쪽 컬럼에, 없으면 왼쪽 컬럼은 생략하고 오른쪽은 전체 너비로 적용합니다.
        var imageColumn = "";
        if(imageHtml && imageHtml.trim() !== ""){
            imageColumn =
                "<div class='ootd-col-md-4'>" +
                "<div class='review-image-upload'>" +
                "<div class='review-image-placeholder'>" +
                imageHtml +
                "</div>" +
                "</div>" +
                "</div>";
        }

        // 오른쪽 컬럼: 이미지가 있을 경우 ootd-col-md-8, 없으면 full-width-content
        var rightClass = (imageColumn !== "") ? "ootd-col-md-8" : "full-width-content";
        var contentColumn =
            "<div class='" + rightClass + "'>" +
            // 리뷰 내용를 content-input 스타일의 readonly input (혹은 단락 등)로 표시
            "<input type='text' id='content' name='content' class='content-input' value='" + content + "' readonly>" +
            "<p><strong>글 번호:</strong> " + reviewId + "</p>" +
            "<p><strong>작성자:</strong> " + writer + "</p>" +
            "<p><strong>작성일:</strong> " + date + "</p>" +
            "</div>";

        // 전체 모달 콘텐츠 HTML: 제목과 두 컬럼(row)
        var modalHTML =
            "<h2 style='text-align:center; margin-bottom:20px;'>리뷰 상세</h2>" +
            "<div class='ootd-row'>" +
            imageColumn +
            contentColumn +
            "</div>";

        // 모달 본문 영역에 내용을 삽입
        $("#reviewModal .modal-content").html(modalHTML + "<span class='close'>&times;</span>");

        // 모달을 보이게 처리 (fadeIn 또는 show 사용)
        $("#reviewModal").fadeIn();

        // 닫기 버튼 이벤트 재바인딩 (모달 콘텐츠를 동적으로 생성했으므로)
        $("#reviewModal .close").click(function () {
            $("#reviewModal").fadeOut();
        });

        // 닫기 버튼 또는 모달 외부 클릭 시 모달을 닫음
        $(".close").click(function () {
            $("#reviewModal").fadeOut();
        });

        // 모달 외부를 클릭하면 모달을 닫습니다.
        $(window).click(function (event) {
            if ($(event.target).is("#reviewModal")) {
                $("#reviewModal").fadeOut();
            }
        });

    });

});

// 회원 정보 로딩 함수 (Promise를 반환)
function loadMemberInfo() {
    return loadUserInfo().then(({userInfo, memberNo}) => {  // 구조 분해 할당 사용
        console.log("로드된 사용자 정보:", userInfo);
        console.log("로드된 memberNo:", memberNo);

        if (!userInfo) {
            alert('사용자 정보를 불러오지 못했습니다.');
            return Promise.reject("사용자 정보 없음");
        }
        // 전역 변수에 회원번호 저장
        window.memberNo = memberNo;
        console.log("닉네임:", userInfo.nickname);
        return userInfo;  // userInfo를 반환하여 Promise 체이닝 유지
    }).catch(error => {
        alert('사용자 정보를 불러오는데 실패했습니다.');
        return Promise.reject(error);
    });
}
