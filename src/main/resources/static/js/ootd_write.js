document.addEventListener('DOMContentLoaded', () => {
    const addProductBtn = document.getElementById('addProductBtn');
    const productList = document.getElementById('productList');
    const productModal = document.getElementById('productModal');
    const closeModalBtn = document.querySelector('.close-btn');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');
    const submitBtn = document.getElementById('submitBtn');
    const tagInput = document.querySelector('.ootd-tag-input');
    const imageUpload = document.getElementById('imageUpload'); // 파일 업로드 input
    const imagePreview = document.getElementById('imagePreview'); // 이미지 미리보기 영역
    const sampleIcon = document.getElementById('sampleIcon'); // 기본 이미지 아이콘
    const deleteBtn = document.getElementById('imageDeleteBtn'); // 이미지 삭제 버튼

    const maxProducts = 3;
    let productCount = 0;

    // **이미지 클릭 시 파일 선택**
    imagePreview.addEventListener('click', () => {
        imageUpload.click();
    });

    // **이미지 파일 업로드 및 미리보기**
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imagePreview.style.backgroundImage = `url(${event.target.result})`;
                imagePreview.style.backgroundSize = 'cover';
                imagePreview.style.backgroundPosition = 'center';
                sampleIcon.style.display = 'none'; // 아이콘 숨김
                deleteBtn.style.display = 'block'; // 삭제 버튼 표시
            };
            reader.readAsDataURL(file);
        } else {
            alert("이미지 파일만 업로드 가능합니다.");
            imageUpload.value = ''; // 잘못된 파일이면 초기화
        }
    });

    // **이미지 삭제 기능**
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // 부모 요소 클릭 이벤트 방지
        imagePreview.style.backgroundImage = ''; // 배경 이미지 제거
        sampleIcon.style.display = 'block'; // 기본 아이콘 다시 표시
        deleteBtn.style.display = 'none'; // 삭제 버튼 숨김
        imageUpload.value = ''; // input 값 초기화
    });

    // 상품 추가 버튼 클릭 시 모달 열기
    addProductBtn.addEventListener('click', async () => {
        productModal.style.display = 'block';
        try {
            const response = await fetch('/api/seller/products'); // SellerClient API URL
            if (response.ok) {
                const products = await response.json();
                renderProducts(products); // 상품 리스트 렌더링
            } else {
                console.error('상품 데이터를 불러오는 중 오류 발생');
            }
        } catch (error) {
            console.error('상품 데이터를 불러오는 중 오류 발생:', error);
        }
    });

    // 검색 버튼 클릭 시
    searchBtn.addEventListener('click', async () => {
        const keyword = searchInput.value.trim();
        if (!keyword) {
            alert("검색어를 입력하세요.");
            return;
        }

        try {
            const response = await fetch(`/ootd/search/products?keyword=${encodeURIComponent(keyword)}`);
            if (response.ok) {
                const products = await response.json();
                renderProducts(products); // 검색 결과 렌더링
            } else {
                console.error("상품 검색 실패:", response.status);
            }
        } catch (error) {
            console.error("상품 검색 중 오류 발생:", error);
        }
    });

    // 검색 결과 렌더링
    function renderProducts(products) {
        searchResults.innerHTML = ""; // 기존 결과 초기화

        if (products.length === 0) {
            searchResults.innerHTML = "<p>검색 결과가 없습니다.</p>";
            return;
        }

        products.forEach(product => {
            const productItem = document.createElement('div');
            productItem.className = "product-item";
            productItem.innerHTML = `
                <img src="${product.mainPicturePath}" alt="상품 이미지">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.price.toLocaleString()}원</p>
                    <button class="select-btn" data-id="${product.id}">선택</button>
                </div>
            `;

            // 선택 버튼 클릭 이벤트
            productItem.querySelector('.select-btn').addEventListener('click', () => {
                addProductToSelectedList(product);
                productModal.style.display = 'none';
            });

            searchResults.appendChild(productItem);
        });
    }

    // 선택된 상품을 OOTD 리스트에 추가
    function addProductToSelectedList(product) {
        if (productCount >= maxProducts) {
            alert("최대 3개의 상품만 추가할 수 있습니다.");
            return;
        }

        const productItem = document.createElement('div');
        productItem.classList.add('ootd-product-item');
        productItem.innerHTML = `
            <img src="${product.mainPicturePath}" alt="상품 이미지" class="ootd-product-img">
            <div class="ootd-product-info">
                <h3>${product.name}</h3>
                <span>${product.price.toLocaleString()}원</span>
            </div>
            <button class="delete-btn">&times;</button>
        `;

        // 삭제 버튼 클릭 이벤트
        productItem.querySelector('.delete-btn').addEventListener('click', () => {
            productList.removeChild(productItem);
            productCount--;
        });

        productList.appendChild(productItem);
        productCount++;
    }

    // 모달 닫기
    closeModalBtn.addEventListener('click', () => {
        productModal.style.display = 'none';
    });

    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault(); // 기본 제출 동작 방지

        let token = localStorage.getItem('accessToken'); // Authorization 토큰
        if (!token) {
            alert("로그인이 필요합니다.");
            window.location.href = '/webs/signin';
            return;
        }

        loadUserInfo().then(({ userInfo, memberNo }) => {  // 구조 분해 할당 사용
            if (!memberNo) {
                alert('사용자 정보를 불러오고 있습니다. 잠시 후 다시 시도해주세요.');
                return;
            }
            window.memberNo = memberNo; // 전역 변수로 저장
        }).catch(error => console.error('Error loading user info:', error));

        let tags = tagInput.value.trim();
        if (!tags) {
            alert("태그를 입력해주세요.");
            return;
        }

        // 선택된 상품 정보 수집
        let selectedProducts = [];
        document.querySelectorAll('.ootd-product-item').forEach(product => {
            let productId = product.querySelector('.delete-btn').dataset.id;
            if (productId) selectedProducts.push(productId);
        });
        let relProd = selectedProducts.join(',');

        // 이미지 파일 가져오기
        let imageFile = imageUpload.files[0];
        if (!imageFile) {
            alert("이미지를 업로드해주세요.");
            return;
        }

        // FormData 생성
        let formData = new FormData();
        formData.append("memberNo", memberNo);
        formData.append("tags", tags);
        formData.append("relProd", relProd);
        formData.append("image", imageFile);

        // 서버로 전송
        try {
            let response = await fetch('/ootd/write', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                alert("OOTD가 등록되었습니다!");
                window.location.href = '/ootd/list';
            } else {
                let errorMessage = await response.text();
                alert(`등록 실패: ${errorMessage}`);
            }
        } catch (error) {
            console.error("등록 중 오류 발생:", error);
            alert("등록 중 오류가 발생했습니다.");
        }
    });

});
