let memberNo = null; // 전역 변수
let token = localStorage.getItem('accessToken');

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
                resolve(); // 성공적으로 memberNo를 설정했을 때 resolve 호출
            },
            error: function () {
                alert('사용자 정보를 불러오는데 실패했습니다.');
                reject('Failed to load user info'); // 에러 발생 시 reject 호출
            }
        });
    });
}

function addToCart(productId) {
    const quantity = prompt("수량을 입력해주세요:", "1"); // 수량 입력 받기
    if (!quantity || isNaN(quantity) || quantity <= 0) {
        alert("올바른 수량을 입력해주세요.");
        return;
    }

    loadUserInfo()
        .then(() => {
            console.log('Adding to cart, productId:', productId);
            console.log('Using memberNo:', memberNo);

            $.ajax({
                type: 'POST',
                url: '/cart/add',
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
        })
        .catch((error) => {
            console.error('Error in loading user info:', error);
        });
}





$(document).ready(() => {
    const start = performance.now();

    $('body').on('click', '#check_all', function () {
        $('input[type="checkbox"].checkbox').prop('checked', $(this).is(':checked'));
    });

    //checkSession();
    getBoards();

    // 게시판 데이터 초기화 및 페이지네이션 처리
    function getBoards() {
        let currentPage = 1;
        const pageSize = 10; // 한 페이지에 보여줄 게시글 수

        // 초기 게시글 로드
        loadBoard(currentPage, pageSize);

        // 다음 페이지 버튼 클릭 이벤트
        $('#nextPage').on('click', () => {
            currentPage++;
            loadBoard(currentPage, pageSize);
        });

        // 이전 페이지 버튼 클릭 이벤트
        $('#prevPage').on('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadBoard(currentPage, pageSize);
            }
        });
    }

    // 게시판 데이터를 로드하는 함수
    function loadBoard(page, size) {
        $.ajax({
            type: 'GET',
            url: '/product/list',
            data: { page, size },
            success: (response) => {
                $('#boardContent').empty(); // 기존 게시글 내용 비우기
                if (response.boards.length <= 0) {
                    // 게시글이 없는 경우 메시지 출력
                    $('#boardContent').append(
                        `<tr>
                            <td colspan="4" style="text-align: center;">글이 존재하지 않습니다.</td>
                        </tr>`
                    );
                } else {
                    // 게시글 렌더링
                    response.boards.forEach((product) => {
                        $('#boardContent').append(
                            `<tr>
                                <td>${product.id}</td>
                                <td><img src="${product.mainPicture}" alt="${product.name}"></td>
                                <td>${product.name}</td>
                                <td>${product.price.toLocaleString()} 원</td>
                            </tr>`
                        );
                    });
                }
                // 페이지 정보 업데이트
                $('#pageInfo').text(page);

                // 이전/다음 버튼 상태 설정
                $('#prevPage').prop('disabled', page === 1);
                $('#nextPage').prop('disabled', response.last);
            },
            error: (error) => {
                console.error('오류 발생:', error);
                alert('게시판 데이터를 불러오는데 오류가 발생했습니다.');
            },
            complete: () => {
                const end = performance.now();
                console.log(`Page loaded in ${end - start} milliseconds`);
            }
        });
    }

    function updateBoard(data) {
        // 게시판 업데이트
        // 이전 및 다음 버튼 상태 업데이트
        $('#prevPage').prop('disabled', currentPage === 1);
        $('#nextPage').prop('disabled', currentPage >= data.totalPages);
    }

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


    // // 동적 이벤트 바인딩: 페이지의 어느 시점에서든지 요소가 존재하면 이벤트가 실행됩니다.
    // $('body').on('click', '#button_red', function () {
    //     let selectedProducts = $('.checkbox:checked').map(function () {
    //         return $(this).val();
    //     }).get();
    //
    //     if (selectedProducts.length === 0) {
    //         alert('삭제할 상품을 선택해 주세요.');
    //         return;
    //     }
    //
    //     if (confirm('선택한 상품을 정말 삭제하시겠습니까?')) {
    //         deleteProducts(selectedProducts);
    //     }
    // });

    // // DOM이 준비된 후 실행
    // document.addEventListener("DOMContentLoaded", () => {
    //     // 모든 '장바구니 담기' 버튼에 클릭 이벤트 추가
    //     document.querySelectorAll(".add-to-cart").forEach(button => {
    //         button.addEventListener("click", () => {
    //             const productId = button.getAttribute("data-product-id"); // 버튼에 저장된 productId 가져오기
    //             addToCart(productId); // addToCart 함수 호출
    //         });
    //     });
    // });


    // 상세보기 링크 클릭 이벤트
    $('body').on('click', '.product-detail-link', function (event) {
        event.preventDefault(); // 기본 동작 방지
        const productId = $(this).data('id');
        const token = localStorage.getItem('accessToken');

        console.log(token);

        if (!token) {
            alert('로그인이 필요합니다.');
            window.location.href = '/webs/signin';
            return;
        }

        fetch(`/product/detail/po/${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`, // 템플릿 리터럴 수정
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch product details');
                }
                return response.text(); // 서버에서 HTML 반환 시 텍스트로 처리
            })
            .then((html) => {
                history.pushState(null, '', `/product/detail/po/${productId}`); // URL 변경
                document.open();
                document.write(html);
                document.close();
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('상품 정보를 가져오는 데 실패했습니다.');
            });
    });

    // // 수량 적용 버전

    // document.addEventListener("DOMContentLoaded", () => {
    //     document.querySelectorAll(".add-to-cart").forEach(button => {
    //         button.addEventListener("click", () => {
    //             const productId = button.getAttribute("data-product-id");
    //             addToCart(productId);
    //         });
    //     });
    // });
    //
    // function decodeToken(token) {
    //     const base64Url = token.split('.')[1];
    //     const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    //     const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
    //         '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    //     ).join(''));
    //     return JSON.parse(jsonPayload);
    // }
    //
    // function addToCart(productId) {
    //     const token = localStorage.getItem('accessToken');
    //     if (!token) {
    //         alert("로그인이 필요합니다.");
    //         window.location.href = '/webs/signin';
    //         return;
    //     }
    //
    //     const decodedToken = decodeToken(token);
    //     const customerId = decodedToken.memberNo;
    //
    //     const quantity = prompt("수량을 입력해주세요:", "1");
    //     if (!quantity || isNaN(quantity) || quantity <= 0) {
    //         alert("올바른 수량을 입력해주세요.");
    //         return;
    //     }
    //
    //     $.ajax({
    //         type: 'POST',
    //         url: '/cart/add',
    //         contentType: 'application/json',
    //         headers: { 'Authorization': `Bearer ${token}` },
    //         data: JSON.stringify({
    //             customerId: customerId,
    //             productId: productId,
    //             quantity: parseInt(quantity, 10)
    //         }),
    //         success: function(response) {
    //             alert('장바구니에 상품이 추가되었습니다!');
    //         },
    //         error: function(error) {
    //             console.error('장바구니 추가 실패:', error);
    //             alert('장바구니 추가 중 오류가 발생했습니다.');
    //         }
    //     });
    // }



});

// function deleteProducts(productIds) {
//     $.ajax({
//         type: 'DELETE',
//         url: '/admin/product',
//         contentType: 'application/json',
//         data: JSON.stringify(productIds),
//         success: function (response) {
//             if (response.success) {
//                 alert(response.message); // 서버에서 보낸 메시지를 표시
//                 location.reload(); // 페이지를 다시 로드하여 업데이트된 목록을 표시
//             } else {
//                 alert(response.message); // 서버에서 보낸 실패 메시지를 표시
//             }
//         },
//         error: function (xhr, status, error) {
//             console.error('오류 발생:', error);
//             alert('상품 삭제 중 오류가 발생했습니다.');
//         }
//     });
// }

// let checkSession = () => {
//     let hUserId = $('#hiddenUserId').val();
//
//     if (hUserId == null || hUserId === '')
//         window.location.href = "/user/login";
// }