document.addEventListener('DOMContentLoaded', () => {
    const listItems = document.querySelectorAll('.list-item');
    const detailSection = document.getElementById('detailSection');
    const detailNickname = document.getElementById('detailNickname');
    const detailHobby = document.getElementById('detailHobby');
    const detailAddress = document.getElementById('detailAddress');
    const followButtons = document.querySelectorAll('.follow-button');

    // ----------------------------------------------------
    // [현재 사용자 설정 및 거리 계산 함수]
    // ----------------------------------------------------
    // ⚠️ 취미가 같은 사람을 필터링하기 위해 현재 사용자의 취미를 가정합니다.
    const CURRENT_USER_HOBBY = "디자인 하기";
    const FILTER_RADIUS_METERS = 3000; // 3km

    // Haversine 공식을 사용한 두 좌표 간의 거리 계산 함수 (m 단위 반환)
    function getDistance(lat1, lon1, lat2, lon2) {
        if ((lat1 === lat2) && (lon1 === lon2)) return 0;
        
        const R = 6371e3; // 지구 반지름 (미터)
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c; // 거리 (미터)
    }

    // ----------------------------------------------------
    // [카카오 지도 초기화 및 필터링 로직]
    // ----------------------------------------------------
    if (window.kakao && window.kakao.maps) {
        const mapContainer = document.getElementById('map');
        const defaultPos = new kakao.maps.LatLng(37.566826, 126.9786567); 
        
        const mapOption = {
            center: defaultPos, 
            level: 7 // 초기에는 넓게 보여줍니다.
        };
        const map = new kakao.maps.Map(mapContainer, mapOption);

        // 현재 위치 마커를 표시하는 함수
        const displayMyMarker = (map, locPosition, isCurrent = false, title = "") => {
            const imageSrc = isCurrent ? 
                'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png' : // 내 위치 마커
                'https://t1.daumcdn.net/mapjsapi/images/marker.png'; // 다른 사용자 마커

            const imageSize = new kakao.maps.Size(isCurrent ? 24 : 34, isCurrent ? 35 : 39);
            const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
            
            new kakao.maps.Marker({  
                map: map, 
                position: locPosition,
                image: markerImage,
                title: title
            });
        }

        // 2. Geolocation API를 사용하여 현재 위치 가져오기 및 필터링
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const myLat = position.coords.latitude; 
                const myLon = position.coords.longitude; 
                const myLoc = new kakao.maps.LatLng(myLat, myLon);

                // 맵 중심을 내 위치로 이동 및 내 마커 표시
                map.setCenter(myLoc);
                map.setLevel(5); // 3km 범위를 고려하여 확대 레벨 설정
                displayMyMarker(map, myLoc, true, "내 위치");

                // ---------------------------------------------------
                // 3. 취미 및 거리 필터링 로직
                // ---------------------------------------------------
                listItems.forEach(item => {
                    const itemHobby = item.getAttribute('data-hobby');
                    const itemLat = parseFloat(item.getAttribute('data-lat'));
                    const itemLng = parseFloat(item.getAttribute('data-lng'));
                    const itemNickname = item.getAttribute('data-nickname');

                    if (isNaN(itemLat) || isNaN(itemLng)) return;

                    // 1단계 필터: 취미가 같은가?
                    const isSameHobby = itemHobby === CURRENT_USER_HOBBY;

                    // 2단계 필터: 3km 이내인가?
                    const distance = getDistance(myLat, myLon, itemLat, itemLng);
                    const isWithinRange = distance <= FILTER_RADIUS_METERS;
                    
                    if (isSameHobby && isWithinRange) {
                        // 취미도 같고 3km 이내인 경우 마커 표시
                        const itemLoc = new kakao.maps.LatLng(itemLat, itemLng);
                        displayMyMarker(map, itemLoc, false, itemNickname);
                        console.log(`[표시됨] ${itemNickname}: 취미 같음, 거리 ${Math.round(distance)}m`);
                    } else {
                        // 필터링된 경우
                        console.log(`[제외됨] ${itemNickname}: 취미(${itemHobby}), 거리 ${Math.round(distance)}m`);
                    }
                });
                
            }, (error) => {
                // 위치 획득 실패 시
                console.error('Geolocation failed: ', error.message);
                displayMyMarker(map, defaultPos, true, "위치 권한 거부 (기본 위치)");
            }, {
                enableHighAccuracy: true,
                maximumAge: 30000,        
                timeout: 5000             
            });
            
        } else { 
            // Geolocation API 미지원 시
            displayMyMarker(map, defaultPos, true, "Geolocation 미지원");
        }
    } else {
        console.error("Kakao Maps SDK가 로드되지 않았습니다. map.html의 appkey를 확인해 주세요.");
    }
    // ----------------------------------------------------

    // 1. 리스트 항목 클릭 이벤트 처리 (정보 표시)
    listItems.forEach(item => {
        item.addEventListener('click', (event) => {
            if (event.target.classList.contains('follow-button')) {
                return;
            }

            listItems.forEach(li => li.classList.remove('selected'));
            item.classList.add('selected');

            const nickname = item.getAttribute('data-nickname');
            const hobby = item.getAttribute('data-hobby');
            const address = item.getAttribute('data-address');

            detailNickname.textContent = nickname;
            detailHobby.textContent = hobby;
            detailAddress.textContent = address;

            detailSection.classList.remove('hidden');
        });
    });

    // 2. 팔로우 버튼 클릭 이벤트 처리 (토글 기능)
    followButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation(); 

            button.classList.toggle('followed');

            if (button.classList.contains('followed')) {
                button.textContent = '팔로우됨';
            } else {
                button.textContent = '팔로우';
            }
        });
    });
  const backButton = document.querySelector('.back-button');
  backButton.addEventListener('click', () => {
    window.location.href = 'main.html';
  });

    // 3. 초기 상태 설정
    listItems.forEach(li => li.classList.remove('selected'));
    detailSection.classList.add('hidden');
});