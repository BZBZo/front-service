let token = localStorage.getItem('accessToken');
$(document).ready(function () {
    // 사용자 정보 로드
    loadUserInfo();

    if (!token) {
        alert("로그인이 필요한 서비스입니다.");
        window.location.href = '/webs/signin';
        return;
    }

    // '등록' 버튼 클릭 처리
    $('.action-btn').click(function() {
        const field = $(this).data('field');
        const input = $(`#${field}`);
        const value = input.val();

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
                loadUserInfo();  // 사용자 정보 새로 불러오기
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
    // function handleFileUpload(file, field) {
    //     const formData = new FormData();
    //     formData.append('file', file);
    //
    //     $.ajax({
    //         url: `/webs/user/update/${field}`,
    //         method: 'POST',
    //         headers: {
    //             'Authorization': token
    //         },
    //         data: formData,
    //         processData: false,
    //         contentType: false,
    //         success: function(response) {
    //             alert('이미지가 업로드되었습니다.');
    //             loadUserInfo();
    //         },
    //         error: function() {
    //             alert('이미지 업로드에 실패했습니다.');
    //         }
    //     });
    // }

    // 사용자 정보 로드 함수
    function loadUserInfo() {
        $.ajax({
            url: '/webs/user/info',
            method: 'GET',
            headers: {
                'Authorization': token
            },
            success: function(userInfo) {
                if (userInfo.role === 'ROLE_SELLER') {
                    $('.customer-section').hide();
                    $('.seller-section').show();

                    // 판매자 이메일을 readonly로 설정하고 제공자 정보 표시
                    $('#seller-email').val(userInfo.email).prop('readonly', true);
                    $('#seller-email-provider').text(userInfo.provider ? `(${userInfo.provider} 로그인)` : '');

                    // 사업자 번호를 readonly로 설정
                    $('#businessNumber').val(userInfo.businessNumber).prop('readonly', true);

                    setFieldValue('shopName', userInfo.nickname);
                    setFieldValue('shopPhone', userInfo.phone);
                    setFieldValue('shopIntroduction', userInfo.introduce);
                } else {
                    $('.seller-section').hide();
                    $('.customer-section').show();

                    // 고객 이메일을 readonly로 설정하고 제공자 정보 표시
                    $('#email').val(userInfo.email).prop('readonly', true);
                    $('#email-provider').text(userInfo.provider ? `(${userInfo.provider} 로그인)` : '');

                    setFieldValue('nickname', userInfo.nickname);
                    setFieldValue('phone', userInfo.phone);
                    setFieldValue('introduction', userInfo.introduce);
                }
            },
            error: function() {
                alert('사용자 정보를 불러오는데 실패했습니다.');
            }
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
                    loadUserInfo();
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
