document.addEventListener("DOMContentLoaded", () => {
    // Mega Menu 요소 찾기
    const megaMenu = document.getElementById("megaMenu");
    const megaMenuButton = document.getElementById("megaMenuButton");
    const closeMegaMenuButton = document.getElementById("closeMegaMenu");

    // 요소가 존재하는지 확인
    if (megaMenu && megaMenuButton && closeMegaMenuButton) {
        // Mega Menu 열기
        megaMenuButton.addEventListener("click", () => {
            megaMenu.classList.add("active");
        });

        // Mega Menu 닫기
        closeMegaMenuButton.addEventListener("click", () => {
            megaMenu.classList.remove("active");
        });

        // ESC 키로 Mega Menu 닫기
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                megaMenu.classList.remove("active");
            }
        });
    } else {
        console.error("Mega Menu elements are not found in the DOM.");
        console.error(`megaMenu: ${megaMenu}, megaMenuButton: ${megaMenuButton}, closeMegaMenuButton: ${closeMegaMenuButton}`);
    }
});
