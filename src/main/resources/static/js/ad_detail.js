$(document).ready(() => {
    console.log('document.ready 실행됨'); // 디버깅 로그
    getToken()
        .then(() => {
            console.log('getToken 성공');
            setupAjax();
            return checkToken();
        })
        .catch(error => {
            console.error('토큰을 가져오는 데 실패했습니다:', error);
        });
});

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', event => {
        if (event.target.classList.contains('status-btn')) {
            console.log('status-btn 클릭됨'); // 디버깅 로그
            const button = event.target;
            const adId = button.getAttribute('data-id'); // 광고 ID
            const status = button.getAttribute('data-status'); // 상태 값

            console.log('adId:', adId, 'status:', status); // 디버깅 로그

            if (!adId || !status) {
                alert('광고 ID 또는 상태 값이 누락되었습니다.');
                return;
            }

            // 상태 변경 요청
            sendAdStatusUpdate(adId, status);
        }
    });
});

const sendAdStatusUpdate = (adId, status) => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
        alert('유효하지 않은 세션입니다. 다시 로그인해주세요.');
        return;
    }

    const userRole = getUserRoleFromToken(token);

    if (userRole !== 'ROLE_ADMIN') {
        alert('이 작업을 수행할 권한이 없습니다.');
        return;
    }

    fetch(`/api/ad/updateStatus/${adId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('서버 응답 오류');
            }
            return response.json();
        })
        .then(data => {
            alert(data.message || '상태가 성공적으로 변경되었습니다.');
            window.location.href = '/ad/list?updated=true';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('상태 변경 중 오류 발생');
        });
};

// 토큰에서 사용자 역할(role) 추출 함수 예시
const getUserRoleFromToken = (token) => {
    const payload = JSON.parse(atob(token.split('.')[1]));  // JWT 디코딩
    console.log(payload)
    console.log(payload.role)
    return payload.role;
};