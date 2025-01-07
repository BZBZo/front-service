let getToken =()=>{
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'POST',
            url: '/get-token',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            xhrFields: { withCredentials: true },
            success: function(response) {
                console.log('Access토큰을 성공적으로 받았습니다:', response);
                localStorage.setItem('accessToken', response.accessToken);
                resolve(); // 비동기 작업 완료 후 다음 작업 진행
            },
            error: function(xhr, status, error) {
                console.log('토큰 요청에 실패했습니다:', error);
                reject(error); // 에러 발생 시 처리
            }
        });
    });
}

let setupAjax = () => {
    // 모든 Ajax 요청에 JWT Access Token을 포함
    $.ajaxSetup({
        beforeSend: function(xhr) {
            let token = localStorage.getItem('accessToken'); // 저장된 Access Token 가져오기
            if (token) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token); // Authorization 헤더에 Access Token 추가
            }
        }
    });
}

let checkToken = () => {
    let token = localStorage.getItem('accessToken');
    console.log('checktoken : ', token);
    if (token === 'undefined' || token == null || token.trim() === '') {
        localStorage.removeItem('accessToken');
        handleTokenExpiration();
        return;
    }

    // 토큰 검증을 위한 요청
    fetch('/validToken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token }) // ValidTokenRequestDTO에 맞춰 전송
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('서버 오류');
                console.log(err);
            }
            return response.json(); // JSON 형태의 응답 받기
        })
        .then(data => {
            const statusNum = Number(data.statusNum);
            console.log('검증 결과 : ', statusNum);
            switch (statusNum) {
                case 1: // 유효한 토큰
                    console.log('Access Token이 유효합니다.');
                    break;
                case 2: // 만료된 토큰
                    console.warn('Access Token이 만료되었습니다.');
                    handleTokenExpiration();
                    break;
                case 3: // 유효하지 않은 토큰
                    console.warn('유효하지 않은 Access Token입니다.');
                    handleTokenExpiration();
                    break;
                default: // 알 수 없는 상태 코드
                    console.error('알 수 없는 토큰 상태입니다.');
                    handleTokenExpiration();
            }
        })
        .catch(error => {
            console.error('토큰 검증 중 오류 발생:', error);
            localStorage.removeItem('accessToken');
            handleTokenExpiration();
        });
}

let handleTokenExpiration = () => {
    console.log('토큰 갱신 요청 시작');
    $.ajax({
        type: 'POST',
        url: '/refresh-token',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        },
        success: (response) => {
            console.log('res :: ', response.accessToken);

            if (response.accessToken && response.status === 1) {
                // 새로운 Access Token 저장
                localStorage.setItem('accessToken', response.accessToken);
                console.log('새로운 access token을 local storage에 저장하였습니다.');
                document.cookie = `Authorization=${response.accessToken}; path=/; samesite=Lax`;
                // setupAjax 호출
                setupAjax();
                checkToken();
            } else {
                console.warn('Access Token이 null이거나 상태 코드가 1이 아님.');
                failed(); // 로그인 필요 처리
            }
        },
        error: (xhr, status, error) => {
            console.error('갱신 요청 오류:', xhr, status, error);
            failed();
        }
    });
};

let failed = () => {
    alert('로그인이 필요합니다. 다시 로그인해주세요.');
    localStorage.removeItem('accessToken');
    window.location.href = '/webs/signin';
}

// function logout() {
//     // 로컬 스토리지에서 액세스 토큰 제거
//     localStorage.removeItem('accessToken');
//
//     // 서버에 로그아웃 요청을 보내어 리프레시 토큰 쿠키 제거 요청
//     $.ajax({
//         type: 'POST',
//         url: '/logout',
//         success: function() {
//             console.log('Logged out successfully.');
//             window.location.href = '/webs/signin'; // 로그인 페이지로 리다이렉트
//         },
//         error: function() {
//             console.log('Logout failed.');
//         }
//     });
// }
