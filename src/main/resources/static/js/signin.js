document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');

    // 버튼 요소 선택
    const googleButton = document.getElementById('google-login');
    const naverButton = document.getElementById('naver-login');
    const kakaoButton = document.getElementById('kakao-login');
    const emailButton = document.getElementById('email-login'); // 이메일 로그인 버튼
    const emailLoginForm = document.querySelector('.email-login-form'); // 이메일 로그인 폼
    const signinButton = document.getElementById('signin-button'); // 이메일 로그인 버튼 내부의 로그인 버튼

    // 공통 클릭 핸들러 (소셜 로그인)
    function handleLogin(event) {
        event.preventDefault(); // 기본 동작 방지
        console.log("handleLogin");

        const provider = event.currentTarget.getAttribute('data-provider');
        console.log('Provider:', provider);

        if (!provider) {
            console.error('Provider 정보가 없습니다.');
            return;
        }
        startOAuth(provider);
    }

    function startOAuth(provider) {
        const baseURL = window.location.hostname === 'localhost'
            ? `http://localhost:9999/oauth2/authorization/${provider}`
            : `/start-oauth/${provider}`;

        window.location.href = baseURL;
    }

    // 소셜 로그인 버튼 이벤트 리스너 추가
    if (googleButton) googleButton.addEventListener('click', handleLogin);
    else console.warn('google-login 버튼을 찾을 수 없습니다.');

    if (naverButton) naverButton.addEventListener('click', handleLogin);
    else console.warn('naver-login 버튼을 찾을 수 없습니다.');

    if (kakaoButton) kakaoButton.addEventListener('click', handleLogin);
    else console.warn('kakao-login 버튼을 찾을 수 없습니다.');

    // 이메일 로그인 버튼 클릭 시 로그인 폼 표시/숨김
    if (emailButton && emailLoginForm) {
        // 초기에는 로그인 폼을 숨김
        emailLoginForm.style.display = "none";

        emailButton.addEventListener('click', () => {
            if (emailLoginForm.style.display === "none" || emailLoginForm.style.display === "") {
                emailLoginForm.style.display = "flex"; // 보이게 설정
            } else {
                emailLoginForm.style.display = "none"; // 숨김
            }
        });
    }

    // 이메일 로그인 버튼 클릭 시 로그인 요청
    if (signinButton) {
        signinButton.addEventListener('click', () => {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!email || !password) {
                alert("이메일과 비밀번호를 입력하세요.");
                return;
            }

            fetch('/webs/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email, password: password })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('로그인 실패: 이메일 또는 비밀번호를 확인하세요.');
                    }
                    return response.json();
                })
                .then(data => {
                    alert("로그인 성공!");
                    window.location.href = data.url;
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert(error.message);
                });
        });
    }

    // 테스트 버튼 기능 유지
    const button2 = document.querySelector('.test2-button');
    if (button2) {
        button2.addEventListener('click', () => {
            fetch('/webs/members')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    alert(JSON.stringify(data, null, 2)); // JSON 포맷팅된 응답 표시
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('멤버를 불러오는 데 실패했습니다.');
                });
        });
    }

    const button = document.querySelector('.test-button');
    if (button) {
        button.addEventListener('click', () => {
            $.ajax({
                url: 'http://172.20.36.144:90/auths/members', // 요청 URL
                method: 'GET',
                success: function (data) {
                    alert(JSON.stringify(data, null, 2)); // 보기 좋게 포맷팅
                },
                error: function (xhr, status, error) {
                    console.error('Error:', error);
                    alert('멤버를 불러오는 데 실패했습니다.');
                }
            });
        });
    }
});
