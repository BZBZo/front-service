$(document).ready(function() {
    // const token = localStorage.getItem('jwt');
    // if (!token) {
    //     window.location.href = '/webs/signin';
    //     return;
    // }

    loadUserInfo();

    $('.confirm-btn').prop('disabled', true);  // 초기에 변경 버튼 비활성화

    // 중복확인 버튼 클릭 이벤트
    $('.check-btn').click(function() {
        const input = $(this).closest('.input-with-button').find('input');
        const field = input.attr('id');
        const value = input.val();

        if (!value) {
            alert('값을 입력해주세요.');
            return;
        }

        $.ajax({
            url: `/webs/check/${field}`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            data: { value: value },
            success: function(response) {
                alert(response.message);
            }
        });
    });

// 등록/변경 버튼 클릭 이벤트 수정
    $('.action-btn, .confirm-btn').click(function() {
        const container = $(this).closest('.input-with-button');
        const input = container.find('input');
        const field = $(this).data('field') || input.attr('id');
        const value = input.val();

        if (input.attr('type') === 'file') {
            handleFileUpload(input, field);
        } else {
            if (!value) {
                alert('값을 입력해주세요.');
                return;
            }
            handleFieldUpdate(field, value);
        }
    });

    // 파일 업로드 처리 함수 추가
    function handleFileUpload(input, field) {
        const file = input[0].files[0];
        if (!file) {
            alert('파일을 선택해주세요.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        $.ajax({
            url: `/api/upload/${field}`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`
            },
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                alert('이미지가 업로드되었습니다.');
                loadUserInfo();
            },
            error: function() {
                alert('이미지 업로드에 실패했습니다.');
            }
        });
    }

// 일반 필드 업데이트 함수 추가
    function handleFieldUpdate(field, value) {
        $.ajax({
            url: `/api/update/${field}`,
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({ [field]: value }),
            success: function(response) {
                alert('수정되었습니다.');
                loadUserInfo();
            },
            error: function() {
                alert('수정에 실패했습니다.');
            }
        });
    }

    // 파일 입력 변경 시 미리보기
    $('input[type="file"]').change(function() {
        const file = this.files[0];
        const preview = $(this).siblings('.preview-image');

        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.attr('src', e.target.result).show();
            }
            reader.readAsDataURL(file);
        } else {
            preview.hide();
        }
    });

    // 수정 완료 버튼 클릭 이벤트
    $('.complete-btn').click(function() {
        if(confirm('수정을 완료하시겠습니까?')) {
            window.location.href = '/';
        }
    });

    // 회원탈퇴 버튼 클릭 이벤트
    $('.withdraw-btn').click(function() {
        if(confirm('정말로 탈퇴하시겠습니까?')) {
            $.ajax({
                url: '/api/withdraw',
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                success: function() {
                    localStorage.removeItem('jwt');
                    alert('탈퇴되었습니다.');
                    window.location.href = '/';
                },
                error: function() {
                    alert('탈퇴에 실패했습니다.');
                }
            });
        }
    });
});

// 사용자 정보 로드 함수
function loadUserInfo() {
    const token = localStorage.getItem('jwt');

    $.ajax({
        url: '/api/user/info',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function(userInfo) {
            if (userInfo.role === 'ROLE_SELLER') {
                $('.customer-section').hide();
                $('.seller-section').show();

                setFieldValue('shopName', userInfo.shopName);
                setFieldValue('shopPhone', userInfo.shopPhone);
                setFieldValue('shopIntroduction', userInfo.shopIntroduction);

                if (userInfo.shopImage) {
                    $('#shopImage').siblings('.preview-image').attr('src', userInfo.shopImage).show();
                    updateButtonText('shopImage', '변경');
                } else {
                    updateButtonText('shopImage', '등록');
                }
            } else {
                $('.seller-section').hide();
                $('.customer-section').show();

                setFieldValue('nickname', userInfo.nickname);
                setFieldValue('phone', userInfo.phone);
                setFieldValue('introduction', userInfo.introduction);

                if (userInfo.profileImage) {
                    $('#profileImage').siblings('.preview-image').attr('src', userInfo.profileImage).show();
                    updateButtonText('profileImage', '변경');
                } else {
                    updateButtonText('profileImage', '등록');
                }
            }
        },
        error: function() {
            alert('사용자 정보를 불러오는데 실패했습니다.');
            window.location.href = '/login';
        }
    });
}

function setFieldValue(field, value) {
    if (value) {
        $(`#${field}`).attr('placeholder', value);
        updateButtonText(field, '변경');
    } else {
        $(`#${field}`).attr('placeholder', '');
        updateButtonText(field, '등록');
    }
}

function updateButtonText(field, text) {
    $(`.action-btn[data-field="${field}"]`).text(text);
}