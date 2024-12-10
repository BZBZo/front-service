// // JWT 토큰 처리 및 사용자 정보 로드
// document.addEventListener('DOMContentLoaded', async () => {
//     const token = localStorage.getItem('jwt');
//     if (!token) {
//         window.location.href = '/login';
//         return;
//     }
//
//     try {
//         const userInfo = await loadUserInfo(token);
//         displayUserInfo(userInfo);
//     } catch (error) {
//         console.error('사용자 정보 로드 실패:', error);
//     }
// });
//
// // 사용자 정보 로드 함수
// async function loadUserInfo(token) {
//     const response = await fetch('/api/user/info', {
//         headers: {
//             'Authorization': `Bearer ${token}`
//         }
//     });
//
//     if (!response.ok) {
//         throw new Error('사용자 정보 로드 실패');
//     }
//
//     return await response.json();
// }
//
// // 사용자 정보 표시 함수
// function displayUserInfo(userInfo) {
//     const customerSection = document.querySelector('.customer-section');
//     const sellerSection = document.querySelector('.seller-section');
//
//     if (userInfo.role === 'USER_SELLER') {
//         customerSection.style.display = 'none';
//         sellerSection.style.display = 'block';
//         // 판매자 정보 채우기
//         document.getElementById('shopName').value = userInfo.shopName;
//         document.getElementById('shopPhone').value = userInfo.shopPhone;
//         document.getElementById('shopIntroduction').value = userInfo.shopIntroduction;
//         document.getElementById('businessNumber').value = userInfo.businessNumber;
//     } else {
//         customerSection.style.display = 'block';
//         sellerSection.style.display = 'none';
//         // 일반 사용자 정보 채우기
//         document.getElementById('nickname').value = userInfo.nickname;
//         document.getElementById('phone').value = userInfo.phone;
//         document.getElementById('introduction').value = userInfo.introduction;
//     }
// }
//
// // 회원 탈퇴 함수
// async function withdrawMembership() {
//     if (!confirm('정말로 탈퇴하시겠습니까?')) return;
//
//     const token = localStorage.getItem('jwt');
//     try {
//         const response = await fetch('/api/user/withdraw', {
//             method: 'DELETE',
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         });
//
//         if (response.ok) {
//             localStorage.removeItem('jwt');
//             window.location.href = '/';
//         }
//     } catch (error) {
//         console.error('회원 탈퇴 실패:', error);
//     }
// }