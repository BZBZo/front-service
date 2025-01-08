document.addEventListener('DOMContentLoaded', function () {
    // Quill 초기화
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline'],
                ['image']
            ]
        }
    });

    // 이미지 미리보기 함수
    window.previewMainImage = function (event) {
        const input = event.target;
        const imagePreview = document.getElementById('imagePreview');
        const placeholderText = document.getElementById('placeholderText');

        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                placeholderText.style.display = 'none';
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.src = '';
            imagePreview.style.display = 'none';
            placeholderText.style.display = 'block';
        }
    };

    const isCongRadioFalse = document.querySelector('input[name="isCong"][value="false"]');
    if (isCongRadioFalse) {
        isCongRadioFalse.checked = true;  // 처음 로드 시 false로 설정
    }

    const conditionContainer = document.getElementById("extraFields");
    const conditionInput = document.getElementById("condition");
    const addButton = document.getElementById("addConditionBtn");

    // 필드 추가 기능
    addButton.addEventListener("click", () => {
        addConditionField();
    });

    function addConditionField() {
        const fieldDiv = document.createElement("div");
        fieldDiv.classList.add("condition-field");
        fieldDiv.innerHTML = `
            모집인원 <input type="number" name="people[]" value="1" min="1" onchange="updateCondition()">
            할인율 <input type="number" name="discount[]" value="0" min="0" onchange="updateCondition()">
            <button type="button" class="remove-btn">X</button>
        `;

        const removeButton = fieldDiv.querySelector(".remove-btn");
        removeButton.addEventListener("click", () => {
            fieldDiv.remove();
            updateCondition();
        });

        conditionContainer.appendChild(fieldDiv);
        updateCondition(); // 필드 추가 시 condition 값 업데이트
    }

    // 필드 값 변경 감지 및 condition 업데이트
    window.updateCondition = () => {
        const peopleInputs = document.querySelectorAll('input[name="people[]"]');
        const discountInputs = document.querySelectorAll('input[name="discount[]"]');

        const conditions = [];
        peopleInputs.forEach((peopleInput, index) => {
            const peopleValue = parseInt(peopleInput.value || 0, 10);
            const discountValue = parseInt(discountInputs[index]?.value || 0, 10);

            // 값 검증: 모집인원과 할인율이 올바른 경우만 추가
            if (peopleValue > 0 && discountValue >= 0) {
                conditions.push(`{${peopleValue}:${discountValue}}`);
            }
        });

        conditionInput.value = conditions.join(',');
        console.log('Updated condition:', conditionInput.value);
    };

    // 공구 상태에 따라 필드 숨김/표시
    window.toggleFields = (isVisible) => {
        const isCong = document.querySelector('input[name="isCong"]:checked').value;  // 현재 선택된 값 가져오기
        console.log("isCong value: ", isCong);  // 콘솔에 출력

        if (isVisible) {
            conditionContainer.classList.remove("hidden");
            addButton.style.display = "inline-block";

            if (conditionContainer.children.length === 0) {
                addConditionField(); // 기본 필드 하나 추가
            }
        } else {
            conditionContainer.classList.add("hidden");
            addButton.style.display = "none";
            conditionContainer.innerHTML = ""; // 모든 필드 삭제
            conditionInput.value = "";
        }
    };
});

// 폼 제출 함수
function submitForm() {
    const description = quill.root.innerHTML.trim();
    if (!description) {
        alert('설명을 입력하세요.');
        return;
    }

    const formData = new FormData(document.getElementById('productForm'));
    formData.set('description', description);

    const isCong = document.querySelector('input[name="isCong"]:checked').value === "true"; // 값이 "true"일 때만 true로 설정
    console.log("isCong value during form submission: ", isCong); // isCong 값을 콘솔에 출력

    const condition = document.getElementById('condition').value;
    console.log('condition :: ', condition)

    if (isCong && !condition) {
        alert('공구 진행 상태가 "가능"일 경우, 조건을 입력해야 합니다.');
        return; // condition이 없으면 폼 제출을 중단
    }

    // ProdUploadRequestDTO 객체를 추가 (DTO를 JSON으로 변환)
    const productData = {
        name: document.getElementById('name').value,
        price: document.getElementById('price').value,
        quantity: document.getElementById('quantity').value,
        category: document.getElementById('category').value,
        description: description,
        isCong: isCong,
        condition: condition,
    };

    console.log('Product data:', productData);

    formData.set('productData', JSON.stringify(productData));  // 'productData'를 JSON 문자열로 추가

    console.log(productData);

    fetch('/product', {
        method: 'POST',
        body: formData
    })
        .then((response) => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then((data) => {
            if (data.url) {
                alert('상품이 성공적으로 등록되었습니다!');
                window.location.href = data.url;
            } else {
                alert('상품 등록 중 문제가 발생했습니다.');
            }
        })
        .catch((error) => {
            console.error('Error occurred during product registration:', error);
            alert('상품 등록 중 문제가 발생했습니다.');
        });
}