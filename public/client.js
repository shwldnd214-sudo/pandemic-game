const socket = io();

const cityPositions = {
    "샌프란시스코": { x: 70, y: 240 }, "시카고": { x: 190, y: 160 }, "몬트리올": { x: 310, y: 130 }, 
    "뉴욕": { x: 440, y: 150 }, "애틀랜타": { x: 210, y: 270 }, "워싱턴": { x: 340, y: 250 }, 
    "런던": { x: 550, y: 130 }, "에센": { x: 660, y: 100 }, "상트페테르부르크": { x: 780, y: 90 }, 
    "마드리드": { x: 530, y: 290 }, "파리": { x: 630, y: 210 }, "밀라노": { x: 730, y: 170 },
    "로스앤젤레스": { x: 80, y: 360 }, "멕시코시티": { x: 180, y: 440 }, "마이매미": { x: 300, y: 380 }, 
    "보고타": { x: 290, y: 510 }, "리마": { x: 250, y: 610 }, "산티아고": { x: 200, y: 670 }, 
    "부에노스아이레스": { x: 360, y: 660 }, "상파울루": { x: 420, y: 560 },
    "라고스": { x: 600, y: 500 }, "킨샤샤": { x: 660, y: 590 }, "카르툼": { x: 750, y: 500 }, "요하네스버그": { x: 740, y: 660 },
    "알제": { x: 640, y: 350 }, "이스탄불": { x: 750, y: 280 }, "모스크바": { x: 850, y: 180 }, 
    "테헤란": { x: 940, y: 220 }, "바그다드": { x: 850, y: 330 }, "카이로": { x: 740, y: 410 }, 
    "리야드": { x: 840, y: 440 }, "카라치": { x: 950, y: 380 }, "델리": { x: 1020, y: 300 }, 
    "뭄바이": { x: 960, y: 490 }, "첸나이": { x: 1040, y: 540 }, "콜카타": { x: 1090, y: 370 },
    "베이징": { x: 1110, y: 150 }, "서울": { x: 1190, y: 120 }, "도쿄": { x: 1240, y: 180 }, 
    "상하이": { x: 1130, y: 240 }, "오사카": { x: 1230, y: 250 }, "타이베이": { x: 1210, y: 330 }, 
    "홍콩": { x: 1140, y: 340 }, "방콕": { x: 1110, y: 450 }, "마닐라": { x: 1230, y: 430 }, 
    "호치민 시티": { x: 1170, y: 530 }, "자카르타": { x: 1100, y: 610 }, "시드니": { x: 1220, y: 640 }
};

let localState = null;
let targetCity = null;

socket.on('forceReload', () => { location.reload(); });

// 🔥 1, 2. 이벤트 알림 소켓 수신 및 시각 효과 발동
socket.on('epidemicAlert', (city) => {
    const div = document.createElement('div');
    div.innerHTML = `⚠️ 전염 발생! <strong>[${city}]</strong>에 바이러스 3개가 투하되었습니다!`;
    div.style.cssText = "background:rgba(220, 38, 38, 0.95); color:white; padding:15px 30px; border-radius:8px; font-weight:bold; font-size:18px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); border: 2px solid #fca5a5; animation: slideDown 0.3s, fadeOut 1s 4s forwards;";
    document.getElementById('alert-layer').appendChild(div);
    setTimeout(() => div.remove(), 5000);
});

socket.on('outbreakAlert', (city) => {
    // 붉은 화면 번쩍!
    const flash = document.createElement('div');
    flash.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(220, 38, 38, 0.35); z-index:9998; pointer-events:none; animation: fadeOut 0.8s forwards;";
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 800);

    // 텍스트 경고창
    const div = document.createElement('div');
    div.innerHTML = `💥 <strong>${city}</strong> 연쇄 확산 (Outbreak)!`;
    div.style.cssText = "background:rgba(180, 83, 9, 0.95); color:white; padding:12px 25px; border-radius:8px; font-weight:bold; font-size:16px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); animation: slideDown 0.2s, fadeOut 1s 2.5s forwards;";
    document.getElementById('alert-layer').appendChild(div);
    setTimeout(() => div.remove(), 3500);
});

socket.on('setupData', (data) => {
    const roleContainer = document.getElementById('role-container');
    roleContainer.innerHTML = '';
    Object.keys(data.roleDetails).forEach(roleName => {
        const info = data.roleDetails[roleName];
        const btn = document.createElement('div');
        btn.className = 'role-btn';
        btn.style.borderColor = info.color;
        btn.innerHTML = `<h3 style="color:${info.color}; margin-bottom:4px; font-size:14px;">${roleName}</h3><p style="font-size:11px; color:#cbd5e1; margin:0;">${info.desc}</p>`;
        btn.onclick = () => { socket.emit('selectRole', roleName); document.getElementById('role-overlay').style.display = 'none'; };
        roleContainer.appendChild(btn);
    });
    document.getElementById('guide-roles').innerHTML = Object.keys(data.roleDetails).map(r => `<div style="margin-bottom:8px;"><strong style="color:${data.roleDetails[r].color};">${r}</strong>: ${data.roleDetails[r].desc}</div>`).join('');
    document.getElementById('guide-events').innerHTML = Object.keys(data.chanceCardGuides).map(e => `<div style="margin-bottom:8px;"><strong style="color:#d8b4fe;">${e}</strong>: ${data.chanceCardGuides[e]}</div>`).join('');
});

socket.on('update', s => { localState = s; drawLines(); render(); });

function openGuideModal() { document.getElementById('guide-modal').style.display = 'flex'; }

// 🔥 4. 선이 다른 원을 침범하지 않고 맵 바깥(태평양)으로 자연스럽게 연결되게 래핑(Wrap-around) 로직 추가
function drawLines() {
    const ctx = document.getElementById('map-canvas').getContext('2d');
    ctx.clearRect(0, 0, 1280, 720);
    ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 2.5;
    for (let name in cityPositions) {
        let from = cityPositions[name];
        if(!localState.cities[name]) continue;
        localState.cities[name].neighbors.forEach(n => {
            let to = cityPositions[n];
            if(to){
                let dx = to.x - from.x;
                if (Math.abs(dx) > 640) { // 화면 가로폭의 절반보다 멀면 맵 끝으로 연결
                    ctx.beginPath();
                    ctx.moveTo(from.x, from.y);
                    ctx.lineTo(from.x < to.x ? -50 : 1330, (from.y + to.y) / 2);
                    ctx.stroke();
                } else {
                    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
                }
            }
        });
    }
}

function render() {
    const board = document.getElementById('board');
    board.querySelectorAll('.city-node').forEach(n => n.remove());
    
    const my = localState.players[socket.id];
    if(!my) return; 

    document.getElementById('txt-role').innerText = my.role;
    document.getElementById('txt-role').style.color = my.roleColor;
    document.getElementById('txt-actions').innerText = localState.actionsLeft;
    document.getElementById('txt-outbreak').innerText = localState.outbreaks;
    document.getElementById('turn-alert').innerText = localState.currentTurnPlayer === socket.id ? "🔴 내 차례입니다!" : "⏳ 동료의 차례 대기 중...";

    // 🔥 3. 큐브 3개 위험 지역 계산 후 상단 표시
    let dangerCities = [];
    for (let name in localState.cities) {
        let c = localState.cities[name];
        for (let col in c.cubes) {
            if (c.cubes[col] === 3 && !dangerCities.includes(name)) dangerCities.push(name);
        }
    }
    const dangerBar = document.getElementById('danger-zones-bar');
    if (dangerCities.length > 0) {
        dangerBar.style.display = 'block';
        dangerBar.innerText = `🚨 확산 경보 (3큐브): ${dangerCities.join(', ')}`;
    } else {
        dangerBar.style.display = 'none';
    }

    const vaccineMap = {"#3498db":"v-blue", "#f1c40f":"v-yellow", "#7f8c8d":"v-gray", "#e74c3c":"v-red"};
    for(let color in vaccineMap) {
        const el = document.getElementById(vaccineMap[color]);
        if (localState.eradicated[color]) { el.style.opacity = "1"; el.innerText = "근절★"; el.style.border = "1px solid red"; }
        else if (localState.cures[color]) { el.style.opacity = "1"; el.innerText = "개발🧪"; el.style.border = "none"; }
    }

    for (let name in localState.cities) {
        const c = localState.cities[name]; const pos = cityPositions[name];
        const node = document.createElement('div');
        node.className = 'city-node'; node.style.left = pos.x+'px'; node.style.top = pos.y+'px';
        node.style.backgroundColor = c.color;
        if(localState.eradicated[c.color]) node.style.borderColor = "red";
        else if(localState.cures[c.color]) node.style.borderColor = "#10b981";

        let labelHtml = `<div class="city-label" style="color:${c.color}">${name}${c.hasResearchStation?'🏢':''}</div>`;
        let cubeHtml = '';
        let offset = 0;
        for(let col in c.cubes) {
            if(c.cubes[col] > 0) {
                cubeHtml += `<div class="cube-indicator" style="background:${col}; top:-8px; right:${-12 + offset}px;">${c.cubes[col]}</div>`;
                offset += 22; 
            }
        }
        node.innerHTML = labelHtml + cubeHtml;
        
        // 🔥 5. 말(Pawn)을 크고 직관적인 둥근 뱃지로 변경 (직업 첫 글자 사용)
        let pawns = Object.values(localState.players).filter(p => p.location === name);
        if(pawns.length > 0) {
            const occ = document.createElement('div'); occ.className = 'city-occupants';
            occ.innerHTML = pawns.map(p => `<span class="player-pawn" style="background:${p.roleColor}">${p.role[0]}</span>`).join('');
            node.appendChild(occ);
        }
        node.onclick = () => { if(localState.currentTurnPlayer === socket.id) openModal(name); };
        board.appendChild(node);
    }

    const cardSec = document.getElementById('card-section');
    cardSec.innerHTML = `<h3 style="margin-bottom:8px; color:white; font-size:14px; margin-top:0;">🃏 내 카드 (${my.cards.length}/7)</h3>` + 
        my.cards.map(c => `
            <div style="background:${c.type==='chance'?'#1e293b':c.color}; border:1px solid ${c.type==='chance'?'#9333ea':c.color}; padding:6px; margin-bottom:5px; border-radius:5px; font-size:12px; color:${c.type==='chance'?'#d8b4fe':'#000'}; font-weight:bold; display:flex; justify-content:space-between; align-items:center;">
                ${c.name} 
                <div>
                    ${c.type==='chance'? `<button onclick="useEvent('${c.name}')" style="background:#9333ea; border:none; color:white; padding:3px 6px; border-radius:4px; font-size:10px; cursor:pointer; margin-right:3px;">사용</button>` : ''}
                    <button onclick="socket.emit('discardCardManually',{cardName:'${c.name}'})" style="background:#ef4444; border:none; color:white; padding:3px 6px; border-radius:4px; font-size:10px; cursor:pointer;">버리기</button>
                </div>
            </div>
        `).join('');

    if (localState.isDiscardPhase && localState.discardPlayerId === socket.id) alert("⚠️ 손패가 7장을 넘었습니다! 카드를 한 장 정리해 주세요.");

    document.getElementById('log-area').innerHTML = localState.log.map(l => `<div style="margin-bottom:4px; border-bottom:1px solid #334155; padding-bottom:4px;">${l}</div>`).join('');
    
    if(localState.gameOver && !window.hasAlertedGameEnd){ 
        window.hasAlertedGameEnd = true;
        alert("❌ 전염 가속화 또는 확산 임계점 도달로 방역에 실패했습니다."); 
    }
    if(localState.gameWin && !window.hasAlertedGameEnd){ 
        window.hasAlertedGameEnd = true;
        alert("🎉 모든 질병의 백신 개발 완료! 지구를 지켜냈습니다!"); 
    }
}

function openModal(name) { 
    targetCity = name; 
    document.getElementById('modal-city-name').innerText = name + " 작전 개시"; 
    
    const my = localState.players[socket.id];
    const selectMover = document.getElementById('select-mover-target');
    const moverZone = document.getElementById('mover-selection-zone');
    
    selectMover.innerHTML = ''; 
    const optMe = document.createElement('option');
    optMe.value = socket.id;
    optMe.innerText = `1. 나 (${my.role})`;
    selectMover.appendChild(optMe);
    
    const partner = Object.values(localState.players).find(p => p.id !== socket.id);
    
    if (my.role === '운항 관리자' && partner) {
        const optPartner = document.createElement('option');
        optPartner.value = partner.id;
        optPartner.innerText = `2. 동료 (${partner.role})`;
        selectMover.appendChild(optPartner);
        moverZone.style.display = 'block'; 
    } else {
        moverZone.style.display = 'none';  
    }
    
    const gatherBtn = document.getElementById('btn-dispatcher-gather');
    if (gatherBtn) {
        const hasOtherPlayer = Object.values(localState.players).some(p => p.location === name && p.id !== socket.id);
        if (my.role === '운항 관리자' && hasOtherPlayer) gatherBtn.style.display = 'block';
        else gatherBtn.style.display = 'none';
    }
    
    // 🔥 7. 건축 전문가 특수 기지 비행 버튼 노출 로직
    const opsBtn = document.getElementById('btn-ops-expert');
    if (opsBtn) {
        if (my.role === '건축 전문가' && localState.cities[my.location].hasResearchStation && my.location !== name && my.cards.length > 0) {
            opsBtn.style.display = 'block';
        } else {
            opsBtn.style.display = 'none';
        }
    }

    document.getElementById('action-modal').style.display = 'block'; 
}

function sendAction(type) { 
    const selectMover = document.getElementById('select-mover-target');
    const targetPlayerId = selectMover.value; 
    
    socket.emit('playerAction', { type, target: targetCity, targetPlayerId }); 
    closeModal(); 
}

// 🔥 7. 건축 전문가 전용 액션 처리 함수
function sendOpsExpertMove() {
    let my = localState.players[socket.id];
    let cardList = my.cards.map(c => c.name).join(', ');
    let cardName = prompt(`버릴 카드의 이름을 정확히 적어주세요.\n(내 보유 카드: ${cardList})`);
    
    if (cardName) {
        socket.emit('playerAction', { type: 'move_ops_expert', target: targetCity, cardName: cardName.trim() });
        closeModal();
    }
}

function closeModal() { document.getElementById('action-modal').style.display='none'; }

function treat() { 
    const my = localState.players[socket.id];
    const city = localState.cities[my.location];
    let activeColors = [];
    for(let col in city.cubes) { if(city.cubes[col] > 0) activeColors.push(col); }
    if(activeColors.length === 0) { alert("치료할 수 있는 질병 큐브가 없습니다."); return; }
    
    let selectedColor = activeColors[0];
    if(activeColors.length > 1) {
        let nameMap = {"#3498db":"1. 파랑", "#f1c40f":"2. 노랑", "#7f8c8d":"3. 회색", "#e74c3c":"4. 빨강"};
        let menu = activeColors.map(c => nameMap[c]).join('\n');
        let choice = prompt(`치료할 질병 번호를 선택하세요:\n${menu}`, "1");
        if(choice) {
            let matched = activeColors.find(c => nameMap[c].startsWith(choice));
            if(matched) selectedColor = matched;
        } else return;
    }
    socket.emit('playerAction', {type:'treat', color: selectedColor}); 
}

function build() { socket.emit('playerAction', {type:'build'}); }
function cure() { socket.emit('playerAction', {type:'discoverCure'}); }

function share() { 
    const my = localState.players[socket.id];
    const partner = Object.values(localState.players).find(p => p.id !== socket.id);
    if(partner && partner.location === my.location) {
        if(my.cards.length === 0) { alert("양도할 카드가 없습니다."); return; }
        let cardList = my.cards.map(c => c.name).join(', ');
        let cardName = prompt(`동료 요원에게 인계할 도시 카드명을 정확히 적어주세요.\n(내 보유: ${cardList})`);
        if(cardName) socket.emit('playerAction', {type:'share_give', cardName: cardName.trim()});
    } else alert("동일한 대피소/도시에 동료 요원이 상주해있지 않습니다.");
}

function useEvent(name) {
    let targetPlayerId = null;
    if(name === "정부 보조금") targetCity = prompt("연구소를 무상 특설할 도시명을 기입하세요:");
    else if(name === "긴급 공중 수송") { 
        targetCity = prompt("수송할 목적지 도시명:"); 
        let who = prompt("누구를 수송 선박에 태울까요? (1: 나, 2: 동료 요원)"); 
        if(who === "2") targetPlayerId = Object.keys(localState.players).find(id => id !== socket.id);
    } else if(name === "항체 보유자") targetCity = prompt("폐기 더미에서 완전 격리할 감염 카드 도시명:");
    socket.emit('useChanceCard', {cardName: name, targetCity, targetPlayerId});
}