$(document).ready(function () {
    const profileImage = document.getElementById('profileImage');
    const previewImage = document.getElementById('previewImage');

    if (!token) {
        alert("로그인이 필요한 서비스입니다.");
        window.location.href = '/webs/signin';
        return;
    }

    Promise.all([loadUserInfo(), loadProfileInfo()])
        .then(([memberNo, profileInfo]) => {
            console.log("모든 정보가 정상적으로 로드됨");
            console.log("회원번호:", memberNo);
            console.log("프로필 정보:", profileInfo);
        })
        .catch(error => {
            console.error("데이터 로딩 실패", error);
        });


    // '등록' 버튼 클릭 처리
    $('.action-btn').click(function() {
        const field = $(this).data('field');
        const input = $(`#${field}`);
        const value = input.val();

        console.log("field:", field); // 🔍 디버깅 로그 추가
        console.log("input element:", input); // 🔍 디버깅 로그 추가

        if (input.attr('type') === 'file') {
            // 파일 업로드 처리
            const file = input[0].files[0]; // 파일이 실제로 선택되었는지 확인
            if (file) {
                handleFileUpload(file, field);
            } else {
                alert('파일을 선택해주세요.');
            }
        } else {
            // 텍스트 입력값 처리
            // 새로운 값이 입력된 경우 등록 처리, 기존 값 수정 시 변경 처리
            if (value) {
                updateField(field, value, '변경');
            } else {
                updateField(field, value, '등록');
            }
        }
    });

    // 사용자 정보 업데이트
    function updateField(field, value, action) {
        console.log("field", field);
        console.log("value", value);
        console.log("action", action);
        if (!value && action === '등록') {
            alert('값을 입력해주세요.');
            return;
        }

        $.ajax({
            url: `/webs/user/update/${field}`,
            method: action === '변경' ? 'PUT' : 'POST', // 등록 시 POST, 수정 시 PUT
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            data: action === '변경' ? JSON.stringify({[field]: value}) : value,
            success: function(response) {
                if (action === '등록') {
                    alert('등록되었습니다.');
                } else {
                    alert('수정되었습니다.');
                }
                loadProfileInfo();  // 사용자 정보 새로 불러오기
            },
            error: function() {
                if (action === '등록') {
                    alert('등록에 실패했습니다.');
                } else {
                    alert('수정에 실패했습니다.');
                }
            }
        });
    }

    // 파일 업로드 처리 함수
    function handleFileUpload(file, field) {
        console.log("Uploading file for field:", field); // 🔍 디버깅 로그 추가
        console.log("File selected:", file.name); // 🔍 디버깅 로그 추가

        const formData = new FormData();
        formData.append('file', file);
        console.log("FormData contents:", formData);

        $.ajax({
            url: `/webs/user/update/${field}`,
            method: 'POST',
            headers: {
                'Authorization': token
            },
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                alert('이미지가 업로드되었습니다.');
                loadProfileInfo(); // 사용자 정보 새로 불러오기
            },
            error: function() {
                alert('이미지 업로드에 실패했습니다.');
            }
        });
    }

    // 이미지 선택 시 미리보기 표시
    profileImage.addEventListener('change', function (event) {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            resetImagePreview();
        }
    });

    // 이미지 미리보기 초기화 함수
    function resetImagePreview() {
        previewImage.src = defaultProfileImage;
        previewImage.style.display = 'block';
    }

    // 기본 프로필 이미지 설정 (필요시 수정)
    const defaultProfileImage = "https://s3.example.com/bz-user/default-profile.png";

    // 사용자 정보 로드 함수
    function loadProfileInfo() {
        return loadUserInfo().then(({ userInfo, memberNo }) => {  // 구조 분해 할당
            console.log("로드된 사용자 정보:", userInfo);
            console.log("로드된 memberNo:", memberNo); // 필요하면 사용 가능

            if (!userInfo) {
                alert('사용자 정보를 불러오지 못했습니다.');
                return Promise.reject("사용자 정보 없음");
            }

            // 프로필 이미지 설정 (DB에서 가져온 profilePic 사용)
            if (userInfo.profilePic) {
                previewImage.src = userInfo.profilePic;
            } else {
                previewImage.src = defaultProfileImage;
            }
            previewImage.style.display = 'block';

            if (userInfo.role === 'ROLE_SELLER') {
                $('.customer-section').hide();
                $('.seller-section').show();
                $('#seller-email').val(userInfo.email).prop('readonly', true);
                $('#seller-email-provider').text(userInfo.provider ? `(${userInfo.provider} 로그인)` : '');
                $('#businessNumber').val(userInfo.businessNumber).prop('readonly', true);
                setFieldValue('shopName', userInfo.nickname);
                setFieldValue('shopPhone', userInfo.phone);
                setFieldValue('shopIntroduce', userInfo.introduce);
            } else {
                $('.seller-section').hide();
                $('.customer-section').show();
                $('#email').val(userInfo.email).prop('readonly', true);
                $('#email-provider').text(userInfo.provider ? `(${userInfo.provider} 로그인)` : '');
                setFieldValue('nickname', userInfo.nickname);
                setFieldValue('phone', userInfo.phone);
                setFieldValue('introduce', userInfo.introduce);
            }

            console.log("적용된 닉네임:", userInfo.nickname);
            return userInfo;  // userInfo 반환 (Promise 체이닝 유지)
        }).catch(error => {
            alert('사용자 정보를 불러오는데 실패했습니다.');
            console.error("프로필 정보 로딩 실패:", error);
            return Promise.reject(error);
        });
    }




    // 입력값 변경 시 버튼 상태 변경
    function setFieldValue(field, value) {
        const input = $(`#${field}`);
        const checkBtn = input.siblings('.check-btn');
        const confirmBtn = input.siblings('.confirm-btn');
        let isChecked = false;

        input.val(value || '');
        updateButtonText(field, value ? '변경' : '등록');

        // confirm-btn 초기 비활성화
        confirmBtn.prop('disabled', true);

        input.on('input', function () {
            const inputValue = input.val();
            if (inputValue && inputValue !== value) {
                checkBtn.prop('disabled', false);
            } else {
                checkBtn.prop('disabled', true);
            }
            isChecked = false;
            confirmBtn.prop('disabled', true);
        });

        checkBtn.off('click').on('click', function () {
            const inputValue = input.val();
            if (!inputValue) {
                alert('값을 입력해주세요.');
                return;
            }

            if (inputValue === value) {
                alert('기존 정보와 동일합니다.');
                return;
            }

            let checkUrl = '';
            if (field === 'nickname') {
                checkUrl = `/webs/check/nickname?nickname=${inputValue}`;
            } else if (field === 'phone') {
                checkUrl = `/webs/check/customerPhone?customerPhone=${inputValue}`;
            } else if (field === 'shopName') {
                checkUrl = `/webs/check/nickname?nickname=${inputValue}`;
            } else if (field === 'shopPhone') {
                checkUrl = `/webs/check/sellerPhone?sellerPhone=${inputValue}`;
            }

            $.ajax({
                url: checkUrl,
                method: 'POST',
                headers: {
                    'Authorization': token
                },
                success: function (response) {
                    alert(response.message);
                    if (response.status === "available") {
                        isChecked = true;
                        confirmBtn.prop('disabled', false);
                    } else {
                        isChecked = false;
                        confirmBtn.prop('disabled', true);
                    }
                },
                error: function () {
                    alert('중복 확인 중 오류가 발생했습니다.');
                    confirmBtn.prop('disabled', true);
                }
            });
        });

        confirmBtn.off('click').on('click', function () {
            const inputValue = input.val();
            if (!inputValue) {
                alert('값을 입력해주세요.');
                return;
            }

            if (!isChecked) {
                alert('중복 확인을 먼저 진행해주세요.');
                return;
            }

            $.ajax({
                url: `/webs/user/update/${field}`,
                method: 'PUT',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({[field]: inputValue}),
                success: function () {
                    alert('수정되었습니다.');
                    loadProfileInfo();
                },
                error: function () {
                    alert('수정에 실패했습니다.');
                }
            });
        });
    }

    // 버튼 텍스트 업데이트 함수
    function updateButtonText(field, text) {
        $(`.action-btn[data-field="${field}"]`).text(text);
    }
});
