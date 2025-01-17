$(document).ready(() => {
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
        const token = localStorage.getItem('accessToken'); // 토큰 가져오기
        console.log('토큰 :', token);
        $.ajax({
            type: 'GET',
            url: '/product/myMarket',
            headers: {
                'Authorization': `Bearer ${token}`, // 토큰 전달
                'Content-Type': 'application/json', // 명시적 Content-Type
            },
            data: { page, size },
            success: (response) => {
                $('#boardContent').empty(); // 기존 게시글 내용 비우기
                if (response.boards.length <= 0) {
                    // 게시글이 없는 경우 메시지 출력
                    $('#boardContent').append(
                        `<tr>
                            <td colspan="5" style="text-align: center;">상품이 존재하지 않습니다.</td>
                        </tr>`
                    );
                } else {
                    // 게시글 렌더링
                    response.boards.forEach((product) => {
                        $('#boardContent').append(
                            `<tr>
                                <td>${product.id}</td>
                                <td>
                                    <img src="${product.mainPicture}" alt="${product.name}" style="max-width: 100px; max-height: 100px;" />
                                </td>
                                <td>${product.name}</td>
                                <td>${product.price.toLocaleString()} 원</td>
                                <td>${product.isCong ? '공구 가능' : '공구 없음'}</td>
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
                alert('상품 데이터를 불러오는 중 오류가 발생했습니다.');
            }
        });
    }

    // 초기화 실행
    getBoards();

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
});
