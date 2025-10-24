// ✅ 페이지 로드 시 DB 데이터 불러와서 화면에 표시
window.addEventListener('DOMContentLoaded', () => {
  const userInfo = localStorage.getItem('userInfo');
  
  if (!userInfo) {
    alert("로그인이 필요합니다.");
    window.location.href = "login.html";
    return;
  }

  const user = JSON.parse(userInfo);
  
  // 프로필 정보 업데이트
  document.getElementById('user-id').textContent = user.user_id || '정보 없음';
  document.getElementById('user-hobby').textContent = user.hobby || '취미를 설정해주세요';
  document.getElementById('user-address').textContent = user.address || '주소 없음';
  document.getElementById('user-email').textContent = user.email || '이메일 없음';
});

// ✅ 기존 함수들 (변경하지 않음)
function goDM() {
  window.location.href = "dm.html";
}

function goHobby() {
  window.location.href = "question.html";
}

function goMate() {
  window.location.href = "map.html";
}

function logout() {
  window.location.href = "../html/login.html";
}

function unfollow(btn) {
  const follower = btn.closest('.follower');
  follower.remove();
}