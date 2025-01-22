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
        startOAuth(provider)
    }

    function startOAuth(provider) {
        const baseURL = window.location.hostname === 'localhost'
            ? `http://localhost:9999/oauth2/authorization/${provider}`
            : `/start-oauth/${provider}`;

        window.location.href = baseURL;
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







// 테스트 부분 -> 신경쓰지 마세요

    const button2 = document.querySelector('.test2-button');

// 버튼 클릭 이벤트 등록
    button2.addEventListener('click', () => {
        // /members로 GET 요청
        fetch('/webs/members')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json(); // JSON 형식으로 응답 변환
            })
            .then(data => {
                // 응답 데이터 alert
                alert(JSON.stringify(data, null, 2)); // 보기 좋게 포맷팅
            })
            .catch(error => {
                console.error('Error:', error);
                alert('멤버를 불러오는 데 실패했습니다.');
            });
    });





    // DOM 요소 가져오기
    const button = document.querySelector('.test-button');

// 버튼 클릭 이벤트 등록
    button.addEventListener('click', () => {
        // /members로 GET 요청
        $.ajax({
            url: 'http://172.20.36.144:90/auths/members', // 요청 URL
            method: 'GET', // HTTP 메서드
            success: function (data) {
                // 응답 데이터 alert
                alert(JSON.stringify(data, null, 2)); // 보기 좋게 포맷팅
            },
            error: function (xhr, status, error) {
                // 오류 처리
                console.error('Error:', error);
                alert('멤버를 불러오는 데 실패했습니다.');
            }
        });
    });

});
