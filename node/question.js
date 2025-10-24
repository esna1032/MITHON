document.getElementById("submitBtn").addEventListener("click", async () => {
  // 입력 검증
  const q1 = document.querySelector('input[name="q1"]:checked');
  const q2 = document.querySelector('input[name="q2"]:checked');
  const q3 = document.querySelector('input[name="q3"]:checked');
  const q4 = document.querySelector('input[name="q4"]:checked');
const q5 = document.getElementById("q5").value.trim(); // textarea의 값을 가져옴

if (!q1 || !q2 || !q3 || !q4 || !q5) {
  alert("모든 질문에 답변해주세요!"); // q5가 비어있으면 경고
  return;
}

const answers = {
  q1: q1.value,
  q2: q2.value,
  q3: q3.value,
  q4: q4.value,
  q5: q5, // 사용자가 작성한 텍스트 그대로 전송
};

 

  // 로딩 표시
  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "AI가 분석 중...";

  try {
    // 서버로 전송 (Gemini API 호출)
    const res = await fetch("http://localhost:3000/api/recommend-hobby", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });

    const data = await res.json();
    
    if (data.success) {
      // ✅ 취미 배열을 localStorage에 저장
      localStorage.setItem("hobbyList", JSON.stringify(data.hobbies));
      
      // 결과 페이지로 이동
      window.location.href = "result.html";
    } else {
      alert("취미 추천을 불러오지 못했습니다: " + data.message);
      submitBtn.disabled = false;
      submitBtn.textContent = "제출";
    }
  } catch (error) {
    console.error("에러:", error);
    alert("서버와 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
    submitBtn.disabled = false;
    submitBtn.textContent = "제출";
  }
});