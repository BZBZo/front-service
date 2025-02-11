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

    // 모든 '상태' 셀에 대해 참여 인원 수를 계산하여 표시
    $('td').each(function () {
        const congsText = $(this).next().text(); // 'congs' 텍스트 얻기

        // 'congs'가 배열 형식이므로 JSON.parse로 변환 후, 길이를 구합니다.
        if (congsText) {
            try {
                const congsArray = JSON.parse(congsText); // 배열 형식으로 변환
                const participantCount = congsArray.length; // 배열 길이 = 참여 인원 수
                $(this).next().text(`${participantCount}명 참여`); // '상태' 셀에 참여 인원 표시
            } catch (e) {
                console.error('❌ 참여 인원 수 계산 실패', e);
            }
        }
    });
});
