// dm.js 파일 내용
document.addEventListener('DOMContentLoaded', () => {
    // ID를 사용하여 요소를 찾습니다.
    const chatArea = document.getElementById('chatArea'); 
    const messageInput = document.getElementById('messageInput'); 
    
    // 1. 초기 메시지 로드 (빈 상태 유지)
    scrollToBottom();

    // 2. 메시지 생성 및 추가 함수
    function appendMessage(sender, text, time) {
        const isMe = sender === 'me';
        // 'my-message-container'에 CSS로 오른쪽 정렬이 적용됩니다.
        const containerClass = isMe ? 'my-message-container' : 'other-message-container';

        const messageContainer = document.createElement('div');
        messageContainer.className = `message-container ${containerClass}`;

        const messageBubble = document.createElement('div');
        messageBubble.className = `message ${isMe ? 'my-message' : 'other-message'}`;
        messageBubble.textContent = text;
        
        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        timestamp.textContent = time;

        if (isMe) {
            // ✅ 내 메시지 정렬: messageContainer의 직계 자식으로 추가
            // CSS의 flex-direction: row-reverse와 justify-content: flex-end가 오른쪽 정렬을 보장합니다.
            messageContainer.appendChild(messageBubble);
            messageContainer.appendChild(timestamp);
            
        } else {
            // 상대방 메시지
            const messageContentGroup = document.createElement('div');
            messageContentGroup.className = 'message-content-group';

            const profileThumb = document.createElement('div');
            profileThumb.className = 'chat-profile-thumb';
            messageContainer.appendChild(profileThumb);
            
            messageContentGroup.appendChild(messageBubble);
            messageContentGroup.appendChild(timestamp);
            messageContainer.appendChild(messageContentGroup);
        }
        
        chatArea.appendChild(messageContainer);
    }
    
    // 3. 메시지 입력 및 전송 (Enter 키)
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const messageText = messageInput.value.trim();
            if (messageText) {
                const now = new Date();
                const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                
                // 내 메시지 추가 (sender: 'me'로 지정하여 오른쪽 정렬)
                appendMessage('me', messageText, time);
                
                messageInput.value = ''; 
                scrollToBottom();
            }
        }
    });

    // 4. 채팅 영역 맨 아래로 스크롤
    function scrollToBottom() {
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    // 5. 홈 버튼 기능
    window.goHome = function() {
      console.log("홈 화면 (main.html)으로 돌아갑니다.");
    }
});