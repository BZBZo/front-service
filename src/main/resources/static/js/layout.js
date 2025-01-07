document.addEventListener("DOMContentLoaded", () => {
    const megaMenuButton = document.getElementById("megaMenuButton");
    const megaMenu = document.getElementById("megaMenu");
    const closeMegaMenuButton = document.getElementById("closeMegaMenu");
    const logoutButton = document.getElementById('logout-btn');
    console.log("Mega Menu Button:", megaMenuButton);
    console.log("Mega Menu:", megaMenu);
    console.log("Close Mega Menu Button:", closeMegaMenuButton);
    console.log('Logout button:', logoutButton); // 버튼이 정상적으로 선택되었는지 확인

    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            if (confirm('정말 로그아웃 하시겠습니까?')) {
                logout();
            }
        });
    }

    // 요소가 제대로 선택되었는지 확인
    if (!megaMenu || !megaMenuButton || !closeMegaMenuButton) {
        console.error("Mega Menu elements are missing.");
        return;
    }

    megaMenuButton.addEventListener("click", () => {
        megaMenu.classList.add("active");
        document.body.style.overflow = "hidden"; // 스크롤 방지

        // 토큰에서 사용자 역할 가져오기
        let token = localStorage.getItem('accessToken');
        if (!token) {
            alert("로그인이 필요한 서비스입니다.");
            window.location.href = '/webs/signin';
            return;
        }

        const userRole = getUserRoleFromToken(token);
        // 역할에 맞는 메뉴 렌더링
        renderMenuBasedOnRole(userRole);
    });
    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            if (confirm('정말 로그아웃 하시겠습니까?')) {
                logout();
            }
        });
    }

    closeMegaMenuButton.addEventListener("click", () => {
        megaMenu.classList.remove("active");
        document.body.style.overflow = "auto"; // 스크롤 복원
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            megaMenu.classList.remove("active");
            document.body.style.overflow = "auto";
        }
    });

    megaMenu.addEventListener("click", (event) => {
        if (event.target === megaMenu) {
            megaMenu.classList.remove("active");
            document.body.style.overflow = "auto";
        }
    });

    function getUserRoleFromToken(token) {
        try {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));  // JWT 디코딩
            return decodedToken.role;  // 토큰에서 'role' 추출
        } catch (error) {
            console.error("토큰 디코딩에 실패했습니다.", error);
            return null;
        }
    }

    function renderMenuBasedOnRole(role) {
        if (role === 'ROLE_SELLER') {
            document.querySelectorAll('.customer-menu, .customer-header').forEach(el => {
                el.style.display = 'none';
            });
            document.querySelectorAll('.seller-menu, .seller-header').forEach(el => {
                el.style.display = 'block';
            });
        } else if (role === 'ROLE_CUSTOMER') {
            document.querySelectorAll('.seller-menu, .seller-header').forEach(el => {
                el.style.display = 'none';
            });
            document.querySelectorAll('.customer-menu, .customer-header').forEach(el => {
                el.style.display = 'block';
            });
        } else {
            console.error('권한이 없습니다.');
        }
    }

});

function logout() {
    const token = localStorage.getItem('accessToken'); // Access Token 가져오기
    if (!token) {
        console.error('Access Token is missing');
        alert('로그인이 필요합니다. 다시 로그인해주세요.');
        window.location.href = '/webs/signin';
        return;
    }

    fetch('/webs/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token // Authorization 헤더 추가
        }
    })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json(); // JSON으로 변환
        })
        .then(data => {
            console.log("Server Response:", data); // 서버 응답 출력
            alert('로그아웃 성공');
            clearSession();
            window.location.href = '/webs/signin';
        })
        .catch(error => {
            console.error('Error:', error); // 오류 로그 출력
            alert('로그아웃 중 문제가 발생했습니다.');
        });
}

function clearSession() {
    deleteCookie('Authorization');
    deleteCookie('refreshToken');
    deleteCookie('JSESSIONID');
    deleteCookie('Idea-7645dd67');
    localStorage.removeItem('accessToken');
}

function deleteCookie(name) {
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
}