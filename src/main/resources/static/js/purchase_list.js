let token = localStorage.getItem('accessToken');
if (!token.startsWith('Bearer ')) {
    token = `Bearer ${token}`; // Bearer 형식으로 변환
}

$(document).ready(function () {
    getToken()
        .then(() => {
            setupAjax();
            return checkToken();
        })
        .catch(error => {
            console.error('토큰을 가져오는 데 실패했습니다:', error);
        });

    loadUserInfo().catch(error => console.error('Error loading user info:', error));

    if (!memberNo) {
        alert('사용자 정보를 불러오고 있습니다. 잠시 후 다시 시도해주세요.');
        return;
    }


});