let token = localStorage.getItem('accessToken');
if (!token.startsWith('Bearer ')) {
    token = `Bearer ${token}`; // Bearer 형식으로 변환
}

$(document).ready(function () {

    getToken()
        .then(() => {
            setupAjax();
            return loadUserInfo(); // loadUserInfo 호출
        })
        .then(() => {
            console.log('멤버 번호:', memberNo); // loadUserInfo가 완료된 이후 실행
            if (!memberNo) {
                alert('사용자 정보를 불러오고 있습니다. 잠시 후 다시 시도해주세요.');
                return;
            }
            // 장바구니 데이터 로드
            loadCartItems();
        })
        .catch(error => {
            console.error('초기화 과정에서 오류 발생:', error);
        });

    // 체크박스 전체선택
    $('#check_all').change(function () {
        const isChecked = $(this).prop('checked');
        $('.checkbox').prop('checked', isChecked);
        calculateTotalPrice();
    });

    // 개별 체크박스 변경 시
    $('#cart-content').on('change', '.checkbox', function () {
        const allChecked = $('.checkbox').length === $('.checkbox:checked').length;
        $('#check_all').prop('checked', allChecked);
        calculateTotalPrice();
    });

    // 수량 변경 시 합계 업데이트
    $('#cart-content').on('input', '.quantity-input', function () {
        const $row = $(this).closest('tr');
        const price = parseFloat($row.data('price'));
        const quantity = parseInt($(this).val(), 10) || 1;
        const total = price * quantity;
        $row.find('.total-price').text(total.toLocaleString());
        calculateTotalPrice();
    });

    // 총 주문 금액 계산
    function calculateTotalPrice() {
        let total = 0;
        $('.checkbox:checked').each(function () {
            const $row = $(this).closest('tr');
            const itemTotal = parseFloat($row.find('.total-price').text().replace(/,/g, '')) || 0;
            total += itemTotal;
        });
        $('#total-price').text(total.toLocaleString());
    }

    // 선택 삭제
    $('#delete-selected').click(function () {
        $('.checkbox:checked').closest('tr').remove();
        calculateTotalPrice();
    });

    // 선택 주문
    $('#order-selected').click(function () {
        const selectedProducts = [];
        $('.checkbox:checked').each(function () {
            const $row = $(this).closest('tr');
            selectedProducts.push({
                productId: $row.data('product-id'),
                quantity: parseInt($row.find('.quantity-input').val(), 10),
            });
        });

        if (selectedProducts.length === 0) {
            alert('주문할 상품을 선택해주세요.');
            return;
        }

        const totalAmount = parseFloat($('#total-price').text().replace(/,/g, ''));

        console.log('주문 상품:', selectedProducts);
        console.log('총 주문 금액:', totalAmount);

        const purchaseUrl = `/customer/purchase/cart?totalAmount=${totalAmount}&productList=${selectedProducts}&memberNo=${memberNo}`;
        window.location.href = purchaseUrl;


    });

});

function loadCartItems() {

    $.ajax({
        url: '/customer/cart/list/items',
        method: 'GET',
        headers: { 'Authorization': token },
        success: function (cartItems) {
            console.log('Cart items:', cartItems); // 응답 데이터 확인

            cartItems.forEach((item, index) => {
                console.log(`Item ${index + 1}:`, {
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    imagePath: item.imagePath
                });
            });

            const $cartContent = $('#cart-content');
            $cartContent.empty();

            cartItems.forEach((item, index) => {
                const price = item.price || 0; // 가격
                const quantity = item.quantity || 0; // 수량

                // 테이블 행 생성
                const row = `
                    <tr data-product-id="${item.productId}" data-price="${price}">
                        <td><input type="checkbox" class="checkbox" /></td>
                        <td>${index + 1}</td>
                        <td><img src="${item.imagePath || ''}" alt="${item.name || ''}" width="50" /></td>
                        <td>${item.name || '상품명 없음'}</td>
                        <td>${price.toLocaleString()} 원</td>
                        <td><input type="number" class="quantity-input" value="${quantity}" min="1" /></td>
                        <td class="total-price">${(price * quantity).toLocaleString()} 원</td>
                    </tr>`;
                $cartContent.append(row);
            });

            calculateTotalPrice();
        },
        error: function () {
            alert('장바구니 데이터를 불러오는데 실패했습니다.');
        }
    });
}