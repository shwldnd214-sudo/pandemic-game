const socket = io();

// 🔥 해상도 1400x900에 맞춰 도시 간격을 널찍하게 완전 재배치
const cityPositions = {
    "샌프란시스코": { x: 140, y: 300 }, "시카고": { x: 330, y: 220 }, "몬트리올": { x: 480, y: 200 }, "뉴욕": { x: 620, y: 220 }, "애틀랜타": { x: 370, y: 360 }, "워싱턴": { x: 530, y: 330 }, 
    "런던": { x: 740, y: 200 }, "에센": { x: 860, y: 150 }, "상트페테르부르크": { x: 1020, y: 120 }, "마드리드": { x: 700, y: 360 }, "파리": { x: 820, y: 280 }, "밀라노": { x: 930, y: 240 },
    "로스앤젤레스": { x: 160, y: 480 }, "멕시코시티": { x: 300, y: 550 }, "마이매미": { x: 460, y: 490 }, "보고타": { x: 440, y: 660 }, "리마": { x: 380, y: 800 }, "산티아고": { x: 400, y: 940 }, "부에노스아이레스": { x: 580, y: 900 }, "상파울루": { x: 620, y: 730 }, 
    "라고스": { x: 800, y: 650 }, "킨샤샤": { x: 850, y: 780 }, "카르툼": { x: 960, y: 640 }, "요하네스버그": { x: 950, y: 900 },
    "알제": { x: 810, y: 450 }, "이스탄불": { x: 960, y: 380 }, "모스크바": { x: 1080, y: 240 }, "테헤란": { x: 1180, y: 320 }, "바그다드": { x: 1060, y: 460 }, "카이로": { x: 930, y: 530 }, "리야드": { x: 1040, y: 570 }, "카라치": { x: 1190, y: 530 }, "델리": { x: 1290, y: 400 }, "뭄바이": { x: 1250, y: 620 }, "첸나이": { x: 1350, y: 700 }, "콜카타": { x: 1390, y: 480 },
    "베이징": { x: 1290, y: 200 }, "서울": { x: 1430, y: 180 }, "도쿄": { x: 1510, y: 280 }, "상하이": { x: 1380, y: 300 }, 
    "방콕": { x: 1310, y: 590 }, "홍콩": { x: 1410, y: 430 }, 
    "타이베이": { x: 1490, y: 400 }, // 🔥 오사카와 완벽 분리
    "오사카": { x: 1510, y: 330 }, 
    "자카르타": { x: 1250, y: 780 }, "호치민 시티": { x: 1390, y: 760 }, "마닐라": { x: 1500, y: 560 }, "시드니": { x: 1480, y: 920 }
};

let localState = null;
let targetCity = null;

socket.on('forceReload', () => { location.reload(); });

socket.on('setupData', (data) => {
    const roleContainer = document.getElementById('role-container');
    roleContainer.innerHTML = '';
    Object.keys(data.roleDetails).forEach(roleName => {
        const info = data.roleDetails[roleName];
        const btn = document.createElement('div');
        btn.className = 'role-btn';
        btn.style.borderColor = info.color;
        btn.innerHTML = `<h3 style="color:${info.color}; margin-bottom:5px; font-size:16px;">${roleName}</h3><p style="font-size:12px; color:#cbd5e1;">${info.desc}</p>`;
        btn.onclick = () => { socket.emit('selectRole', roleName); document.getElementById('role-overlay').style.display = 'none'; };
        roleContainer.appendChild(btn);
    });
    document.getElementById('guide-roles').innerHTML = Object.keys(data.roleDetails).map(r => `<div style="margin-bottom:10px;"><strong style="color:${data.roleDetails[r].color};">${r}</strong>: ${data.roleDetails[r].desc}</div>`).join('');
    document.getElementById('guide-events').innerHTML = Object.keys(data.chanceCardGuides).map(e => `<div style="margin-bottom:10px;"><strong style="color:#d8b4fe;">${e}</strong>: ${data.chanceCardGuides[e]}</div>`).join('');
});

socket.on('update', s => { localState = s; drawLines(); render(); });

function openGuideModal() { document.getElementById('guide-modal').style.display = 'flex'; }

function drawLines() {
    const ctx = document.getElementById('map-canvas').getContext('2d');
    ctx.clearRect(0, 0, 1600, 1000); // 캔버스 초기화 사이즈 확장
    ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 3;
    for (let name in cityPositions) {
        let from = cityPositions[name];
        if(!localState.cities[name]) continue;
        localState.cities[name].neighbors.forEach(n => {
            let to = cityPositions[n];
            if(to){ ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke(); }
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

    const vaccineMap = {"#3498db":"v-blue", "#f1c40f":"v-yellow", "#7f8c8d":"v-gray", "#e74c3c":"v-red"};
    for(let color in vaccineMap) {
        const el = document.getElementById(vaccineMap[color]);
        if (localState.eradicated[color]) { el.style.opacity = "1"; el.innerText = "근절★"; el.style.border = "2px solid red"; }
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
                offset += 24; 
            }
        }
        node.innerHTML = labelHtml + cubeHtml;
        
        let pawns = Object.values(localState.players).filter(p => p.location === name);
        if(pawns.length > 0) {
            const occ = document.createElement('div'); occ.className = 'city-occupants';
            occ.innerHTML = pawns.map(p => `<span class="player-pawn" style="background:${p.roleColor}">${p.role.substring(0,2)}</span>`).join('');
            node.appendChild(occ);
        }
        node.onclick = () => { if(localState.currentTurnPlayer === socket.id) openModal(name); };
        board.appendChild(node);
    }

    const cardSec = document.getElementById('card-section');
    cardSec.innerHTML = `<h3 style="margin-bottom:10px; color:white; font-size:15px;">🃏 내 카드 (${my.cards.length}/7)</h3>` + 
        my.cards.map(c => `
            <div style="background:${c.type==='chance'?'#1e293b':c.color}; border:1px solid ${c.type==='chance'?'#9333ea':c.color}; padding:8px; margin-bottom:6px; border-radius:6px; font-size:13px; color:${c.type==='chance'?'#d8b4fe':'#000'}; font-weight:bold; display:flex; justify-content:space-between; align-items:center;">
                ${c.name} 
                <div>
                    ${c.type==='chance'? `<button onclick="useEvent('${c.name}')" style="background:#9333ea; border:none; color:white; padding:4px 8px; border-radius:4px; font-size:11px; cursor:pointer; margin-right:4px;">사용</button>` : ''}
                    <button onclick="socket.emit('discardCardManually',{cardName:'${c.name}'})" style="background:#ef4444; border:none; color:white; padding:4px 8px; border-radius:4px; font-size:11px; cursor:pointer;">버리기</button>
                </div>
            </div>
        `).join('');

    if (localState.isDiscardPhase && localState.discardPlayerId === socket.id) alert("⚠️ 손패가 7장을 초과했습니다! 카드를 버리거나 이벤트를 사용하세요.");

    document.getElementById('log-area').innerHTML = localState.log.map(l => `<div style="margin-bottom:5px; border-bottom:1px solid #334155; padding-bottom:5px;">${l}</div>`).join('');
    
    if(localState.gameOver && !window.hasAlertedGameEnd){ 
        window.hasAlertedGameEnd = true;
        alert("❌ 확산 8회 도달 또는 덱 고갈로 방역 작전에 실패했습니다..."); 
    }
    if(localState.gameWin && !window.hasAlertedGameEnd){ 
        window.hasAlertedGameEnd = true;
        alert("🎉 4가지 치료제를 모두 개발했습니다! 인류를 구원했습니다!"); 
    }
}

// 🔥 운항 관리자 동료 조종 및 합류 로직 완벽 연동
function openModal(name) { 
    targetCity = name; 
    document.getElementById('modal-city-name').innerText = name; 
    
    const gatherBtn = document.getElementById('btn-dispatcher-gather');
    if (gatherBtn && localState) {
        const my = localState.players[socket.id];
        const hasOtherPlayer = Object.values(localState.players).some(p => p.location === name && p.id !== socket.id);
        if (my.role === '운항 관리자' && hasOtherPlayer) gatherBtn.style.display = 'block';
        else gatherBtn.style.display = 'none';
    }
    document.getElementById('action-modal').style.display = 'block'; 
}

function sendAction(type) { 
    let targetPlayerId = null;
    const my = localState.players[socket.id];
    
    if (my.role === '운항 관리자') {
        let choice = prompt("누구를 이동시키겠습니까?\n1: 나 자신\n2: 동료 요원", "1");
        if (choice === "2") {
            targetPlayerId = Object.keys(localState.players).find(id => id !== socket.id);
            if (!targetPlayerId) { alert("이동시킬 동료가 아직 없습니다!"); return; }
        } else if (choice !== "1") return; // 취소 처리
    }
    socket.emit('playerAction', { type, target: targetCity, targetPlayerId }); 
    closeModal(); 
}

function closeModal() { document.getElementById('action-modal').style.display='none'; }

function treat() { 
    const my = localState.players[socket.id];
    const city = localState.cities[my.location];
    
    let activeColors = [];
    for(let col in city.cubes) { if(city.cubes[col] > 0) activeColors.push(col); }
    
    if(activeColors.length === 0) { alert("이 도시에는 치료할 질병이 없습니다."); return; }
    
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
        if(my.cards.length === 0) { alert("넘겨줄 카드가 없습니다."); return; }
        let cardList = my.cards.map(c => c.name).join(', ');
        let cardName = prompt(`동료에게 넘겨줄 도시 카드를 입력하세요.\n(내 손패: ${cardList})`);
        if(cardName) socket.emit('playerAction', {type:'share_give', cardName: cardName.trim()});
    } else alert("같은 도시에 동료가 없습니다.");
}

function useEvent(name) {
    let targetPlayerId = null;
    if(name === "정부 보조금") targetCity = prompt("연구소를 지을 도시 이름을 입력하세요:");
    else if(name === "긴급 공중 수송") { 
        targetCity = prompt("이동시킬 도시 이름을 입력하세요:"); 
        let who = prompt("누구를 보낼까요? (1: 나, 2: 동료)"); 
        if(who === "2") targetPlayerId = Object.keys(localState.players).find(id => id !== socket.id);
    } else if(name === "항체 보유자") targetCity = prompt("영구 제거할 감염 카드의 도시 이름을 입력하세요:");
    socket.emit('useChanceCard', {cardName: name, targetCity, targetPlayerId});
}