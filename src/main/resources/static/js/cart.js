$(document).ready(function () {
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
        const selectedItems = [];
        $('.checkbox:checked').each(function () {
            const $row = $(this).closest('tr');
            selectedItems.push({
                productId: $row.data('product-id'),
                quantity: $row.find('.quantity-input').val()
            });
        });

        console.log('주문 상품:', selectedItems);

        // TODO: 주문 처리 AJAX 요청 추가
    });

    // 장바구니 데이터 로드
    loadCartItems();

    function loadCartItems() {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요합니다.');
            return;
        }

        $.ajax({
            url: '/cart/list',
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


});
