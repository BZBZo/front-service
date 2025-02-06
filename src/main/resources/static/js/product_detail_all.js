let modalOpenCount = 0;
const maxModalOpens = 10;

$(document).ready(function () {
    // 페이지 로드 후 추가 작업 필요 시 여기에 작성
    console.log('상세 페이지가 로드되었습니다.');
    loadUserInfo().catch(error => console.error('Error loading user info:', error));

    // 공동구매 진행 목록 값 가져오기
    let congdongIngListValue = document.getElementById("congdongIngList")?.value || "값 없음";
    console.log("📌 공동구매 진행 목록 (input hidden 값):", congdongIngListValue);

    // 이벤트 위임 방식으로 클릭 이벤트 처리
    $('body').on('click', '.add-to-cart', function () {
        const productId = $(this).data('product-id'); // data-product-id 속성 값 가져오기
        if (!productId) {
            console.error('Product ID not found!');
            return;
        }
        console.log('Clicked productId:', productId);
        addToCart(productId); // 정확한 productId로 addToCart 호출
    });

    // '바로 구매' 버튼 클릭 이벤트
    $('body').on('click', '.order-now', function () {
        let quantity  = prompt("수량을 입력해주세요:", "1"); // 수량 입력 받기
        if (!quantity || isNaN(quantity) || quantity <= 0) {
            alert("올바른 수량을 입력해주세요.");
            return;
        }

        quantity= parseInt(quantity, 10)

        const productId = $(this).data('product-id');
        const productPrice = $(this).data('product-price');

        if (!productId || !productPrice) {
            console.error('Product information missing!');
            return;
        }

        if (!memberNo) {
            alert('사용자 정보를 불러오고 있습니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        console.log('Redirecting to purchase page with productId:', productId, 'and price:', productPrice);

        // memberNo를 포함하여 GET 요청 URL 생성
        const purchaseUrl = `/customer/purchase/direct?productId=${productId}&price=${productPrice}&memberNo=${memberNo}&quantity=${quantity}`;
        window.location.href = purchaseUrl;
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

    console.log('상세 페이지 로드됨.');

    // 공동구매 버튼 클릭 이벤트
    $('#congdongBtn').click(function () {
        // if (modalOpenCount >= maxModalOpens) {
        //     alert(`공구는 이제 열 수 없습니다! (최대 ${maxModalOpens}번 열기 가능)`);
        //     return;
        // }

        const modal = $('#congdongModal');
        const conditionString = $('#condition').val(); // condition 값 가져오기
        console.log('조건 목록 (condition):', conditionString);

        const conditionList = $('#conditionList');
        const noConditions = $('#noConditions');
        conditionList.empty();

        if (conditionString) {
            const conditions = conditionString.split(',');
            console.log('파싱된 조건 목록:', conditions);

            conditions.forEach(condition => {
                const [people, discount] = condition.replace(/{|}/g, '').split(':');
                console.log('각 조건 - 인원:', people, '할인율:', discount);

                conditionList.append(`
                    <button type="button" class="condition-item" data-condition="${condition}">
                        ${people}명 뭉치면 ${discount}% DC
                    </button>
                `);
            });

            noConditions.hide();
        } else {
            noConditions.show();
        }

        // 모달 초기화
        $('#selectedConditionDisplay').text('');
        $('#startCongdong').hide();
        $('#cancelCongdong').hide();

        modal.show();
        modalOpenCount++;

        // if (modalOpenCount > 5) {
        //     const message = modalOpenCount > 9
        //         ? `또예요? 이번이 마지막이에요. (열기 횟수: ${modalOpenCount}번)`
        //         : `또 열었어요? 이번에도 안하려구? (열기 횟수: ${modalOpenCount}번)`;
        //
        //     $('#selectedConditionDisplay').html(`<p style="color: gray; font-size: 14px;">${message}</p>`);
        // }
    });

    // 공동구매 참여 인원 정보 가져오기 (조건별로 필터링)
    function getParticipantCountForCondition(selectedPeople) {
        let rawCongdongIngList = $('#congdongIngList').val();
        console.log('🔎 [공동구매 진행 목록] congdongIngList 값:', rawCongdongIngList);

        if (!rawCongdongIngList || rawCongdongIngList.trim() === "") {
            console.log('⚠ [공동구매 진행 목록] 데이터 없음, 0 반환');
            return 0;
        }

        // `|` 기준으로 나눠서 배열로 변환
        let congdongIngArray = rawCongdongIngList.split('|');
        console.log('✅ [파싱된 공동구매 목록]:', congdongIngArray);

        // 선택한 조건에 해당하는 공동구매 데이터 필터링 (find → filter 변경)
        let matchingGroups = congdongIngArray.filter(entry => {
            let match = entry.match(/condition=\{(\d+):\d+\}/); // 정규식으로 condition 값 추출
            if (match) {
                let conditionPeople = match[1]; // 숫자 부분만 추출 (예: 10, 5, 6)
                return conditionPeople === selectedPeople; // 숫자가 일치하는지 비교
            }
            return false;
        });

        if (matchingGroups.length === 0) {
            console.log(`❌ [조건 불일치] 해당 조건(${selectedPeople})의 진행 중인 공동구매 없음`);
            return 0;
        }

        console.log('🎯 [조건 일치하는 공동구매 데이터]:', matchingGroups);

        // 모든 공동구매에서 참여자 목록을 합침 (set을 사용해서 중복 제거 가능)
        let participantsSet = new Set();

        matchingGroups.forEach(group => {
            let match = group.match(/congs=\[(.*?)\]/);
            if (match) {
                let participants = match[1].split(',').map(p => p.trim()).filter(p => p !== '');
                participants.forEach(p => participantsSet.add(p)); // 중복 방지
            }
        });

        console.log(`✔ [공동구매 참여] 조건(${selectedPeople}명)에 맞는 현재 참여 인원:`, participantsSet.size);

        return participantsSet.size; // 중복 제거된 참여자 수 반환
    }

    // 조건 클릭 이벤트 (현재 선택한 조건에 맞는 참여자 수 계산 + 버튼 텍스트 변경)
    $('#conditionList').on('click', '.condition-item', function () {
        const selectedCondition = $(this).data('condition');

        if (!selectedCondition) {
            alert('❌ 조건 데이터를 가져오지 못했습니다. 다시 시도해주세요.');
            return;
        }

        const [people, discount] = selectedCondition.replace(/{|}/g, '').split(':');

        // 현재 선택한 조건에 맞는 참여 인원 수 가져오기
        let currentParticipants = getParticipantCountForCondition(people);

        console.log('✔ [공동구매 조건 선택] 조건:', selectedCondition, '현재 참여 인원:', currentParticipants);

        $('#selectedConditionDisplay').html(`
        인원: <strong>${people}</strong>명 - 할인율: <strong>${discount}%</strong>
        <br>
        현재 참여 인원: <strong>${currentParticipants}</strong>명
    `);
        $('#selectedCondition').val(selectedCondition);

        // 공동구매 진행 여부 확인 후 버튼 변경
        let rawCongdongIngList = $('#congdongIngList').val();
        let isOngoing = false;

        if (rawCongdongIngList && rawCongdongIngList.trim() !== "") {
            let congdongIngArray = rawCongdongIngList.split('|');

            // 현재 선택한 조건에 해당하는 공동구매가 존재하는지 확인
            isOngoing = congdongIngArray.some(entry => {
                let match = entry.match(/condition=\{(\d+):\d+\}/);
                return match && match[1] === people;
            });
        }

        let actionBtn = $('#congdongActionBtn'); // 버튼 ID 변경 반영
        if (isOngoing) {
            console.log(`🎯 [공동구매 진행 중] 조건(${people}명) → "참여하기" 버튼 표시`);
            actionBtn.text("참여하기").data("action", "join").show();
        } else {
            console.log(`🚀 [공동구매 없음] 조건(${people}명) → "모집하기" 버튼 표시`);
            actionBtn.text("모집하기").data("action", "start").show();
        }

        $('#cancelCongdong').show();
    });

    // 공동구매 버튼 클릭 이벤트 (모집하기 & 참여하기)
    $('#congdongActionBtn').click(function () {  // 변경된 버튼 ID 적용
        const actionType = $(this).data("action");
        const productId = $('#productId').val();
        const selectedCondition = $('#selectedCondition').val();
        const token = localStorage.getItem('accessToken');

        if (!selectedCondition) {
            alert('공동구매 조건을 선택해주세요!');
            return;
        }

        if (actionType === "start") {
            console.log('공동구매 시작 - 상품 ID:', productId, '조건:', selectedCondition);
            $.ajax({
                type: "POST",
                url: "/product/congdong",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                data: JSON.stringify({
                    productId: productId,
                    condition: selectedCondition
                }),
                success: function (response) {
                    alert('공동구매가 성공적으로 시작되었습니다!');
                    console.log('Response:', response);
                    $('#congdongModal').hide();
                },
                error: function (xhr, status, error) {
                    alert('공동구매 시작에 실패했습니다. 다시 시도해주세요.');
                    console.error('Error:', error);
                }
            });
        } else if (actionType === "join") {
            console.log('공동구매 참여 - 상품 ID:', productId, '조건:', selectedCondition, '참여자:', memberNo);
            $.ajax({
                type: "PUT",
                url: "/product/congdong",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // 토큰만 보냄
                },
                data: JSON.stringify({
                    productId: productId,
                    condition: selectedCondition
                }),
                success: function (response) {
                    alert("공동구매 참여 완료!");
                    console.log("Response:", response);
                    $("#congdongModal").hide();
                },
                error: function (xhr, status, error) {
                    alert("공동구매 참여에 실패했습니다. 다시 시도해주세요.");
                    console.error("Error:", error);
                }
            });
        }
    });

    // 모달 닫기 버튼 클릭 이벤트
    $('#cancelCongdong').click(function () {
        $('#congdongModal').hide();
    });

    // 모달 외부 클릭 시 닫기
    $(window).click(function (event) {
        if ($(event.target).is('#congdongModal')) {
            $('#congdongModal').hide();
        }
    });

    // // "장바구니 담기" 버튼 클릭 이벤트
    // $('#addToCartBtn').click(function (e) {
    //     e.preventDefault();
    //
    //     // 제품 ID 가져오기
    //     const productId = $('#productId').val();
    //     const customerId = $('#customerId').val(); // 추가 필드가 필요합니다.
    //
    //     // JSON 데이터 생성
    //     const jsonData = JSON.stringify({
    //         "productId": productId,
    //         "customerId": customerId
    //     });
    //
    //     $.ajax({
    //         type: "POST",
    //         url: "/mypage/shoppingcart",
    //         contentType: "application/json",
    //         data: jsonData,
    //         success: function (response) {
    //             if (response.message) {
    //                 alert(response.message);
    //                 window.location.href = '/mypage/shoppingcart';
    //             }
    //         },
    //         error: function (xhr, status, error) {
    //             console.error("장바구니 추가 실패:", error);
    //             alert("상품 추가에 실패했습니다. 다시 시도해 주세요.");
    //         }
    //     });
    // });
});

document.addEventListener('DOMContentLoaded', () => {
    const categoryMap = {
        "Home": "가구가구",
        "Clothing": "옷",
        "Books": "책",
        "Toys": "장난감",
        "Electronics": "가전"
    };

    const categoryElement = document.getElementById('productCategory'); // 요소 선택
    categoryElement.textContent = categoryMap[categoryElement.textContent.trim()] || "기타";
});


function addToCart(productId) {
    const quantity = prompt("수량을 입력해주세요:", "1"); // 수량 입력 받기
    if (!quantity || isNaN(quantity) || quantity <= 0) {
        alert("올바른 수량을 입력해주세요.");
        return;
    }
    if (!memberNo) {
        alert('사용자 정보를 불러오고 있습니다. 잠시 후 다시 시도해주세요.');
        return;
    }
    console.log('Adding to cart, productId:', productId);
    console.log('Using memberNo:', memberNo);

    $.ajax({
        type: 'POST',
        url: '/customer/cart/add',
        contentType: 'application/json',
        headers: {
            'Authorization': token
        },
        data: JSON.stringify({
            productId: productId,
            memberNo: memberNo,
            quantity: parseInt(quantity, 10) // 수량 추가
        }),
        success: function (response) {
            console.log('장바구니 추가 성공:', response);
            alert('장바구니에 상품이 추가되었습니다!');
        },
        error: function (error) {
            console.error('장바구니 추가 실패:', error);
            alert('장바구니 추가 중 오류가 발생했습니다.');
        }
    });
}