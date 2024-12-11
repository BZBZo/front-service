// token을 localStorage에 저장하기 위한 코드
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('http://localhost:8085/auths/token', {
            method: 'GET',
            credentials: 'include' // 쿠키를 포함하여 요청
        });

        if (response.ok) {
            const data = await response.json();
            if (data.token) {
                localStorage.setItem('accessToken', data.token);
                console.log('Token stored in localStorage');
            }
            // 홈 페이지로 이동하거나 성공 메시지 표시
        } else {
            console.error('Failed to retrieve token');
        }
    } catch (error) {
        console.error('Error fetching token:', error);
    }
});
