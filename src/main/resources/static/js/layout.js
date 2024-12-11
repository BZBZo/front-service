document.addEventListener("DOMContentLoaded", () => {
    // 공통 함수: HTML 로드
    const loadHTML = (url, elementId, callback) => {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element with ID '${elementId}' not found.`);
            return;
        }

        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${url}`);
                }
                return response.text();
            })
            .then((html) => {
                element.innerHTML = html;
                if (callback) callback(); // 콜백 함수 실행
            })
            .catch((error) => {
                console.error(`Error loading ${url}:`, error);
            });
    };

    // 헤더 로드 및 스크롤 이벤트 추가
    loadHTML("header.html", "header", () => {
        const header = document.querySelector(".b2-header");
        if (header) {
            // 스크롤 이벤트 추가
            window.addEventListener("scroll", () => {
                if (window.scrollY > 50) {
                    header.classList.add("scrolled");
                } else {
                    header.classList.remove("scrolled");
                }
            });

            // SNS 버튼 클릭 이벤트 처리
            const snsButtons = header.querySelectorAll(".sns-button");
            snsButtons.forEach((button) => {
                button.addEventListener("click", (event) => {
                    event.preventDefault(); // 기본 동작 방지
                    const targetUrl = button.getAttribute("data-url");
                    if (targetUrl) {
                        window.location.href = targetUrl;
                    } else {
                        console.error("SNS 버튼에 URL이 정의되지 않았습니다.");
                    }
                });
            });
        } else {
            console.error("Header element not found in loaded HTML.");
        }
    });

    // 푸터 로드
    loadHTML("footer.html", "footer");
});
