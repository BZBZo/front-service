let memberNo = null;
let token=localStorage.getItem("accessToken");
let nowArea = 'side';

$(document).ready(() => {
    // .option의 기본값으로 첫 번째 항목을 선택한 상태로 설정 (필요에 따라 인덱스를 변경)
    const defaultOption = $('.option').first(); // 첫 번째 .option을 기본값으로 선택
    const radioButton = defaultOption.find('input[name="adArea"]');

    // 기본값으로 클릭한 상태로 설정
    radioButton.prop('checked', true); // 라디오 버튼 선택
    nowArea = radioButton.val(); // 선택된 값 저장

    defaultOption.trigger('click'); // 해당 .option 클릭 이벤트 트리거

    getReservedTimes(); // 초기 예약된 날짜 불러오기

    $(document).on('click', '.option', function () {
        // 클릭된 라벨의 내부에서 라디오 버튼을 찾고, 체크 상태로 설정
        const radioButton = $(this).find('input[name="adArea"]');
        radioButton.prop('checked', true);

        // 선택된 라디오 버튼의 값을 가져옴
        const selectedValue = radioButton.val();

        // 필요 시 값을 다른 변수에 저장
        nowArea = selectedValue;
        console.log('nowArea :: ',nowArea);
        getReservedTimes();
    });


    console.log('document.ready 실행됨'); // 디버깅 로그
    getToken()
        .then(() => {
            console.log('getToken 성공');
            setupAjax();
            return checkToken();
        })
        .catch(error => {
            console.error('토큰을 가져오는 데 실패했습니다:', error);
        });

    loadUserInfo();
    document.getElementById('memberNo').value = memberNo;
});

document.addEventListener('DOMContentLoaded', () => {
    const adImageInput = document.getElementById('adImageInput');
    const previewImage = document.getElementById('previewImage');
    const guidelinesText = document.getElementById('guidelinesText');
    const deleteImageButton = document.getElementById('deleteImageButton');
    const adAreaInputs = document.querySelectorAll('input[name="adArea"]'); // 광고 위치 라디오 버튼
    const adForm = document.querySelector('.ad-form'); // 광고 신청 폼


    if (!adImageInput || !previewImage || !guidelinesText || !deleteImageButton || !adForm) {
        console.error("Required elements not found in the DOM.");
        return;
    }

    // 광고 위치에 따른 가이드라인 변경
    if (adAreaInputs) {
        adAreaInputs.forEach((input) => {
            input.addEventListener('change', function () {
                updateGuidelines(input.value);
            });
        });

        // 페이지 로드 시 기본 가이드라인 설정
        const selectedArea = document.querySelector('input[name="adArea"]:checked');
        if (selectedArea) {
            updateGuidelines(selectedArea.value);
        }
    }

    // 이미지 선택 시 미리보기 표시
    adImageInput.addEventListener('change', function (event) {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
                guidelinesText.style.display = 'none';
                deleteImageButton.style.display = 'block'; // 삭제 버튼 표시
            };
            reader.readAsDataURL(file);
        } else {
            resetImagePreview();
        }
    });

    // X 버튼 클릭 시 이미지 초기화
    deleteImageButton.addEventListener('click', function () {
        resetImagePreview();
        adImageInput.value = ""; // 파일 입력 값 초기화
    });

    // 폼 제출 시 광고 등록 요청
    adForm.addEventListener('submit', function (event) {
        event.preventDefault(); // 기본 폼 제출 방지

        const formData = new FormData(adForm);

        console.log('formData :: ', formData);

        fetch('/api/ad/write', {
            method: 'POST',
            body: formData,
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.message || '서버 오류');
                    });
                }
                return response.json();
            })
            .then(data => {
                alert(data.message);
                window.location.href = '/ad/list'; // 등록 후 이동할 페이지
            })
            .catch(error => {
                console.error('Error:', error);
                alert('광고 등록 중 오류가 발생했습니다.\n' + error.message);
            });
    });


    // 이미지 및 버튼 초기화 함수
    function resetImagePreview() {
        previewImage.src = '';
        previewImage.style.display = 'none';
        guidelinesText.style.display = 'block';
        deleteImageButton.style.display = 'none'; // 삭제 버튼 숨기기
    }

    // 광고 위치에 따른 가이드라인 업데이트 함수
    function updateGuidelines(position) {
        switch (position) {
            case 'side':
                guidelinesText.innerHTML = '<p>사이드: 가로 500px 세로 800px</p>';
                break;
            case 'top':
                guidelinesText.innerHTML = '<p>메인 상단: 가로 1600px 세로 840px</p>';
                break;
            case 'mid':
                guidelinesText.innerHTML = '<p>메인 중앙: 가로 1600px 세로 150px</p>';
                break;
            default:
                guidelinesText.innerHTML = '<p>위치를 선택하세요</p>';
                break;
        }
    }
});

function loadUserInfo() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/webs/user/info',
            method: 'GET',
            headers: {
                'Authorization': token
            },
            success: function (userInfo) {
                console.log('User Info:', userInfo);
                memberNo = userInfo.memberNo;
                console.log('Extracted memberNo:', memberNo);
                document.getElementById('memberNo').value = memberNo;
                resolve(); // 성공적으로 memberNo를 설정했을 때 resolve 호출
            },
            error: function () {
                alert('사용자 정보를 불러오는데 실패했습니다.');
                reject('Failed to load user info'); // 에러 발생 시 reject 호출
            }
        });
    });
}

function getReservedTimes(){
    let reservedRanges = []; // 예약된 날짜 범위 저장
    // Flatpickr 초기화
    const startDatePicker = flatpickr("#startDatePicker", {
        enableTime: true,
        dateFormat: "Y-m-d\\TH:i", // ISO-8601 형식
        minDate: "today",
        onChange: function (selectedDates, dateStr, instance) {
            // 시작일 선택 시 종료일 최소값 업데이트
            endDatePicker.set('minDate', dateStr);

            // 유효성 검사
            if (!validateDateRange(dateStr, endDatePicker.input.value, reservedRanges)) {
                // 선택한 날짜 초기화
                alertOnce("선택한 기간 중 이미 예약된 날짜가 포함되어 있습니다.");
                instance.clear(); // 시작일 초기화
            }
        }
    });

    const endDatePicker = flatpickr("#endDatePicker", {
        enableTime: true,
        dateFormat: "Y-m-d\\TH:i", // ISO-8601 형식
        minDate: "today",
        onChange: function (selectedDates, dateStr, instance) {
            // 예약된 날짜와 겹치는지 확인
            if (!validateDateRange(startDatePicker.input.value, dateStr, reservedRanges)) {
                // 선택한 날짜 초기화
                alertOnce("선택한 기간 중 이미 예약된 날짜가 포함되어 있습니다.");
                instance.clear(); // 종료일 초기화
            }
        }
    });


    $.ajax({
        url: "/api/ad/reserved-times", // 예약된 날짜를 가져오는 API
        method: "GET",
        data: { nowArea: nowArea }, // 선택된 adArea 값을 서버로 전달
        success: function (reservedDates) {
            console.log("Reserved Dates:", reservedDates);

            reservedRanges = reservedDates.map(date => ({
                from: new Date(new Date(date.adStart.replace(" ", "T")).setHours(0, 0, 0, 0)),
                to: new Date(new Date(date.adEnd.replace(" ", "T")).setHours(23, 59, 59, 999)),
            }));

            console.log("Reserved Ranges:", reservedRanges);

            // 예약된 날짜 비활성화
            startDatePicker.set('disable', reservedRanges);
            endDatePicker.set('disable', reservedRanges);

            console.log(startDatePicker); // Flatpickr 인스턴스인지 확인
            console.log(endDatePicker);

            console.log("StartDatePicker Disable Config:", startDatePicker.config.disable);
            console.log("EndDatePicker Disable Config:", endDatePicker.config.disable);
        },
        error: function (error) {
            console.error("Failed to fetch reserved dates:", error);
        }
    });

    // 선택된 기간이 예약된 날짜와 겹치는지 확인하는 함수
    function validateDateRange(startDate, endDate, ranges) {
        if (!startDate || !endDate) return true; // 날짜가 비어 있으면 통과

        // Flatpickr에서 반환된 ISO-8601 형식을 일반 문자열로 변환
        const start = new Date(startDate.replace("T", " ")).getTime();
        const end = new Date(endDate.replace("T", " ")).getTime();

        for (const range of ranges) {
            const rangeStart = new Date(range.from).getTime();
            const rangeEnd = new Date(range.to).getTime();
            // 선택한 날짜가 예약된 범위와 겹치는지 확인
            if ((start >= rangeStart && start <= rangeEnd) || // 시작일이 예약된 범위 안에 있음
                (end >= rangeStart && end <= rangeEnd) ||     // 종료일이 예약된 범위 안에 있음
                (start <= rangeStart && end >= rangeEnd)) {   // 예약된 범위를 포함하는 경우
                return false; // 유효하지 않음
            }
        }

        return true; // 유효
    }

    // 중복 alert 방지를 위한 함수
    let alertTimeout;
    function alertOnce(message) {
        if (!alertTimeout) {
            alert(message);
            alertTimeout = setTimeout(() => {
                alertTimeout = null; // 일정 시간이 지나면 다시 알림 표시 가능
            }, 20000); // 2초 간격으로 알림 가능
        }
    }
}