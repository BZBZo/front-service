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

    // DOM이 준비된 후 실행
    document.addEventListener("DOMContentLoaded", () => {
        // 모든 '장바구니 담기' 버튼에 클릭 이벤트 추가
        document.querySelectorAll(".add-to-cart").forEach(button => {
            button.addEventListener("click", () => {
                const productId = button.getAttribute("data-product-id"); // 버튼에 저장된 productId 가져오기
                addToCart(productId); // addToCart 함수 호출
            });
        });
    });

// JWT 토큰 디코딩 함수
    function decodeToken(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    }

// 장바구니 추가 함수
    function addToCart(productId) {
        const token = localStorage.getItem('accessToken'); // 저장된 토큰 가져오기
        if (!token) {
            alert("로그인이 필요한 서비스입니다.");
            window.location.href = '/webs/signin'; // 로그인 페이지로 리다이렉트
            return;
        }

        const decodedToken = decodeToken(token); // 토큰 디코딩하여 Payload 추출
        const memberNo = decodedToken.memberNo; // memberNo 추출

        if (!memberNo) {
            alert("유효하지 않은 사용자 정보입니다. 다시 로그인해주세요.");
            return;
        }

        // AJAX 요청으로 장바구니에 추가
        $.ajax({
            type: 'POST',
            url: '/cart/add', // 장바구니 추가 API 엔드포인트
            contentType: 'application/json',
            headers: {
                'Authorization': token, // Authorization 헤더에 토큰 포함
            },
            data: JSON.stringify({
                productId: productId, // 상품 ID
                memberNo: memberNo    // 사용자 ID
            }),
            success: function(response) {
                alert('장바구니에 상품이 추가되었습니다!');
            },
            error: function(error) {
                console.error('장바구니 추가 실패:', error);
                alert('장바구니 추가 중 오류가 발생했습니다.');
            }
        });
    }

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