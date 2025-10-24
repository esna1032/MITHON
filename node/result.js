window.onload = () => {
  // localStorage에서 취미 목록 가져오기
  const hobbyListStr = localStorage.getItem("hobbyList");
  const hobbyListContainer = document.getElementById("hobby-list");
  const saveBtn = document.getElementById("saveBtn");

  if (!hobbyListStr) {
    hobbyListContainer.innerHTML = '<p>추천된 취미를 불러오지 못했습니다.</p>';
    saveBtn.style.display = 'none';
    return;
  }

  try {
    const hobbies = JSON.parse(hobbyListStr);
    
    if (!Array.isArray(hobbies) || hobbies.length === 0) {
      hobbyListContainer.innerHTML = '<p>추천된 취미가 없습니다.</p>';
      saveBtn.style.display = 'none';
      return;
    }

    // 라디오 버튼으로 취미 목록 생성
    hobbies.forEach((hobby, index) => {
      const div = document.createElement('div');
      div.className = 'hobby-item';
      
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'selectedHobby';
      radio.value = hobby;
      radio.id = `hobby${index}`;
      
      const label = document.createElement('label');
      label.htmlFor = `hobby${index}`;
      label.textContent = hobby;
      
      // 전체 div 클릭 시 라디오 선택
      div.onclick = () => {
        radio.checked = true;
      };
      
      div.appendChild(radio);
      div.appendChild(label);
      hobbyListContainer.appendChild(div);
    });

  } catch (error) {
    console.error("취미 목록 파싱 오류:", error);
    hobbyListContainer.innerHTML = '<p>취미 목록을 불러오는 중 오류가 발생했습니다.</p>';
    saveBtn.style.display = 'none';
    return;
  }

  // 저장 버튼 클릭 이벤트
  saveBtn.addEventListener('click', async () => {
    const selectedRadio = document.querySelector('input[name="selectedHobby"]:checked');
    
    if (!selectedRadio) {
      alert('취미를 선택해주세요!');
      return;
    }

    const selectedHobby = selectedRadio.value;
    
    // 로그인 확인
    const userInfo = localStorage.getItem("userInfo");
    
    if (!userInfo) {
      alert('로그인이 필요합니다.');
      window.location.href = 'login.html';
      return;
    }

    try {
      const user = JSON.parse(userInfo);
      
      saveBtn.disabled = true;
      saveBtn.textContent = '저장 중...';
      
      const response = await fetch("http://localhost:3000/api/save-hobby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user.id,
          hobby: selectedHobby
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`"${selectedHobby}" 취미가 저장되었습니다! ✅`);
        // 저장 후 메인 페이지로 이동
        window.location.href = 'main.html';
      } else {
        alert('저장 실패: ' + data.message);
        saveBtn.disabled = false;
        saveBtn.textContent = '선택한 취미 저장';
      }
    } catch (err) {
      console.error("저장 오류:", err);
      alert('서버와 연결할 수 없습니다.');
      saveBtn.disabled = false;
      saveBtn.textContent = '선택한 취미 저장';
    }
  });
};