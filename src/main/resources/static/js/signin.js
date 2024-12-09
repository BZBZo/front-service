document.addEventListener('DOMContentLoaded', function() {
    // 버튼 요소들을 선택
    console.log('DOM fully loaded and parsed');

    const googleButton = document.getElementById('google-login');
    console.log('googleButton:', googleButton);
    const naverButton = document.getElementById('naver-login');
    console.log('naverButton:', naverButton);
    const kakaoButton = document.getElementById('kakao-login');
    console.log('kakaoButton:', kakaoButton);

    // 공통 클릭 핸들러 함수
    function handleLogin(event) {
        console.log("handleLogin");
        const provider = event.target.getAttribute('data-provider');
        console.log(provider);

        // 동적으로 폼 생성
        const form = document.createElement('form');
        form.method = 'GET';
        form.action = `http://localhost:8085/oauth2/authorization/${provider}`;

        // @RequestParam 'provider'가 필요하다면, 추가 (필요 시)
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'provider';
        input.value = provider;
        form.appendChild(input);

        document.body.appendChild(form);
        form.submit();
    }

    // 각 버튼에 클릭 이벤트 리스너 추가 (요소이 존재할 경우에만)
    if (googleButton) {
        googleButton.addEventListener('click', handleLogin);
    } else {
        console.warn('google-login 버튼을 찾을 수 없습니다.');
    }

    if (naverButton) {
        naverButton.addEventListener('click', handleLogin);
    } else {
        console.warn('naver-login 버튼을 찾을 수 없습니다.');
    }

    if (kakaoButton) {
        kakaoButton.addEventListener('click', handleLogin);
    } else {
        console.warn('kakao-login 버튼을 찾을 수 없습니다.');
    }
});
