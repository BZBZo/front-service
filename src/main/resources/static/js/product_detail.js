$(document).ready(() => {
    console.log('document.ready 실행됨'); // 디버깅 로그
    console.log('product id');

    // 초기 작업: 토큰 가져오기 및 Ajax 설정
    initialize()
        .then(() => {
            console.log('초기화 성공');
        })
        .catch(error => {
            console.error('초기화 중 오류 발생:', error);
        });


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

// 초기화 함수
function initialize() {
    return getToken()
        .then(() => {
            console.log('getToken 성공');
            setupAjax();
            return checkToken();
        })
        .catch(error => {
            console.error('초기화 중 오류 발생:', error);
            throw error; // 이후 작업 중단
        });
}

// 상품 삭제 함수
function deleteProduct(productId) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        console.error('Authorization token is missing');
        alert('로그인이 필요합니다.');
        window.location.href = '/webs/signin';
        return;
    }

    $.ajax({
        type: 'DELETE',
        url: '/product/detail/' + productId,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function(response) {
            if (response.success) {
                alert(response.message);
                window.location.href = '/product/list';
            } else {
                alert(response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('오류 발생:', error);
            alert('상품 삭제 중 오류가 발생했습니다.');
        }
    });
}
