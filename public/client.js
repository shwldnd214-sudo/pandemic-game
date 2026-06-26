const socket = io();

const cityPositions = {
    "샌프란시스코": { x: 70, y: 220 }, "시카고": { x: 190, y: 160 }, "몬트리올": { x: 300, y: 140 }, "뉴욕": { x: 410, y: 160 }, "애틀랜타": { x: 210, y: 270 }, "워싱턴": { x: 320, y: 230 }, "런던": { x: 490, y: 140 }, "에센": { x: 580, y: 110 }, "상트페테르부르크": { x: 690, y: 90 }, "마드리드": { x: 460, y: 270 }, "파리": { x: 550, y: 210 }, "밀라노": { x: 630, y: 180 },
    "로스앤젤레스": { x: 70, y: 350 }, "멕시코시티": { x: 170, y: 400 }, "마이매미": { x: 290, y: 360 }, "보고타": { x: 270, y: 480 }, "리마": { x: 220, y: 580 }, "산티아고": { x: 210, y: 670 }, "부에노스아이레스": { x: 340, y: 630 }, "상파울루": { x: 380, y: 530 }, "라고스": { x: 510, y: 490 }, "킨샤샤": { x: 550, y: 570 }, "카르툼": { x: 620, y: 490 }, "요하네스버그": { x: 610, y: 650 },
    "알제": { x: 540, y: 330 }, "이스탄불": { x: 640, y: 280 }, "모스크바": { x: 730, y: 180 }, "테헤란": { x: 800, y: 240 }, "바그다드": { x: 730, y: 330 }, "카이로": { x: 620, y: 390 }, "리야드": { x: 710, y: 410 }, "카라치": { x: 820, y: 380 }, "델리": { x: 870, y: 280 }, "뭄바이": { x: 840, y: 450 }, "첸나이": { x: 910, y: 510 }, "콜카타": { x: 940, y: 350 },
    "베이징": { x: 890, y: 150 }, "서울": { x: 990, y: 130 }, "도쿄": { x: 1040, y: 200 }, "상하이": { x: 940, y: 220 }, "방콕": { x: 910, y: 430 }, "홍콩": { x: 970, y: 310 }, "타이베이": { x: 1020, y: 280 }, "오사카": { x: 1030, y: 250 }, "자카르타": { x: 850, y: 580 }, "호치민 시티": { x: 950, y: 580 }, "마닐라": { x: 1030, y: 400 }, "시드니": { x: 1010, y: 660 }
};

let localState = null;
let targetCity = null;

socket.on('forceReload', () => {
    location.reload();
});

socket.on('setupData', (data) => {
    const roleContainer = document.getElementById('role-container');
    roleContainer.innerHTML = '';
    Object.keys(data.roleDetails).forEach(roleName => {
        const info = data.roleDetails[roleName];
        const btn = document.createElement('div');
        btn.className = 'role-btn';
        btn.style.borderColor = info.color;
        btn.innerHTML = `<h3 style="color:${info.color}; margin-bottom:5px;">${roleName}</h3><p style="font-size:11px; color:#cbd5e1;">${info.desc}</p>`;
        btn.onclick = () => {
            socket.emit('selectRole', roleName);
            document.getElementById('role-overlay').style.display = 'none';
        };
        roleContainer.appendChild(btn);
    });

    document.getElementById('guide-roles').innerHTML = Object.keys(data.roleDetails).map(r => `<div style="margin-bottom:8px;"><strong style="color:${data.roleDetails[r].color};">${r}</strong>: ${data.roleDetails[r].desc}</div>`).join('');
    document.getElementById('guide-events').innerHTML = Object.keys(data.chanceCardGuides).map(e => `<div style="margin-bottom:8px;"><strong style="color:#d8b4fe;">${e}</strong>: ${data.chanceCardGuides[e]}</div>`).join('');
});

socket.on('update', s => { 
    localState = s; 
    drawLines(); 
    render(); 
});

function openGuideModal() { document.getElementById('guide-modal').style.display = 'block'; }

function drawLines() {
    const ctx = document.getElementById('map-canvas').getContext('2d');
    ctx.clearRect(0, 0, 1100, 720);
    ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 3;
    for (let name in cityPositions) {
        let from = cityPositions[name];
        if(!localState.cities[name]) continue;
        localState.cities[name].neighbors.forEach(n => {
            let to = cityPositions[n];
            if(to){ ctx.beginPath(); ctx.moveTo(from.x+22, from.y+22); ctx.lineTo(to.x+22, to.y+22); ctx.stroke(); }
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
        else if (localState.cures[color]) { el.style.opacity = "1"; el.innerText = "개발🧪"; }
    }

    for (let name in localState.cities) {
        const c = localState.cities[name]; const pos = cityPositions[name];
        const node = document.createElement('div');
        node.className = 'city-node'; node.style.left = pos.x+'px'; node.style.top = pos.y+'px';
        node.style.backgroundColor = c.color;
        if(localState.eradicated[c.color]) node.style.borderColor = "red";
        else if(localState.cures[c.color]) node.style.borderColor = "#10b981";

        let labelHtml = `<div class="city-label" style="color:${c.color}">${name}${c.hasResearchStation?'🏢':''}</div>`;
        
        // 🔥 수정: 여러 색상의 질병 배지가 중복 표시될 수 있도록 나란히 렌더링
        let cubeHtml = '';
        let offset = 0;
        for(let col in c.cubes) {
            if(c.cubes[col] > 0) {
                cubeHtml += `<div class="cube-indicator" style="background:${col}; top:-6px; right:${-10 + offset}px;">${c.cubes[col]}</div>`;
                offset += 16; 
            }
        }
        node.innerHTML = labelHtml + cubeHtml;
        
        let pawns = Object.values(localState.players).filter(p => p.location === name);
        if(pawns.length > 0) {
            const occ = document.createElement('div'); occ.className = 'city-occupants';
            occ.innerHTML = pawns.map(p => `<span class="player-pawn" style="background:${p.roleColor}">${p.role[0]}${p.role[1]}</span>`).join('');
            node.appendChild(occ);
        }
        node.onclick = () => { if(localState.currentTurnPlayer === socket.id) openModal(name); };
        board.appendChild(node);
    }

    const cardSec = document.getElementById('card-section');
    cardSec.innerHTML = `<h3 style="margin-bottom:5px;">🃏 내 카드 (${my.cards.length}/7)</h3>` + 
        my.cards.map(c => `
            <div style="background:${c.type==='chance'?'#1e293b':c.color}; border:1px solid ${c.type==='chance'?'#9333ea':c.color}; padding:6px; margin-bottom:4px; border-radius:4px; font-size:12px; color:${c.type==='chance'?'#d8b4fe':'#000'}; font-weight:bold; display:flex; justify-content:space-between; align-items:center;">
                ${c.name} 
                <div>
                    ${c.type==='chance'? `<button onclick="useEvent('${c.name}')" style="background:#9333ea; border:none; color:white; padding:3px 6px; border-radius:3px; font-size:10px; cursor:pointer; margin-right:3px;">사용</button>` : ''}
                    <button onclick="socket.emit('discardCardManually',{cardName:'${c.name}'})" style="background:#ef4444; border:none; color:white; padding:3px 6px; border-radius:3px; font-size:10px; cursor:pointer;">버리기</button>
                </div>
            </div>
        `).join('');

    if (localState.isDiscardPhase && localState.discardPlayerId === socket.id) alert("⚠️ 손패가 7장을 초과했습니다! 카드를 버리거나 이벤트를 사용하여 7장으로 맞추세요.");

    document.getElementById('log-area').innerHTML = localState.log.map(l => `<div style="margin-bottom:3px;">${l}</div>`).join('');
    
    if(localState.gameOver && !window.hasAlertedGameEnd){ 
        window.hasAlertedGameEnd = true;
        alert("❌ 확산 8회 도달 또는 덱 고갈로 방역 작전에 실패했습니다...\n확인을 누르면 모두 초기화됩니다."); 
        socket.emit('resetGame');
    }
    if(localState.gameWin && !window.hasAlertedGameEnd){ 
        window.hasAlertedGameEnd = true;
        alert("🎉 4가지 치료제를 모두 개발했습니다! 인류를 구원했습니다!\n확인을 누르면 모두 초기화됩니다."); 
        socket.emit('resetGame');
    }
}

function openModal(name) { targetCity = name; document.getElementById('modal-city-name').innerText = name; document.getElementById('action-modal').style.display='block'; }
function closeModal() { document.getElementById('action-modal').style.display='none'; }
function sendAction(type) { socket.emit('playerAction', {type, target: targetCity}); closeModal(); }

// 🔥 수정: 여러 색상이 섞여 있을 때 어떤 색을 치료할지 골라 요청하는 로직
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
        }
    }
    socket.emit('playerAction', {type:'treat', color: selectedColor}); 
}

function build() { socket.emit('playerAction', {type:'build'}); }
function cure() { socket.emit('playerAction', {type:'discoverCure'}); }

// 🔥 수정: 어떤 카드를 넘겨줄지 직접 이름으로 적어 주는 지식 공유 로직
function share() { 
    const my = localState.players[socket.id];
    const partner = Object.values(localState.players).find(p => p.id !== socket.id);
    if(partner && partner.location === my.location) {
        if(my.cards.length === 0) { alert("넘겨줄 수 있는 카드가 손패에 없습니다."); return; }
        
        let cardList = my.cards.map(c => c.name).join(', ');
        let cardName = prompt(`동료에게 넘겨줄 도시 카드 이름을 정확히 입력하세요.\n(현재 내 손패: ${cardList})\n*주의: 연구원이 아니면 현재 있는 도시의 카드만 줄 수 있습니다.`);
        
        if(cardName) {
            socket.emit('playerAction', {type:'share_give', cardName: cardName.trim()});
        }
    } else {
        alert("지식을 공유할 동료가 같은 도시에 없습니다.");
    }
}

function useEvent(name) {
    let targetPlayerId = null;
    if(name === "정부 보조금") targetCity = prompt("연구소를 지을 도시 이름을 정확히 입력하세요:");
    else if(name === "긴급 공중 수송") { 
        targetCity = prompt("이동시킬 도시 이름을 정확히 입력하세요:"); 
        let who = prompt("누구를 보낼까요? (1: 나, 2: 동료)"); 
        if(who === "2") targetPlayerId = Object.keys(localState.players).find(id => id !== socket.id);
    } else if(name === "항체 보유자") targetCity = prompt("영구 제거할 감염 카드의 도시 이름을 입력하세요:");
    socket.emit('useChanceCard', {cardName: name, targetCity, targetPlayerId});
}