$(document).ready(function() {
    const token = localStorage.getItem('accessToken');
    let validationStates = {
        sellerIntroduceValid: true,
        customerIntroduceValid: true,
        sellerImageValid: true,
        customerImageValid: true,
        shopNameValid: false,
        nicknameValid: false,
        sellerPhoneValid: false,
        customerPhoneValid: false,
    }

    if (!token) {
        alert("로그인이 필요한 서비스입니다.")
        window.location.href = '/webs/signin';
        return;
    }

    getToken()
        .then(() => {
            setupAjax();
            return checkToken();
        })
        .catch(error => {
            console.error('토큰을 가져오는 데 실패했습니다:', error);
        });

    loadUserInfo();

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

                    // if (userInfo.shopImage) {
                    //     $('#shopImage').siblings('.preview-image').attr('src', userInfo.shopImage).show();
                    //     updateButtonText('shopImage', '변경');
                    // } else {
                    //     updateButtonText('shopImage', '등록');
                    // }
                } else {
                    $('.seller-section').hide();
                    $('.customer-section').show();

                    // 고객 이메일을 readonly로 설정하고 제공자 정보 표시
                    $('#email').val(userInfo.email).prop('readonly', true);
                    $('#email-provider').text(userInfo.provider ? `(${userInfo.provider} 로그인)` : '');

                    setFieldValue('nickname', userInfo.nickname);
                    setFieldValue('phone', userInfo.phone);
                    setFieldValue('introduction', userInfo.introduce);

                    // if (userInfo.profileImage) {
                    //     $('#profileImage').siblings('.preview-image').attr('src', userInfo.profileImage).show();
                    //     updateButtonText('profileImage', '변경');
                    // } else {
                    //     updateButtonText('profileImage', '등록');
                    // }
                }
            },
            error: function() {
                alert('사용자 정보를 불러오는데 실패했습니다.');
                // window.location.href = '/login';
            }
        });
    }

    // // 초기에 변경 버튼 비활성화
    // $('.confirm-btn').prop('disabled', true);
    // $('.check-btn').prop('disabled', true);

    // 입력 필드값 변경 시 확인 버튼 상태 초기화
    function setFieldValue(field, value) {
        const input = $(`#${field}`);
        const checkBtn = input.siblings('.check-btn');
        const confirmBtn = input.siblings('.confirm-btn');
        let isChecked = false;

        if (value) {
            input.attr('placeholder', value);
            updateButtonText(field, '변경');
        } else {
            input.attr('placeholder', '');
            updateButtonText(field, '등록');
        }

        // 실시간으로 입력값 변경에 따라 중복 체크 버튼 상태 업데이트
        input.on('input', function() {
            const inputValue = input.val();
            if (inputValue !== input.attr('placeholder')) {
                checkBtn.prop('disabled', false);
            } else {
                checkBtn.prop('disabled', true);
            }
        });

        // 중복 확인 버튼 클릭 시 처리
        $(checkBtn).click(function() {
            const value = input.val();
            if (!value) {
                alert('값을 입력해주세요.');
                return;
            }

            // 기존 값과 입력값이 동일한지 확인
            if (value === input.attr('placeholder')) {
                alert('기존 정보와 동일합니다');
                return;
            }

            let checkUrl = '';
            // 중복 확인 API URL 설정
            if (field === 'nickname') {
                checkUrl = '/webs/check/nickname?nickname=';
            } else if (field === 'phone') {
                checkUrl = '/webs/check/customerPhone?customerPhone=';
            } else if (field === 'shopName') {
                checkUrl = '/webs/check/nickname?nickname='; // 같은 API를 사용하므로 shopName은 nickname 확인
            } else if (field === 'shopPhone') {
                checkUrl = '/webs/check/sellerPhone?sellerPhone=';
            }

            $.ajax({
                url: checkUrl + value,
                method: 'POST',
                headers: {
                    'Authorization': token
                },
                success: function(response) {
                    alert(response.message);
                    if (response.status === "available") {
                        isChecked = true;
                        confirmBtn.prop('disabled', false); // 중복 없으면 변경 버튼 활성화
                    } else {
                        isChecked = false;
                        confirmBtn.prop('disabled', true);  // 중복이면 변경 버튼 비활성화
                    }
                },
                error: function() {
                    alert('중복 확인 중 오류가 발생했습니다.');
                    confirmBtn.prop('disabled', true);  // 오류 시 변경 버튼 비활성화
                }
            });
        });

        // 변경 버튼 클릭 시 처리
        $(confirmBtn).click(function() {
            const value = input.val();
            if (!value) {
                alert('값을 입력해주세요.');
                return;
            }

            if (!isChecked) {
                alert('중복 확인을 먼저 진행해주세요.')
                return;
            }

            $.ajax({
                url: `/webs/update/${field}`,
                method: 'PUT',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({ [field]: value }),
                success: function() {
                    alert('수정되었습니다.');
                    loadUserInfo();
                },
                error: function() {
                    alert('수정에 실패했습니다.');
                }
            });
        });

        function updateButtonText(field, text) {
            $(`.action-btn[data-field="${field}"]`).text(text);
        }
    }


//     $('.check-btn').click(function() {
//         const input = $(this).closest('.input-with-button').find('input');
//         const field = input.attr('id');
//         const value = input.val();
//         const confirmBtn = $(this).siblings('.confirm-btn');
//
//         if (!value) {
//             alert('값을 입력해주세요.');
//             return;
//         }

// // JWT 토큰 처리 및 사용자 정보 로드
// document.addEventListener('DOMContentLoaded', async () => {
//     const token = localStorage.getItem('jwt');
//     if (!token) {
//         window.location.href = '/login';
//         return;
//     }
//
//         $.ajax({
//             url: `/webs/check/${field}`,
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             },
//             data: { value: value },
//             success: function(response) {
//                 alert(response.message);
//                 if (response.status === "available") {
//                     confirmBtn.prop('disabled', false);
//                 } else {
//                     confirmBtn.prop('disabled', true);
//                 }
//             },
//             error: function() {
//                 alert('중복 확인 중 오류가 발생했습니다.');
//                 confirmBtn.prop('disabled', true);
//             }
//         });
//     });
//
//
// // 등록/변경 버튼 클릭 이벤트 수정
//     $('.action-btn, .confirm-btn').click(function() {
//         const container = $(this).closest('.input-with-button');
//         const input = container.find('input');
//         const field = $(this).data('field') || input.attr('id');
//         const value = input.val();
//
//         if (input.attr('type') === 'file') {
//             handleFileUpload(input, field);
//         } else {
//             if (!value) {
//                 alert('값을 입력해주세요.');
//                 return;
//             }
//             handleFieldUpdate(field, value);
//         }
//     });
//
//     // 파일 업로드 처리 함수 추가
//     function handleFileUpload(input, field) {
//         const file = input[0].files[0];
//         if (!file) {
//             alert('파일을 선택해주세요.');
//             return;
//         }
//
//         const formData = new FormData();
//         formData.append('file', file);
//
//         $.ajax({
//             url: `/api/upload/${field}`,
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('jwt')}`
//             },
//             data: formData,
//             processData: false,
//             contentType: false,
//             success: function(response) {
//                 alert('이미지가 업로드되었습니다.');
//                 loadUserInfo();
//             },
//             error: function() {
//                 alert('이미지 업로드에 실패했습니다.');
//             }
//         });
//     }
//
// // 일반 필드 업데이트 함수 추가
//     function handleFieldUpdate(field, value) {
//         $.ajax({
//             url: `/api/update/${field}`,
//             method: 'PUT',
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
//                 'Content-Type': 'application/json'
//             },
//             data: JSON.stringify({ [field]: value }),
//             success: function(response) {
//                 alert('수정되었습니다.');
//                 loadUserInfo();
//             },
//             error: function() {
//                 alert('수정에 실패했습니다.');
//             }
//         });
//     }
//
//     // 파일 입력 변경 시 미리보기
//     $('input[type="file"]').change(function() {
//         const file = this.files[0];
//         const preview = $(this).siblings('.preview-image');
//
//         if (file) {
//             const reader = new FileReader();
//             reader.onload = function(e) {
//                 preview.attr('src', e.target.result).show();
//             }
//             reader.readAsDataURL(file);
//         } else {
//             preview.hide();
//         }
//     });
//
//
//     // 회원탈퇴 버튼 클릭 이벤트
//     $('.withdraw-btn').click(function() {
//         if(confirm('정말로 탈퇴하시겠습니까?')) {
//             $.ajax({
//                 url: '/api/withdraw',
//                 method: 'DELETE',
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 },
//                 success: function() {
//                     localStorage.removeItem('jwt');
//                     alert('탈퇴되었습니다.');
//                     window.location.href = '/';
//                 },
//                 error: function() {
//                     alert('탈퇴에 실패했습니다.');
//                 }
//             });
//         }
//     });
});