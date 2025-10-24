let isIdChecked = false; // ID 중복체크 완료 여부
let isIdAvailable = false; // ID 사용 가능 여부

// ID 중복 체크
async function checkId() {
  const userId = document.getElementById('userid').value.trim();
  const message = document.getElementById('idMsg');

  if (userId === "") {
    message.className = "msg error";
    message.textContent = "ID를 입력해주세요.";
    return;
  }

  if (userId.length < 4 || userId.length > 20) {
    message.className = "msg error";
    message.textContent = "ID는 4~20자여야 합니다.";
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/check-userid/${userId}`);
    const data = await response.json();

    isIdChecked = true;

    if (data.available) {
      isIdAvailable = true;
      message.className = "msg success";
      message.textContent = data.message;
    } else {
      isIdAvailable = false;
      message.className = "msg error";
      message.textContent = data.message;
    }
  } catch (error) {
    console.error('중복 체크 에러:', error);
    message.className = "msg error";
    message.textContent = "서버와 연결할 수 없습니다.";
  }
}

// ID 입력 시 중복체크 초기화
document.addEventListener('DOMContentLoaded', function() {
  const useridInput = document.getElementById('userid');
  if (useridInput) {
    useridInput.addEventListener('input', function() {
      isIdChecked = false;
      isIdAvailable = false;
      const idMsg = document.getElementById('idMsg');
      if (idMsg) {
        idMsg.textContent = "";
      }
    });
  }
});

// 회원가입 제출
async function submitForm() {
  const userId = document.getElementById('userid').value.trim();
  const name = document.getElementById('name').value.trim();
  const password = document.getElementById('password').value.trim();
  const password2 = document.getElementById('password2').value.trim();
  const email = document.getElementById('email').value.trim();
  const address = document.getElementById('address').value.trim();
  const genderInput = document.getElementById('gender').value.trim();
  const age = document.getElementById('age').value.trim();

  // 필수 입력 검사
  if (!userId || !name || !password || !password2 || !email || !address) {
    alert("모든 필수 항목을 입력해주세요!");
    return;
  }

  // ID 길이 검사
  if (userId.length < 4 || userId.length > 20) {
    alert("ID는 4~20자여야 합니다!");
    return;
  }

  // 비밀번호 길이 검사
  if (password.length < 8 || password.length > 20) {
    alert("비밀번호는 8~20자여야 합니다!");
    return;
  }

  // 비밀번호 일치 검사
  if (password !== password2) {
    alert("비밀번호가 일치하지 않습니다!");
    return;
  }

  // ID 중복 확인 검사
  if (!isIdChecked) {
    alert("ID 중복체크를 먼저 진행해주세요!");
    return;
  }

  if (!isIdAvailable) {
    alert("이미 사용 중인 ID입니다!");
    return;
  }

  // 성별 처리 (남성: 1, 여성: 0, 입력 안함: null)
  let gender = null;
  if (genderInput) {
    const genderLower = genderInput.toLowerCase();
    if (genderLower === '남' || genderLower === '남성' || genderLower === 'male' || genderLower === 'm') {
      gender = 1;
    } else if (genderLower === '여' || genderLower === '여성' || genderLower === 'female' || genderLower === 'f') {
      gender = 0;
    } else {
      alert("성별은 '남성' 또는 '여성'으로 입력해주세요!");
      return;
    }
  }

  // 나이 유효성 검사
  let ageValue = null;
  if (age) {
    ageValue = parseInt(age);
    if (isNaN(ageValue) || ageValue < 1 || ageValue > 150) {
      alert("유효한 나이를 입력해주세요!");
      return;
    }
  }

  // 이메일 형식 검사
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("올바른 이메일 형식을 입력해주세요!");
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        name: name,
        password: password,
        email: email,
        address: address,
        gender: gender,
        age: ageValue
      })
    });

    const data = await response.json();

    if (data.success) {
      alert(data.message);
      window.location.href = "login.html"; // 로그인 페이지로 이동
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('회원가입 에러:', error);
    alert("서버와 연결할 수 없습니다.");
  }
}