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
        event.preventDefault(); // 기본 동작 방지 (선택사항)
        console.log("handleLogin");

        // event.currentTarget 또는 this를 사용하여 버튼 요소를 참조
        const provider = event.currentTarget.getAttribute('data-provider');
        // 또는 const provider = this.getAttribute('data-provider');
        console.log('Provider:', provider);

        if (!provider) {
            console.error('Provider 정보가 없습니다.');
            return;
        }

        // 동적으로 폼 생성
        const form = document.createElement('form');
        form.method = 'GET';
        form.action = `http://localhost:9999/oauth2/authorization/${provider}`;
        document.body.appendChild(form);
        form.submit();
    }

    // 각 버튼에 클릭 이벤트 리스너 추가 (요소가 존재할 경우에만)
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
