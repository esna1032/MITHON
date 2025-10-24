const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const PORT = 3000;

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());

// MySQL 연결 설정
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '2008ksj!',
    database: 'matchmood'
});

db.connect((err) => {
    if (err) {
        console.error('DB 연결 실패:', err);
        return;
    }
    console.log('MySQL 연결 성공!');
});

// ID 중복 체크 API
app.get('/api/check-userid/:user_id', (req, res) => {
    const { user_id } = req.params;

    if (!user_id || user_id.length < 4 || user_id.length > 20) {
        return res.json({
            available: false,
            message: 'ID는 4~20자여야 합니다.'
        });
    }

    const query = 'SELECT id FROM users WHERE user_id = ?';
    db.query(query, [user_id], (err, results) => {
        if (err) {
            console.error('중복 체크 에러:', err);
            return res.status(500).json({
                available: false,
                message: '확인 중 오류가 발생했습니다.'
            });
        }

        if (results.length > 0) {
            res.json({
                available: false,
                message: '중복이 있습니다.'
            });
        } else {
            res.json({
                available: true,
                message: '사용 가능한 ID입니다.'
            });
        }
    });
});

// 회원가입 API
app.post('/api/register', async (req, res) => {
  const { user_id, name, password, email, address, gender, age } = req.body;

  // 필수 입력 검사
  if (!user_id || !name || !password || !email || !address) {
    return res.status(400).json({
      success: false,
      message: '모든 필수 항목을 입력해주세요.'
    });
  }

  // ID 길이 검사
  if (user_id.length < 4 || user_id.length > 20) {
    return res.status(400).json({
      success: false,
      message: 'ID는 4~20자여야 합니다.'
    });
  }

  // 비밀번호 길이 검사
  if (password.length < 8 || password.length > 20) {
    return res.status(400).json({
      success: false,
      message: '비밀번호는 8~20자여야 합니다.'
    });
  }

  // 나이 유효성 검사
  if (age !== null && age !== undefined) {
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 150) {
      return res.status(400).json({
        success: false,
        message: '유효한 나이를 입력해주세요.'
      });
    }
  }

  try {
    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // DB에 저장
    const query = `
      INSERT INTO users (user_id, password, gender, age, email, hobby, address, user_img)
      VALUES (?, ?, ?, ?, ?, NULL, ?, NULL)
    `;

    db.query(
      query,
      [
        user_id, 
        hashedPassword, 
        gender !== null && gender !== undefined ? gender : null, 
        age !== null && age !== undefined ? parseInt(age) : null, 
        email, 
        address
      ],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
              success: false,
              message: '이미 사용 중인 ID입니다.'
            });
          }
          console.error('회원가입 에러:', err);
          return res.status(500).json({
            success: false,
            message: '회원가입 중 오류가 발생했습니다.'
          });
        }

        res.status(201).json({
          success: true,
          message: '가입이 완료되었습니다!',
          userId: result.insertId
        });
      }
    );
  } catch (error) {
    console.error('서버 에러:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 로그인 API
app.post('/api/login', (req, res) => {
    const { user_id, password } = req.body;

    if (!user_id || !password) {
        return res.status(400).json({
            success: false,
            message: '아이디와 비밀번호를 입력해주세요.'
        });
    }

    const query = 'SELECT * FROM users WHERE user_id = ?';
    db.query(query, [user_id], async (err, results) => {
        if (err) {
            console.error('DB 조회 에러:', err);
            return res.status(500).json({
                success: false,
                message: '로그인 중 오류가 발생했습니다.'
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: '아이디 또는 비밀번호가 일치하지 않습니다.'
            });
        }

        const user = results[0];

        try {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: '아이디 또는 비밀번호가 일치하지 않습니다.'
                });
            }
        } catch (bcryptErr) {
            if (password !== user.password) {
                return res.status(401).json({
                    success: false,
                    message: '아이디 또는 비밀번호가 일치하지 않습니다.'
                });
            }
        }

        const { password: _, ...userInfo } = user;

        res.json({
            success: true,
            message: '로그인 성공!',
            user: userInfo
        });
    });
});

// ---------------- Gemini API를 이용한 취미 추천 ----------------
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/recommend-hobby", async (req, res) => {
  try {
    const { answers } = req.body;

    console.log("받은 데이터:", answers);

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({
        success: false,
        message: "유효하지 않은 입력입니다.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("⚠️ GEMINI_API_KEY가 설정되지 않았습니다!");
      return res.status(500).json({
        success: false,
        message: "서버 설정 오류입니다.",
      });
    }

    // ✅ 프롬프트 수정 - 간단한 목록만 요청
    const userText = `
    [성격 검사 결과]
    1번 (사람들과 함께 있을 때 에너지가 생기는가): ${answers.q1}
    2번 (전체적인 흐름에 관심이 가는가): ${answers.q2}
    3번 (논리를 우선시하는가): ${answers.q3}
    4번 (계획을 세우면 안정감을 느끼는가): ${answers.q4}
    5번 (가장 편안함을 느끼는 상황): ${answers.q5}

    위 성격에 맞는 취미 활동 5가지를 추천해줘.
    설명 없이 취미 이름만 한 줄씩 나열해줘.
    
    예시 형식:
    독서
    요가
    사진 촬영
    등산
    드로잉
    `;

    console.log("Gemini API 호출 시작...");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(userText);
    const hobbyText = result.response.text();

    // 줄바꿈으로 구분하여 배열로 변환 (빈 줄 제거)
    const hobbies = hobbyText
      .split('\n')
      .map(h => h.trim())
      .filter(h => h.length > 0);

    console.log("✅ Gemini 응답 성공:", hobbies);

    res.json({
      success: true,
      hobbies: hobbies // 배열로 반환
    });
  } catch (error) {
    console.error("❌ Gemini API 오류:", error.message);
    
    res.status(500).json({
      success: false,
      message: "취미 추천 생성 중 오류가 발생했습니다.",
    });
  }
});

// 취미 추천 결과를 DB에 저장 (users 테이블의 hobby 필드에 저장)
app.post("/api/save-hobby", (req, res) => {
  const { userId, hobby } = req.body;

  if (!userId || !hobby) {
    return res.status(400).json({ 
      success: false, 
      message: "사용자 ID와 취미 정보가 필요합니다." 
    });
  }

  // users 테이블의 hobby 필드 업데이트
  const sql = "UPDATE users SET hobby = ? WHERE id = ?";
  
  db.query(sql, [hobby, userId], (err, result) => {
    if (err) {
      console.error("DB 저장 오류:", err);
      return res.status(500).json({ 
        success: false, 
        message: "DB 저장 중 오류가 발생했습니다." 
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "사용자를 찾을 수 없습니다." 
      });
    }

    res.json({ 
      success: true, 
      message: "취미가 성공적으로 저장되었습니다." 
    });
  });
});



// 서버 시작
app.listen(PORT, () => {
    console.log(`✅ 서버가 http://localhost:${PORT} 에서 실행중입니다.`);
});