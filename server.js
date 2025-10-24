
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());

// MySQL 연결 설정 (이미 연결된 DB 정보 입력)
const db = mysql.createConnection({
    host: 'localhost',     // 또는 다른 노트북 IP
    user: 'root',          // DB 사용자명
    password: 'password',  // DB 비밀번호
    database: 'dbname'     // DB 이름
});

db.connect((err) => {
    if (err) {
        console.error('DB 연결 실패:', err);
        return;
    }
    console.log('MySQL 연결 성공!');
});

// 로그인 API
app.post('/api/login', (req, res) => {
    const { user_id, password } = req.body;

    console.log('로그인 시도:', user_id);

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

        // 비밀번호 확인 (bcrypt 사용 시)
        try {
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ 
                    success: false, 
                    message: '아이디 또는 비밀번호가 일치하지 않습니다.' 
                });
            }
        } catch (bcryptErr) {
            // bcrypt 실패 시 평문 비교 (테스트용)
            console.log('bcrypt 비교 실패, 평문 비교 시도');
            if (password !== user.password) {
                return res.status(401).json({ 
                    success: false, 
                    message: '아이디 또는 비밀번호가 일치하지 않습니다.' 
                });
            }
        }

        // 로그인 성공
        const { password: _, ...userInfo } = user;

        res.json({ 
            success: true, 
            message: '로그인 성공!',
            user: userInfo
        });
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행중입니다.`);
});