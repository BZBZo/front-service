let token = localStorage.getItem('accessToken');
$(document).ready(function () {
    let token = localStorage.getItem('accessToken');

    if (!token) {
        alert("로그인이 필요한 서비스입니다.");
        window.location.href = '/webs/signin';
        return;
    }

    // 사용자 정보 로드
    loadUserInfo();

    function loadUserInfo() {
        $.ajax({
            url: '/webs/user/info',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // 토큰 추가
            },
            success: function (userInfo) {
                console.log("사용자 정보: ", userInfo);
                // 닉네임과 프로필 이미지 업데이트
                $('#userNickname').text(userInfo.nickname);
                $('#userProfilePic').attr('src', userInfo.profilePic || '/images/default-profile.png');
            },
            error: function (err) {
                console.error("사용자 정보를 가져오지 못했습니다: ", err);
                alert('사용자 정보를 가져오는데 실패했습니다.');
            }
        });
    }
});
