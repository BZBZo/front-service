document.addEventListener("DOMContentLoaded", () => {
    const megaMenuButton = document.getElementById("megaMenuButton");
    const megaMenu = document.getElementById("megaMenu");
    const closeMegaMenuButton = document.getElementById("closeMegaMenu");
    const dynamicMegaMenu = document.createElement('ul'); // 동적으로 추가될 메뉴 목록
    dynamicMegaMenu.id = 'dynamicMegaMenu';
    const b2NavMenu = document.querySelector('.b2-nav-menu');
    const b2NavMenuItems = b2NavMenu ? b2NavMenu.querySelectorAll('ul > li') : [];

    console.log("Mega Menu Button:", megaMenuButton);
    console.log("Mega Menu:", megaMenu);
    console.log("Close Mega Menu Button:", closeMegaMenuButton);

    // 요소가 제대로 선택되었는지 확인
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
            const decodedToken = JSON.parse(atob(token.split('.')[1])); // JWT 디코딩
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
