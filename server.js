const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(express.static('public'));

const cityData = {
    "샌프란시스코": { color: "#3498db", neighbors: ["시카고", "로스앤젤레스", "도쿄", "마닐라"] }, 
    "시카고": { color: "#3498db", neighbors: ["샌프란시스코", "로스앤젤레스", "몬트리올", "애틀랜타", "멕시코시티"] }, 
    "몬트리올": { color: "#3498db", neighbors: ["시카고", "뉴욕", "워싱턴"] }, 
    "뉴욕": { color: "#3498db", neighbors: ["몬트리올", "워싱턴", "런던", "마드리드"] }, 
    "애틀랜타": { color: "#3498db", neighbors: ["시카고", "워싱턴", "마이애미"] }, 
    "워싱턴": { color: "#3498db", neighbors: ["몬트리올", "뉴욕", "애틀랜타", "마이애미"] }, 
    "런던": { color: "#3498db", neighbors: ["뉴욕", "마드리드", "파리", "에센"] }, 
    "에센": { color: "#3498db", neighbors: ["런던", "파리", "밀라노", "상트페테르부르크"] }, 
    "상트페테르부르크": { color: "#3498db", neighbors: ["에센", "모스크바", "이스탄불"] }, 
    "마드리드": { color: "#3498db", neighbors: ["뉴욕", "런던", "파리", "알제", "상파울루"] }, 
    "파리": { color: "#3498db", neighbors: ["런던", "마드리드", "밀라노", "에센", "알제"] }, 
    "밀라노": { color: "#3498db", neighbors: ["파리", "에센", "이스탄불"] },
    "로스앤젤레스": { color: "#f1c40f", neighbors: ["샌프란시스코", "시카고", "멕시코시티", "시드니"] }, 
    "멕시코시티": { color: "#f1c40f", neighbors: ["시카고", "로스앤젤레스", "마이애미", "보고타"] }, 
    "마이애미": { color: "#f1c40f", neighbors: ["애틀랜타", "워싱턴", "멕시코시티", "보고타"] }, 
    "보고타": { color: "#f1c40f", neighbors: ["멕시코시티", "마이애미", "리마", "상파울루"] }, 
    "리마": { color: "#f1c40f", neighbors: ["보고타", "산티아고"] }, 
    "산티아고": { color: "#f1c40f", neighbors: ["리마", "부에노스아이레스"] }, 
    "부에노스아이레스": { color: "#f1c40f", neighbors: ["산티아고", "상파울루"] }, 
    "상파울루": { color: "#f1c40f", neighbors: ["보고타", "부에노스아이레스", "마드리드", "라고스"] }, 
    "라고스": { color: "#f1c40f", neighbors: ["상파울루", "킨샤샤", "카르툼"] }, 
    "킨샤샤": { color: "#f1c40f", neighbors: ["라고스", "요하네스버그", "카르툼"] }, 
    "카르툼": { color: "#f1c40f", neighbors: ["라고스", "킨샤샤", "요하네스버그", "카이로"] }, 
    "요하네스버그": { color: "#f1c40f", neighbors: ["킨샤샤", "카르툼"] },
    "알제": { color: "#7f8c8d", neighbors: ["마드리드", "파리", "이스탄불", "카이로"] }, 
    "이스탄불": { color: "#7f8c8d", neighbors: ["밀라노", "상트페테르부르크", "알제", "카이로", "바그다드"] }, 
    "모스크바": { color: "#7f8c8d", neighbors: ["상트페테르부르크", "테헤란"] }, 
    "테헤란": { color: "#7f8c8d", neighbors: ["모스크바", "바그다드", "카라치", "델리"] }, 
    "바그다드": { color: "#7f8c8d", neighbors: ["이스탄불", "테헤란", "카이로", "리야드", "카라치"] }, 
    "카이로": { color: "#7f8c8d", neighbors: ["알제", "이스탄불", "바그다드", "리야드", "카르툼"] }, 
    "리야드": { color: "#7f8c8d", neighbors: ["카이로", "바그다드", "카라치"] }, 
    "카라치": { color: "#7f8c8d", neighbors: ["테헤란", "바그다드", "리야드", "델리", "뭄바이"] }, 
    "델리": { color: "#7f8c8d", neighbors: ["테헤란", "카라치", "콜카타", "뭄바이"] }, 
    "뭄바이": { color: "#7f8c8d", neighbors: ["카라치", "델리", "첸나이"] }, 
    "첸나이": { color: "#7f8c8d", neighbors: ["뭄바이", "콜카타", "방콕"] }, 
    "콜카타": { color: "#7f8c8d", neighbors: ["델리", "첸나이", "방콕", "홍콩"] },
    "베이징": { color: "#e74c3c", neighbors: ["상하이", "서울"] }, 
    "서울": { color: "#e74c3c", neighbors: ["베이징", "도쿄", "상하이"] }, 
    "도쿄": { color: "#e74c3c", neighbors: ["서울", "상하이", "오사카", "샌프란시스코"] }, 
    "상하이": { color: "#e74c3c", neighbors: ["베이징", "서울", "도쿄", "홍콩", "타이베이"] }, 
    "방콕": { color: "#e74c3c", neighbors: ["첸나이", "콜카타", "홍콩", "호치민 시티", "자카르타"] }, 
    "홍콩": { color: "#e74c3c", neighbors: ["콜카타", "상하이", "타이베이", "방콕", "호치민 시티", "마닐라"] }, 
    "타이베이": { color: "#e74c3c", neighbors: ["상하이", "홍콩", "오사카", "마닐라"] }, 
    "오사카": { color: "#e74c3c", neighbors: ["타이베이", "도쿄"] }, 
    "자카르타": { color: "#e74c3c", neighbors: ["방콕", "호치민 시티", "시드니"] }, 
    "호치민 시티": { color: "#e74c3c", neighbors: ["방콕", "홍콩", "자카르타", "마닐라"] }, 
    "마닐라": { color: "#e74c3c", neighbors: ["홍콩", "타이베이", "호치민 시티", "시드니", "샌프란시스코"] }, 
    "시드니": { color: "#e74c3c", neighbors: ["자카르타", "마닐라", "로스앤젤레스"] }
};

const roleDetails = {
    '운항 관리자': { color: '#b45309', desc: '✈️ 동료를 조종하거나, 내 말과 동료의 말을 합류시킬 수 있습니다.' },
    '건축 전문가': { color: '#a855f7', desc: '🏢 연구소 건설 시 카드가 불필요하며, 연구소에서 아무 카드나 1장 버리고 전 세계 어디든 갑니다.' },
    '과학자': { color: '#22c55e', desc: '🧪 같은 색상 카드 4장만으로 치료제를 개발합니다.' },
    '위생병': { color: '#f97316', desc: '🚑 치료 시 도시의 해당 색상 모든 큐브를 제거하며, 백신 개발 후엔 턴 소모 없이 밟기만 해도 완치시킵니다.' },
    '연구원': { color: '#d97706', desc: '🤝 같은 도시에 있다면 조건 없이 아무 카드나 동료에게 줄 수 있습니다.' },
    '검역 전문가': { color: '#15803d', desc: '🛡️ 현재 위치한 도시와 인접한 도시들의 감염을 완벽히 차단합니다.' }
};

const chanceCardGuides = {
    "정부 보조금": "아무 도시에나 연구소 하나를 즉시 건설합니다.",
    "긴급 공중 수송": "본인이나 동료의 말을 원하는 도시로 즉시 이동시킵니다.",
    "평온한 하룻밤": "다음 감염 단계를 통째로 건너뜁니다.",
    "항체 보유자": "버린 감염 카드 중 1장을 골라 영구 제거합니다."
};

const infectionRateTrack = [2, 2, 3, 3, 4, 4];

function getInitialGameState() {
    return {
        gameStarted: false, outbreaks: 0, infectionRateIndex: 0, infectionRate: 2, actionsLeft: 4, currentTurnPlayer: null,
        cures: { "#3498db": false, "#f1c40f": false, "#7f8c8d": false, "#e74c3c": false },
        eradicated: { "#3498db": false, "#f1c40f": false, "#7f8c8d": false, "#e74c3c": false },
        cities: {}, players: {}, playerDeck: [], infectionDeck: [], infectionDiscard: [],
        gameOver: false, gameWin: false, quietNightActive: false, isDiscardPhase: false, discardPlayerId: null,
        log: ["관제소 가동 준비 중..."]
    };
}

let gameState = getInitialGameState();

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function initGame() {
    if (gameState.gameStarted) return;
    gameState.gameStarted = true;
    let cityNames = Object.keys(cityData);
    let cityCards = cityNames.map(name => ({ name, color: cityData[name].color, type: 'city' }));
    
    const chanceKeys = Object.keys(chanceCardGuides);
    let eventCards = chanceKeys.map(name => ({ name, color: "#9333ea", type: "chance" }));
    let randomDuplicate = chanceKeys[Math.floor(Math.random() * chanceKeys.length)];
    eventCards.push({ name: randomDuplicate, color: "#9333ea", type: "chance" });

    gameState.infectionDeck = shuffle([...cityNames]);
    gameState.infectionDiscard = [];
    gameState.infectionRateIndex = 0;
    gameState.infectionRate = infectionRateTrack[0];
    gameState.outbreaks = 0;

    for (let name in cityData) {
        gameState.cities[name] = { color: cityData[name].color, neighbors: cityData[name].neighbors, cubes: { "#3498db": 0, "#f1c40f": 0, "#7f8c8d": 0, "#e74c3c": 0 }, hasResearchStation: (name === "애틀랜타") };
    }

    for (let i = 3; i >= 1; i--) {
        for (let j = 0; j < 3; j++) {
            let c = gameState.infectionDeck.pop();
            let nativeColor = cityData[c].color;
            gameState.cities[c].cubes[nativeColor] = i;
            gameState.infectionDiscard.push(c);
        }
    }

    let basePlayerDeck = shuffle([...cityCards, ...eventCards]);
    for (let pId in gameState.players) {
        gameState.players[pId].cards = [];
        for (let k = 0; k < 4; k++) gameState.players[pId].cards.push(basePlayerDeck.pop());
    }

    let chunks = [[], [], [], []];
    for (let i = 0; i < basePlayerDeck.length; i++) {
        chunks[i % 4].push(basePlayerDeck[i]);
    }
    
    gameState.playerDeck = [];
    for (let i = 3; i >= 0; i--) {
        let chunk = chunks[i];
        chunk.push({ name: "⚠️ 전염 발생", type: "epidemic" }); 
        chunk = shuffle(chunk); 
        gameState.playerDeck.push(...chunk);
    }

    gameState.log.unshift("🎮 방역 작전을 시작합니다.");
}

function checkEradication(color) {
    if (!gameState.cures[color]) return;
    let count = 0;
    for (let n in gameState.cities) count += gameState.cities[n].cubes[color];
    if (count === 0 && !gameState.eradicated[color]) {
        gameState.eradicated[color] = true;
        gameState.log.unshift(`🔥 [근절 완료] 바이러스가 지구상에서 박멸되었습니다!`);
    }
}

function infectCity(cityName, diseaseColor, cubesToAdd = 1, visited = {}) {
    if (visited[cityName]) return;
    visited[cityName] = true;
    let city = gameState.cities[cityName];
    if (gameState.eradicated[diseaseColor]) return;

    for (let pId in gameState.players) {
        let q = gameState.players[pId];
        if (q.role === '검역 전문가' && (q.location === cityName || cityData[q.location].neighbors.includes(cityName))) {
            gameState.log.unshift(`🛡️ [검역 전문가] ${cityName}의 감염을 차단했습니다.`);
            return;
        }
    }

    if (city.cubes[diseaseColor] + cubesToAdd <= 3) {
        city.cubes[diseaseColor] += cubesToAdd;
    } else {
        city.cubes[diseaseColor] = 3;
        gameState.outbreaks++;
        gameState.log.unshift(`⚠️ [확산] ${cityName} 연쇄 확산!! (${gameState.outbreaks}/8)`);
        io.emit('outbreakAlert', cityName);
        
        if (gameState.outbreaks >= 8) gameState.gameOver = true;
        else city.neighbors.forEach(n => infectCity(n, diseaseColor, 1, visited));
    }
}

function triggerEpidemic() {
    gameState.log.unshift(`🚨🚨🚨 [전염 발생]`);
    if (gameState.infectionRateIndex < infectionRateTrack.length - 1) gameState.infectionRate = infectionRateTrack[++gameState.infectionRateIndex];
    if (gameState.infectionDeck.length > 0) {
        let bottom = gameState.infectionDeck.shift(); 
        gameState.infectionDiscard.push(bottom);
        infectCity(bottom, cityData[bottom].color, 3);
        io.emit('epidemicAlert', bottom);
    }
    gameState.infectionDeck = [...gameState.infectionDeck, ...shuffle([...gameState.infectionDiscard])];
    gameState.infectionDiscard = [];
}

function finishTurnPhase() {
    if (gameState.quietNightActive) {
        gameState.log.unshift(`🍃 [평온한 하룻밤] 감염 단계를 건너뜁니다.`);
        gameState.quietNightActive = false;
    } else {
        for (let i = 0; i < gameState.infectionRate; i++) {
            if (gameState.infectionDeck.length === 0) {
                gameState.infectionDeck = shuffle([...gameState.infectionDiscard]);
                gameState.infectionDiscard = [];
            }
            let target = gameState.infectionDeck.pop();
            gameState.infectionDiscard.push(target);
            infectCity(target, cityData[target].color, 1);
        }
    }
    
    const ids = Object.keys(gameState.players);
    let idx = ids.indexOf(gameState.currentTurnPlayer);
    gameState.currentTurnPlayer = ids[(idx + 1) % ids.length];
    gameState.actionsLeft = 4;
    gameState.isDiscardPhase = false;
    gameState.discardPlayerId = null;
    gameState.log.unshift(`--- 작전권 이양 ---`);

    io.emit('turnChangeAlert', { 
        id: gameState.currentTurnPlayer, 
        role: gameState.players[gameState.currentTurnPlayer].role 
    });
}

io.on('connection', (socket) => {
    socket.emit('setupData', { roleDetails, chanceCardGuides });

    socket.on('resetGame', () => { gameState = getInitialGameState(); io.emit('forceReload'); });

    socket.on('selectRole', (roleName) => {
        if (!gameState.players[socket.id]) {
            gameState.players[socket.id] = { id: socket.id, role: roleName, roleColor: roleDetails[roleName].color, location: "애틀랜타", cards: [] };
            if (!gameState.currentTurnPlayer) gameState.currentTurnPlayer = socket.id;
            
            if (!gameState.gameStarted) initGame();
            else {
                for (let k = 0; k < 4; k++) {
                    if (gameState.playerDeck.length > 0) gameState.players[socket.id].cards.push(gameState.playerDeck.pop());
                }
                gameState.log.unshift(`👥 [합류] ${roleName} 요원이 동참했습니다.`);
            }
            io.emit('update', gameState);
        }
    });

    socket.on('discardCardManually', (data) => {
        const p = gameState.players[socket.id];
        if(!p) return;
        let idx = p.cards.findIndex(c => c.name === data.cardName);
        if (idx !== -1) {
            p.cards.splice(idx, 1);
            if (p.cards.length <= 7 && gameState.isDiscardPhase) finishTurnPhase();
            io.emit('update', gameState);
        }
    });

    socket.on('useChanceCard', (data) => {
        const p = gameState.players[socket.id];
        if(!p) return;
        let idx = p.cards.findIndex(c => c.name === data.cardName);
        if (idx === -1) return;
        let card = p.cards.splice(idx, 1)[0];

        if (card.name === "정부 보조금") {
            if(cityData[data.targetCity]) gameState.cities[data.targetCity].hasResearchStation = true;
        }
        else if (card.name === "긴급 공중 수송") {
            if(cityData[data.targetCity]) gameState.players[data.targetPlayerId || socket.id].location = data.targetCity;
        }
        else if (card.name === "평온한 하룻밤") {
            gameState.quietNightActive = true;
        }
        else if (card.name === "항체 보유자") {
            let i = gameState.infectionDiscard.indexOf(data.targetCity);
            if (i !== -1) gameState.infectionDiscard.splice(i, 1);
        }
        if (p.cards.length <= 7 && gameState.isDiscardPhase) finishTurnPhase();
        io.emit('update', gameState);
    });

    socket.on('playerAction', (data) => {
        if (gameState.isDiscardPhase || !gameState.gameStarted || gameState.currentTurnPlayer !== socket.id) return;
        const p = gameState.players[socket.id];
        if(!p) return;
        let partner = Object.values(gameState.players).find(u => u.id !== socket.id);

        let targetP = p;
        if (p.role === '운항 관리자' && data.targetPlayerId) {
            targetP = gameState.players[data.targetPlayerId] || p;
        }

        let actionTaken = false;

        if (data.type === 'pass_turn') {
            gameState.actionsLeft = 0;
            actionTaken = true;
            gameState.log.unshift(`⏭️ ${p.role}이(가) 남은 행동력을 포기하고 턴을 넘겼습니다.`);
        }
        else if (data.type === 'move_drive') {
            if (cityData[targetP.location].neighbors.includes(data.target)) { 
                targetP.location = data.target; gameState.actionsLeft--; actionTaken = true; 
            }
        }
        else if (data.type === 'move_direct') {
            let idx = p.cards.findIndex(c => c.name === data.target);
            if (idx !== -1) { p.cards.splice(idx, 1); targetP.location = data.target; gameState.actionsLeft--; actionTaken = true; }
        } else if (data.type === 'move_charter') {
            let idx = p.cards.findIndex(c => c.name === targetP.location);
            if (idx !== -1) { p.cards.splice(idx, 1); targetP.location = data.target; gameState.actionsLeft--; actionTaken = true; }
        } else if (data.type === 'move_shuttle') {
            if (gameState.cities[targetP.location].hasResearchStation && gameState.cities[data.target].hasResearchStation) { 
                targetP.location = data.target; gameState.actionsLeft--; actionTaken = true; 
            }
        }
        
        // 🔥 운항 관리자 신규 합류 능력: 내 말을 동료에게 이동
        else if (data.type === 'gather_me_to_colleague' && p.role === '운항 관리자') {
            let hasOther = Object.values(gameState.players).some(u => u.location === data.target && u.id !== p.id);
            if (hasOther) {
                p.location = data.target; gameState.actionsLeft--; actionTaken = true;
                gameState.log.unshift(`✈️ [운항 관리자] 동료가 위치한 ${data.target}(으)로 이동했습니다.`);
            }
        }
        
        // 🔥 운항 관리자 신규 합류 능력: 동료를 내 위치로 호출
        else if (data.type === 'gather_colleague_to_me' && p.role === '운항 관리자') {
            let targetColleague = gameState.players[data.targetPlayerId];
            if (targetColleague && p.location === data.target) {
                targetColleague.location = data.target; gameState.actionsLeft--; actionTaken = true;
                gameState.log.unshift(`✈️ [운항 관리자] ${targetColleague.role} 요원을 내 위치(${data.target})로 호출했습니다.`);
            }
        }
        
        else if (data.type === 'move_ops_expert' && p.role === '건축 전문가') {
            if (gameState.cities[p.location].hasResearchStation && cityData[data.target]) {
                let idx = p.cards.findIndex(c => c.name === data.cardName);
                if (idx !== -1) {
                    p.cards.splice(idx, 1);
                    p.location = data.target;
                    gameState.actionsLeft--;
                    actionTaken = true;
                    gameState.log.unshift(`✈️ [건축 전문가] 특수 비행으로 ${data.target}(으)로 이동했습니다.`);
                }
            }
        }
        else if (data.type === 'build') {
            if (!gameState.cities[p.location].hasResearchStation) {
                if (p.role === '건축 전문가' || p.cards.some(c => c.name === p.location)) {
                    if (p.role !== '건축 전문가') p.cards.splice(p.cards.findIndex(c => c.name === p.location), 1);
                    gameState.cities[p.location].hasResearchStation = true; gameState.actionsLeft--; actionTaken = true;
                }
            }
        } 
        else if (data.type === 'treat') {
            let c = gameState.cities[p.location];
            let targetColor = data.color;
            if (c.cubes[targetColor] > 0) {
                if (p.role === '위생병' || gameState.cures[targetColor]) c.cubes[targetColor] = 0; 
                else c.cubes[targetColor]--;
                if (!(p.role === '위생병' && gameState.cures[targetColor])) gameState.actionsLeft--;
                checkEradication(targetColor);
                gameState.log.unshift(`💊 [치료] ${p.location}에서 질병을 치료했습니다.`);
                actionTaken = true;
            }
        } 
        else if (data.type === 'share_give' && partner && partner.location === p.location) {
            let idx = p.cards.findIndex(c => c.name === data.cardName);
            if (idx !== -1) {
                if (p.role === '연구원' || data.cardName === p.location) {
                    partner.cards.push(p.cards.splice(idx, 1)[0]);
                    gameState.actionsLeft--;
                    gameState.log.unshift(`🤝 [지식 공유] ${data.cardName} 카드를 넘겨주었습니다.`);
                    actionTaken = true;
                }
            }
        } 
        else if (data.type === 'discoverCure' && gameState.cities[p.location].hasResearchStation) {
            let col = data.color;
            if (!gameState.cures[col]) {
                gameState.cures[col] = true;
                if (data.cardsToUse && data.cardsToUse.length > 0) {
                    data.cardsToUse.forEach(cardName => {
                        let idx = p.cards.findIndex(c => c.name === cardName);
                        if (idx !== -1) p.cards.splice(idx, 1);
                    });
                }
                gameState.actionsLeft--; checkEradication(col);
                if (Object.values(gameState.cures).every(v => v)) gameState.gameWin = true;
                gameState.log.unshift(`🧪 [백신 개발] ${p.role}이(가) 백신을 개발했습니다!`);
                actionTaken = true;
            }
        }

        if (!actionTaken) {
            if (data.type.startsWith('move')) socket.emit('systemAlert', '이동할 수 없는 경로이거나 카드/연구소 등의 조건이 맞지 않습니다.');
            else if (data.type === 'build') socket.emit('systemAlert', '해당 도시 카드가 없거나 이미 연구소가 있습니다.');
            else if (data.type === 'share_give') socket.emit('systemAlert', '해당 도시 카드가 없거나 동료가 같은 위치에 없습니다.');
            return; 
        }

        let medic = Object.values(gameState.players).find(u => u.role === '위생병');
        if (medic) {
            let city = gameState.cities[medic.location];
            let clearedAny = false;
            for (let col in city.cubes) {
                if (city.cubes[col] > 0 && gameState.cures[col]) {
                    city.cubes[col] = 0;
                    checkEradication(col);
                    clearedAny = true;
                }
            }
            if (clearedAny) {
                gameState.log.unshift(`🚑 [위생병 자동 소독] ${medic.location}의 개발 완료된 질병이 턴 소모 없이 즉시 제거되었습니다!`);
            }
        }

        if (gameState.actionsLeft === 0) {
            for (let k = 0; k < 2; k++) {
                if (gameState.playerDeck.length > 0) {
                    let drawn = gameState.playerDeck.pop();
                    if (drawn.type === 'epidemic') triggerEpidemic(); else p.cards.push(drawn);
                } else gameState.gameOver = true;
            }
            if (p.cards.length > 7) { gameState.isDiscardPhase = true; gameState.discardPlayerId = socket.id; }
            else finishTurnPhase();
        }
        io.emit('update', gameState);
    });
});

const PORT = process.env.PORT || 3050;
http.listen(PORT, () => console.log(`작전 통제 서버 러닝 중: ${PORT}`));