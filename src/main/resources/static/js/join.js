$(document).ready(() => {

    $('#signup').prop('disabled', true);  // 초기에 가입 버튼 비활성화
    let email = $('#email').val();
    let provider = $('#provider').val();
    let validationStates = {
        businessNumberValid: false,
        shopNameValid: false,
        sellerPhoneValid: false,
        customerPhoneValid: false,
        nicknameValid: false
    };

    function resetValidationStates() {
        validationStates.businessNumberValid = false;
        validationStates.shopNameValid = false;
        validationStates.sellerPhoneValid = false;
        validationStates.customerPhoneValid = false;
        validationStates.nicknameValid = false;
        updateSignupButtonState();
    }

    function resetSellerInputs() {
        $('#businessNumber').val('');
        $('#shopName').val('');
        $('#sellerPhone').val('');
        resetValidationStates();
    }

    function resetCustomerInputs() {
        $('#nickname').val('');
        $('#customerPhone').val('');
        resetValidationStates();
    }


    let confirmMessage = `${email}로 가입된 회원이 없습니다.\n${provider} 간편 가입을 진행하시겠습니까?`;
    if (confirm(confirmMessage)) {
        $('#signupForm').show();

        $('#signupForm').on('click', '.role-button', function() {
            $('.role-button').css('background-color', '');
            $(this).css('background-color', '#4CAF50');

            let role = $(this).data('role');
            $('#role').val(role);

            if (role === 'ROLE_SELLER') {
                $('#sellerContainer').show();
                $('#customerContainer').hide();
                resetCustomerInputs(); // 초기화 고객 입력
                validationStates.nicknameValid = true;
                validationStates.customerPhoneValid = true;
                updateSignupButtonState();
            } else {
                $('#sellerContainer').hide();
                $('#customerContainer').show();
                resetSellerInputs(); // 초기화 판매자 입력
                validationStates.businessNumberValid = true;
                validationStates.shopNameValid = true;
                validationStates.sellerPhoneValid = true;
                updateSignupButtonState();
            }

        });


        // 사업자번호 중복 검사
        $('#dupliBusinessNum').click(function() {
            var businessNumber = $('#businessNumber').val();
            console.log(businessNumber);
            $.ajax({
                url: '/webs/check/businessNumber',
                type: 'POST',
                data: { businessNumber: businessNumber },
                success: function(response) {
                    alert(response.message);
                    validationStates.businessNumberValid = response.status === "available";
                    updateSignupButtonState();
                }
            });
        });

        // 상점명 중복 검사
        $('#dupliShop').click(function() {
            var shopName = $('#shopName').val();
            $.ajax({
                url: '/webs/check/nickname',
                type: 'POST',
                data: { nickname: shopName },
                success: function(response) {
                    alert(response.message);
                    validationStates.shopNameValid = response.status === "available";
                    updateSignupButtonState();
                }
            });
        });

        // 닉네임 중복 검사
        $('#dupliNick').click(function() {
            var nickname = $('#nickname').val();
            $.ajax({
                url: '/webs/check/nickname',
                type: 'POST',
                data: { nickname: nickname },
                success: function(response) {
                    alert(response.message);
                    validationStates.nicknameValid = response.status === "available";
                    updateSignupButtonState();
                }
            });
        });

        // 판매자 전화번호 중복 검사
        $('#dupliSellerPhone').click(function() {
            var sellerPhone = $('#sellerPhone').val();
            $.ajax({
                url: '/webs/check/sellerPhone',
                type: 'POST',
                data: { sellerPhone: sellerPhone },
                success: function(response) {
                    alert(response.message);
                    validationStates.sellerPhoneValid = response.status === "available";
                    updateSignupButtonState();
                }
            });
        });

        // 구매자 전화번호 중복 검사
        $('#dupliCustomerPhone').click(function() {
            var customerPhone = $('#customerPhone').val();
            $.ajax({
                url: '/webs/check/customerPhone',
                type: 'POST',
                data: { customerPhone: customerPhone },
                success: function(response) {
                    alert(response.message);
                    validationStates.customerPhoneValid = response.status === 'available';
                    updateSignupButtonState();
                }
            });
        });

        // 입력 필드 변경 시 해당 검증 상태를 초기화
        $('#businessNumber').on('input', function() {
            validationStates.businessNumberValid = false;
            updateSignupButtonState();
        });

        $('#shopName').on('input', function() {
            validationStates.shopNameValid = false;
            updateSignupButtonState();
        });

        $('#nickname').on('input', function() {
            validationStates.nicknameValid = false;
            updateSignupButtonState();
        });

        $('#sellerPhone').on('input', function() {
            validationStates.sellerPhoneValid = false;
            updateSignupButtonState();
        });

        $('#customerPhone').on('input', function() {
            validationStates.customerPhoneValid = false;
            updateSignupButtonState();
        });

        $('#signup').click(() => {
            console.log("가입 버튼이 클릭되었습니다.");  // 테스트 로그 추가
            let formData = {
                email: email,
                provider: provider,
                role: $('#role').val()
            };

            if ($('#role').val() === 'ROLE_SELLER') {
                formData.businessNumber = $('#businessNumber').val();
                formData.nickname = $('#shopName').val();
                formData.phone = $('#sellerPhone').val();
            }

            if ($('#role').val() === 'ROLE_CUSTOMER') {
                formData.nickname = $('#nickname').val();
                formData.phone = $('#customerPhone').val();
            }

            $.ajax({
                type: 'POST',
                url: '/webs/join',
                data: JSON.stringify(formData),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: function(response) {
                    alert('회원가입이 성공했습니다.\n로그인해주세요.');
                    window.location.href = response.url;
                },
                error: function(error) {
                    console.error('오류 발생:', error);
                    alert('회원가입 중 오류가 발생했습니다.');
                    window.location.href = "/webs/join"
                }
            });
        });
    } else {
        window.location.href = '/webs/signin';
    }
    function updateSignupButtonState() {
        let allValid = Object.values(validationStates).every(status => status);
        console.log("Validation States:", validationStates, "All Valid:", allValid);
        $('#signup').prop('disabled', !allValid);
    }

    $('#cancelButton').click(function() {
        window.location.href = '/webs/signin';
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".tab");
    const sellerContainer = document.getElementById("sellerContainer");
    const customerContainer = document.getElementById("customerContainer");
    const roleInput = document.getElementById("role");

    // 탭 클릭 이벤트
    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            // 모든 탭에서 active 클래스 제거
            tabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");

            // 선택된 역할 가져오기
            const selectedRole = tab.dataset.role;
            roleInput.value = selectedRole;

            // 폼 전환 처리
            if (selectedRole === "ROLE_SELLER") {
                sellerContainer.classList.remove("hidden");
                customerContainer.classList.add("hidden");
            } else if (selectedRole === "ROLE_CUSTOMER") {
                customerContainer.classList.remove("hidden");
                sellerContainer.classList.add("hidden");
            }
        });
    });

    // 불러온 provider 값에 따라 아이콘 강조
    const provider = document.getElementById("provider").value;
    const googleIcon = document.getElementById("google-icon");
    const naverIcon = document.getElementById("naver-icon");
    const kakaoIcon = document.getElementById("kakao-icon");

    // 모든 아이콘 기본 색상 회색 처리
    [googleIcon, naverIcon, kakaoIcon].forEach((icon) =>
        icon.classList.remove("color")
    );

    // provider 값에 따라 해당 아이콘에 색상 복원
    if (provider === "google") {
        googleIcon.classList.add("color");
    } else if (provider === "naver") {
        naverIcon.classList.add("color");
    } else if (provider === "kakao") {
        kakaoIcon.classList.add("color");
    }
});

