document.addEventListener('DOMContentLoaded', function () {
    const quill = initializeQuill(); // Quill 에디터 초기화
    initializeConditionFields(); // 조건 필드 초기화

    // 전역에서 사용할 함수 설정
    window.submitForm = () => handleFormSubmit(quill);
    window.previewMainImage = previewMainImage;
});

/**
 * Quill 에디터 초기화
 */
function initializeQuill() {
    const quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [['bold', 'italic', 'underline'], ['image']],
        },
    });
    const descriptionElement = document.getElementById('description');
    quill.root.innerHTML = descriptionElement.textContent.trim(); // 기존 설명 로드
    return quill;
}

/**
 * 조건 필드 초기화
 */
function initializeConditionFields() {
    const conditionInput = document.querySelector('input[name="condition"]');
    const addConditionBtn = document.getElementById('addConditionBtn');
    const isCongChecked = document.querySelector('input[name="isCong"]:checked')?.value === "true";

    toggleFields(isCongChecked);

    if (conditionInput?.value.trim()) {
        conditionInput.value.split(',').forEach((cond) => {
            const [people, discount] = cond.replace(/[{}]/g, '').split(':');
            addConditionRow(people, discount);
        });
    } else {
        addConditionRow(1, 0);
        updateCondition();
    }

    addConditionBtn?.addEventListener("click", () => {
        addConditionRow(1, 0);
        updateCondition();
    });
}

/**
 * 조건 필드 표시/숨기기
 */
function toggleFields(isCong, radioButton) {
    const conditionContainer = document.querySelector('.condition-container');
    const conditionInput = document.getElementById('condition');

    if (isCong) {
        // 'isCong'가 true일 경우 condition 테이블을 활성화
        conditionContainer.style.display = 'block';

        // 기존 condition 값을 유지하도록 설정 (필요한 경우 조건을 자동 생성)
        if (!conditionInput.value) {
            // 기본값이나 조건을 자동으로 추가하는 로직
            conditionInput.value = JSON.stringify([{ minCount: 10, discount: 5 }]);  // 예시값
        }
    } else {
        // 'isCong'가 false일 경우 condition 테이블을 숨기고 기본값 설정
        conditionContainer.style.display = 'none';

        // 기본값을 condition에 설정 (값이 없도록 설정)
        conditionInput.value = JSON.stringify([]);  // 빈 배열로 기본값 처리
    }
}

/**
 * 조건 행 추가
 */
function addConditionRow(people = 1, discount = 0) {
    const conditionTableBody = document.querySelector('#conditionTable tbody');
    if (!conditionTableBody) return;

    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="number" class="people-input" value="${people}" min="1"></td>
        <td><input type="number" class="discount-input" value="${discount}" min="0"></td>
        <td><button type="button" class="remove-row">삭제</button></td>
    `;

    row.querySelector('.remove-row').addEventListener('click', () => {
        row.remove();
        updateCondition();
    });

    row.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', updateCondition);
    });

    conditionTableBody.appendChild(row);
}

/**
 * 조건 업데이트
 */
function updateCondition() {
    const conditionTableBody = document.querySelector('#conditionTable tbody');
    const conditionInput = document.querySelector('input[name="condition"]');
    if (!conditionTableBody || !conditionInput) return;

    const rows = Array.from(conditionTableBody.querySelectorAll('tr'));
    conditionInput.value = rows.map(row => {
        const people = row.querySelector('.people-input').value || 1;
        const discount = row.querySelector('.discount-input').value || 0;
        return `{"${people}":${discount}}`; // JSON 형식으로 수정
    }).join(',');
}

/**
 * 메인 이미지 미리보기
 */
function previewMainImage(event) {
    const input = event.target;
    const imagePreview = document.getElementById('imagePreview');
    const placeholderText = document.getElementById('placeholderText');
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 최대 파일 크기: 10MB

    if (input.files && input.files[0]) {
        const file = input.files[0];
        if (file.size > MAX_FILE_SIZE) {
            alert('이미지 파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해 주세요.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            if (placeholderText) {
                placeholderText.style.display = 'none';
            }
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.src = '';
        imagePreview.style.display = 'none';
        if (placeholderText) {
            placeholderText.style.display = 'block';
        }
    }
}

// 폼 제출 처리
function handleFormSubmit(quill) {
    const form = document.getElementById('productForm');
    const formData = new FormData(form);
    formData.set('description', quill.root.innerHTML.trim());

    const isCong = document.querySelector('input[name="isCong"]:checked').value === "true";
    let condition = document.getElementById('condition').value;

    // 'isCong'가 false일 때 기본값을 적용
    if (!isCong) {
        condition = '{"1":0}'; // 기본값
    }

    // condition 값이 비어 있거나 잘못된 경우 기본값을 설정
    if (!condition || condition.trim() === "") {
        condition = '{"1":0}'; // 기본값
    }

    // condition을 JSON 문자열로 변환하여 전송
    try {
        JSON.parse(condition); // 유효한 JSON인지 체크
    } catch (e) {
        alert('Condition 필드는 유효한 JSON 형식이어야 합니다.');
        return;
    }

    const productData = JSON.stringify({
        name: document.getElementById('name').value,
        price: document.getElementById('price').value,
        quantity: document.getElementById('quantity').value,
        category: document.getElementById('category').value,
        description: quill.root.innerHTML.trim(),
        isCong: isCong,
        condition: condition,  // JSON 포맷으로 그대로 전송
        sellerId: document.getElementById("sellerId").value
    });

    formData.append('productData', new Blob([productData], { type: 'application/json' }));

    const mainPictureInput = document.querySelector('input[name="mainPicture"]');
    const existingMainPicturePath = document.getElementById('mainPicturePath')?.value; // mainPicturePath가 없으면 undefined

    if (mainPictureInput.files.length > 0) {
        // 이미지가 선택되었으면 새 이미지로 설정
        formData.append('mainPicture', mainPictureInput.files[0]);
    } else if (existingMainPicturePath) {
        // 이미지가 선택되지 않았다면 기존 이미지 경로를 그대로 추가
        formData.append('mainPicturePath', existingMainPicturePath);
    } else {
        // 이미지도 없고 mainPicturePath도 없다면, 경고하고 폼 제출을 중지
        alert('상품의 이미지 경로가 존재하지 않습니다.');
        return;
    }

    // 비어있는 값이 포함되지 않도록 하기 위해 FormData를 다시 점검
    if (!formData.has('mainPicture') && !formData.has('mainPicturePath')) {
        alert('이미지가 없으면 수정할 수 없습니다.');
        return;
    }

    console.log('상품 상품 그것은 상품.', formData, productData)

    // 폼 전송 처리
    fetch(form.action, {
        method: 'PUT',
        body: formData,
    })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('상품이 성공적으로 수정되었습니다!');
                window.location.href = '/product/myMarket';
            } else {
                alert('상품 수정 중 오류가 발생했습니다.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('상품 수정 중 오류가 발생했습니다.');
        });
}