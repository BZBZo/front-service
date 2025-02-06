$(document).ready(function() {
    var $items = $('.review-image-placeholder > div');
    var count = $items.length;
    var widthPercent = 100 / count;
    $items.css('width', widthPercent + '%');




    // 1. 모든 이미지의 src를 배열로 저장
    var imageSrcs = [];
    $('.review-image').each(function() {
        imageSrcs.push($(this).attr('src'));
    });

    var currentIndex = 0; // 현재 모달에 띄운 이미지의 인덱스

    // 2. 이미지 클릭 시 모달 열기
    $('.review-image').click(function() {
        currentIndex = $('.review-image').index(this);
        openModal(currentIndex);
    });

    // 모달 열기 함수
    function openModal(index) {
        $('#modalImage').attr('src', imageSrcs[index]);
        $('#imageModal').fadeIn();
    }

    // 모달 닫기 함수
    function closeModal() {
        $('#imageModal').fadeOut();
    }

    // 3. 닫기 버튼 클릭 시 모달 닫기
    $('.close').click(function() {
        closeModal();
    });

    // 4. 모달 영역(이미지 제외 영역) 클릭 시 모달 닫기
    $('#imageModal').click(function(e) {
        // 이미지와 좌우 화살표 클릭은 이벤트 전파 중단
        if ($(e.target).is('#modalImage') || $(e.target).is('.prev') || $(e.target).is('.next')) {
            return;
        }
        closeModal();
    });

    // 5. 좌측 화살표 클릭 - 이전 이미지
    $('.prev').click(function(e) {
        e.stopPropagation(); // 모달 닫힘 방지
        currentIndex = (currentIndex - 1 + imageSrcs.length) % imageSrcs.length;
        openModal(currentIndex);
    });

    // 6. 우측 화살표 클릭 - 다음 이미지
    $('.next').click(function(e) {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % imageSrcs.length;
        openModal(currentIndex);
    });
});


