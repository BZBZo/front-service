$(document).ready(() => {

    $('#signup').prop('disabled', true);  // 초기에 가입 버튼 비활성화
    let email = $('#email').val();
    let provider = $('#provider').val();
    let validationStates = {
        businessNumberValid: false,
        shopNameValid: false,
        sellerPhoneValid: false,
        customerPhoneValid: true,
        nicknameValid: true
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
    }

    function resetCustomerInputs() {
        $('#nickname').val('');
        $('#customerPhone').val('');
    }

    function initializeSignupFormEvents() {
        $('#signupForm').on('click', '.role-button', function () {
            $('.role-button').css('background-color', '');
            $(this).css('background-color', '#4CAF50');

            let role = $(this).data('role');
            $('#role').val(role);

            if (role === 'ROLE_SELLER') {
                $('#sellerContainer').show();
                $('#customerContainer').hide();
                resetCustomerInputs();
                resetValidationStates();
                validationStates.nicknameValid = true;
                validationStates.customerPhoneValid = true;
            } else {
                $('#sellerContainer').hide();
                $('#customerContainer').show();
                resetSellerInputs();
                resetValidationStates();
                validationStates.businessNumberValid = true;
                validationStates.shopNameValid = true;
                validationStates.sellerPhoneValid = true;
            }
            updateSignupButtonState();
        });

        $('#dupliBusinessNum').click(function () {
            const businessNumber = $('#businessNumber').val();
            $.post('/webs/check/businessNumber', {businessNumber}, function (response) {
                alert(response.message);
                validationStates.businessNumberValid = response.status === "available";
                updateSignupButtonState();
            });
        });

        $('#dupliShop').click(function () {
            const shopName = $('#shopName').val();
            $.post('/webs/check/nickname', {nickname: shopName}, function (response) {
                alert(response.message);
                validationStates.shopNameValid = response.status === "available";
                updateSignupButtonState();
            });
        });

        $('#dupliNick').click(function () {
            const nickname = $('#nickname').val();
            $.post('/webs/check/nickname', {nickname}, function (response) {
                alert(response.message);
                validationStates.nicknameValid = response.status === "available";
                updateSignupButtonState();
            });
        });

        $('#dupliSellerPhone').click(function () {
            const sellerPhone = $('#sellerPhone').val();
            $.post('/webs/check/sellerPhone', {sellerPhone}, function (response) {
                alert(response.message);
                validationStates.sellerPhoneValid = response.status === "available";
                updateSignupButtonState();
            });
        });

        $('#dupliCustomerPhone').click(function () {
            const customerPhone = $('#customerPhone').val();
            $.post('/webs/check/customerPhone', {customerPhone}, function (response) {
                alert(response.message);
                validationStates.customerPhoneValid = response.status === "available";
                updateSignupButtonState();
            });
        });

        $('#businessNumber, #shopName, #nickname, #sellerPhone, #customerPhone').on('input', function () {
            const id = $(this).attr('id');
            if (id && validationStates.hasOwnProperty(id + 'Valid')) {
                validationStates[id + 'Valid'] = false;
            } else {
                // 개별 매핑
                switch (id) {
                    case 'businessNumber':
                        validationStates.businessNumberValid = false;
                        break;
                    case 'shopName':
                        validationStates.shopNameValid = false;
                        break;
                    case 'nickname':
                        validationStates.nicknameValid = false;
                        break;
                    case 'sellerPhone':
                        validationStates.sellerPhoneValid = false;
                        break;
                    case 'customerPhone':
                        validationStates.customerPhoneValid = false;
                        break;
                }
            }
            updateSignupButtonState();
        });

        $('#signup').click(() => {
            const roleValue = $('#role').val();
            if (!roleValue) {
                alert("회원 유형을 선택해주세요.");
                return;
            }

            const formData = {
                email: $('#email').val(),
                provider: $('#provider').val(),
                userRole: roleValue
            };

            if (roleValue === 'ROLE_SELLER') {
                formData.businessNumber = $('#businessNumber').val();
                formData.nickname = $('#shopName').val();
                formData.phone = $('#sellerPhone').val();
            } else if (roleValue === 'ROLE_CUSTOMER') {
                formData.nickname = $('#nickname').val();
                formData.phone = $('#customerPhone').val();
            }

            $.ajax({
                type: 'POST',
                url: '/webs/join',
                data: JSON.stringify(formData),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: function (response) {
                    alert('회원가입이 성공했습니다.\n로그인해주세요.');
                    window.location.href = response.url;
                },
                error: function (error) {
                    console.error('오류 발생:', error);
                    alert('회원가입 중 오류가 발생했습니다.');
                    window.location.href = "/webs/signin";
                }
            });
        });
    }

    // provider가 'none'이면 바로 보여주고 종료
    if (provider === 'none') {
        $('#provider').val('email');  // provider 값을 "email"로 설정
        $('#signupForm').show();
        initializeSignupFormEvents(); // 이벤트 바인딩
        return; // confirm 창 안 뜨도록 여기서 종료
    }

    // 소셜 로그인인 경우에만 회원가입 confirm 띄우기
    if (provider !== 'email') {
        let confirmMessage = `${email}로 가입된 회원이 없습니다.\n${provider} 간편 가입을 진행하시겠습니까?`;
        if (confirm(confirmMessage)) {
            $('#signupForm').show();
            initializeSignupFormEvents()
        } else {
            window.location.href = '/webs/signin';
        }
    }

    function updateSignupButtonState() {
        let allValid = Object.values(validationStates).every(status => status);
        console.log("Validation States:", validationStates, "All Valid:", allValid);
        $('#signup').prop('disabled', !allValid);
    }

    $('#cancelButton').click(function () {
        window.location.href = '/webs/signin';
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".tab");
    const sellerContainer = document.getElementById("sellerContainer");
    const customerContainer = document.getElementById("customerContainer");
    const roleInput = document.getElementById("role");

    // 불러온 provider 값에 따라 아이콘 강조
    const provider = document.getElementById("provider").value;
    const googleIcon = document.getElementById("google-icon");
    const naverIcon = document.getElementById("naver-icon");
    const kakaoIcon = document.getElementById("kakao-icon");
    const emailIcon = document.getElementById("email-signup");

    // 모든 아이콘 색상 초기화 (회색 처리용 클래스 제거)
    [googleIcon, naverIcon, kakaoIcon, emailIcon].forEach((icon) => {
            if (icon) icon.classList.remove("color");
        }
    );

    // 로그인 방식에 색상 강조
    if (provider === "google") {
        googleIcon.classList.add("color");
    } else if (provider === "naver") {
        naverIcon.classList.add("color");
    } else if (provider === "kakao") {
        kakaoIcon.classList.add("color");
    } else if (provider === "none") {
        emailIcon.classList.add("color");
    } else {
        console.log("소셜 로그인 아님 (provider: " + provider + ")");
    }

    // 기본값 설정
    const defaultRole = document.querySelector(".tab.active").dataset.role;
    roleInput.value = defaultRole;
    console.log("Default role set to:", defaultRole);

    // 탭 클릭 이벤트
    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");

            const selectedRole = tab.dataset.role;
            console.log("Role selected:", selectedRole); // 디버깅 로그
            roleInput.value = selectedRole;

            if (selectedRole === "ROLE_SELLER") {
                sellerContainer.classList.remove("hidden");
                customerContainer.classList.add("hidden");
            } else if (selectedRole === "ROLE_CUSTOMER") {
                customerContainer.classList.remove("hidden");
                sellerContainer.classList.add("hidden");
            }
        });
    });
});

