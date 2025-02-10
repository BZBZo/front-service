$(document).ready(() => {
    console.log('📢 document.ready 실행됨'); // 디버깅 로그

    getToken()
        .then(() => {
            console.log('✅ getToken 성공');
            setupAjax();
            return checkToken();
        })
        .then(() => {
            return loadUserInfo(); // ✅ 사용자 정보 로드 (memberNo 필요할 경우)
        })
        .then(() => {
            console.log('✅ 사용자 정보 로딩 완료');
        })
        .catch(error => {
            console.error('❌ 토큰을 가져오는 데 실패했습니다:', error);
        });
});
