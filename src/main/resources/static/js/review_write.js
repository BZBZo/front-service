function submitForm() {
    const form = document.getElementById("ootdForm");
    const formData = new FormData(form); // ✅ 자동으로 form 내부 데이터 포함됨

    console.log([...formData.entries()]); // 🔥 formData 확인

    fetch(form.action, {
        method: 'POST',
        body: formData, // ✅ Content-Type 자동 설정 (설정하지 않음!)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("서버에서 문제가 발생했습니다: " + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.url) {
                alert(data.message || "리뷰가 성공적으로 등록되었습니다.");
                window.location.href = data.url;
            } else {
                alert("서버 응답에 URL이 포함되어 있지 않습니다.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("리뷰 등록 과정에서 오류가 발생했습니다: " + error.message);
        });
}




document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('ootdForm');
    const productId = document.getElementById('productId').value;
    const purchaseId = document.getElementById('purchaseId').value;
    form.action = '/customer/history/review/' + productId +'/'+ purchaseId; // Form action 설정
});
let selectedFiles = []; // 🔥 선택된 모든 파일을 저장하는 배열

function previewImages(event) {
    const input = event.target;
    const imageContainer = document.getElementById("imagePreviewContainer");
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB 제한
    const MAX_IMAGES = 4; // 최대 이미지 개수 제한

    // 새로 선택한 파일들을 가져오기
    const newFiles = Array.from(input.files);

    // 기존 선택된 파일 + 새로 선택한 파일 합치기
    selectedFiles = [...selectedFiles, ...newFiles].slice(0, MAX_IMAGES); // 최대 4개 제한

    // 기존 미리보기 삭제 후 다시 렌더링
    renderImagePreviews();
}

function renderImagePreviews() {
    const imageContainer = document.getElementById("imagePreviewContainer");
    imageContainer.innerHTML = ''; // 기존 미리보기 삭제

    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        const divElement = document.createElement("div");
        const imgElement = document.createElement("img");
        const deleteButton = document.createElement("button");

        divElement.classList.add("image-preview-item");

        imgElement.style.width = "100%";
        imgElement.style.height = "100%";
        imgElement.style.objectFit = "cover";
        imgElement.style.borderRadius = "10px";

        deleteButton.classList.add("delete-button");
        deleteButton.textContent = "×";
        deleteButton.onclick = function () {
            removeImage(index);
        };

        reader.onload = (e) => {
            imgElement.src = e.target.result;
            divElement.appendChild(imgElement);
            divElement.appendChild(deleteButton);
            imageContainer.appendChild(divElement);
        };

        reader.readAsDataURL(file);
    });

    updateInputFiles();
}

function removeImage(index) {
    selectedFiles.splice(index, 1); // 선택된 배열에서 삭제
    renderImagePreviews(); // 미리보기 업데이트
}

function updateInputFiles() {
    const input = document.getElementById("reviewImg");
    const dataTransfer = new DataTransfer();

    selectedFiles.forEach(file => dataTransfer.items.add(file));
    input.files = dataTransfer.files; // 🔥 `input.files` 업데이트
}
