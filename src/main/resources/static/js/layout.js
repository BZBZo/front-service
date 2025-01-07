document.addEventListener("DOMContentLoaded", () => {
    const megaMenuButton = document.getElementById("megaMenuButton");
    const megaMenu = document.getElementById("megaMenu");
    const closeMegaMenuButton = document.getElementById("closeMegaMenu");
    const logoutButton = document.getElementById('logout-btn');
    const dynamicMegaMenu = document.createElement('ul'); // 동적으로 추가될 메뉴 목록
    dynamicMegaMenu.id = 'dynamicMegaMenu';
    const b2NavMenu = document.querySelector('.b2-nav-menu');
    const b2NavMenuItems = b2NavMenu ? b2NavMenu.querySelectorAll('ul > li') : [];

    console.log("Mega Menu Button:", megaMenuButton);
    console.log("Mega Menu:", megaMenu);
    console.log("Close Mega Menu Button:", closeMegaMenuButton);
    console.log('Logout button:', logoutButton);

    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            if (confirm('정말 로그아웃 하시겠습니까?')) {
                logout();
            }
        });
    }

    if (!megaMenu || !megaMenuButton || !closeMegaMenuButton) {
        console.error("Mega Menu elements are missing.");
        return;
    }

    // 화면 크기 변경에 따라 동적으로 b2-nav-menu 항목을 megaMenu에 추가/제거
    const updateMegaMenu = () => {
        if (window.innerWidth <= 800) {
            dynamicMegaMenu.innerHTML = ""; // 기존 항목 초기화
            b2NavMenuItems.forEach(item => {
                const cloneItem = item.cloneNode(true);
                dynamicMegaMenu.appendChild(cloneItem);
            });
            megaMenu.querySelector('.menu-content').prepend(dynamicMegaMenu);
        } else {
            if (dynamicMegaMenu.parentNode) {
                dynamicMegaMenu.parentNode.removeChild(dynamicMegaMenu);
            }
        }
    };

    // 초기 실행 및 화면 크기 변경 이벤트 등록
    updateMegaMenu();
    window.addEventListener('resize', updateMegaMenu);

    megaMenuButton.addEventListener("click", () => {
        megaMenu.classList.add("active");
        document.body.style.overflow = "hidden";

        let token = localStorage.getItem('accessToken');
        if (!token) {
            alert("로그인이 필요한 서비스입니다.");
            window.location.href = '/webs/signin';
            return;
        }

        const userRole = getUserRoleFromToken(token);
        renderMenuBasedOnRole(userRole);
    });

    closeMegaMenuButton.addEventListener("click", () => {
        megaMenu.classList.remove("active");
        document.body.style.overflow = "auto";
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
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            return decodedToken.role;
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
    const token = localStorage.getItem('accessToken');
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
            'Authorization': 'Bearer ' + token
        }
    })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log("Server Response:", data);
            alert('로그아웃 성공');
            clearSession();
            window.location.href = '/webs/signin';
        })
        .catch(error => {
            console.error('Error:', error);
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
