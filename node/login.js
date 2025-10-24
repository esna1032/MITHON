async function login() {
    const userid = document.getElementById("userid").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("error-message");
    const loginBtn = document.getElementById("loginBtn");

    // 입력 검증
    if (!userid || !password) {
    errorMsg.textContent = "아이디와 비밀번호를 입력해주세요.";
    errorMsg.style.display = "block";
    return;
    }

    // 버튼 비활성화
    loginBtn.disabled = true;
    loginBtn.textContent = "로그인 중...";
    errorMsg.style.display = "none";

    try {
    const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        user_id: userid,
        password: password
        })
    });

    const data = await response.json();

    if (data.success) {
        // 로그인 성공
        alert(data.message);
        // 사용자 정보 저장 (선택사항)
        localStorage.setItem('user', JSON.stringify(data.user));
        // 메인 페이지로 이동
        window.location.href = "main2.html";
    } else {
        // 로그인 실패
        errorMsg.textContent = data.message;
        errorMsg.style.display = "block";
    }
    } catch (error) {
    console.error('로그인 에러:', error);
    errorMsg.textContent = "서버와 연결할 수 없습니다.";
    errorMsg.style.display = "block";
    } finally {
    // 버튼 다시 활성화
    loginBtn.disabled = false;
    loginBtn.textContent = "로그인";
    }
}

// Enter 키로 로그인
document.getElementById("password").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
    login();
    }
});