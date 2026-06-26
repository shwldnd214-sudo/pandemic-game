const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(express.static('public'));

const cityData = {
    "샌프란시스코": { color: "#3498db", neighbors: ["시카고", "로스앤젤레스", "도쿄", "마닐라"] }, "시카고": { color: "#3498db", neighbors: ["샌프란시스코", "몬트리올", "애틀랜타", "멕시코시티"] }, "몬트리올": { color: "#3498db", neighbors: ["시카고", "뉴욕", "워싱턴"] }, "뉴욕": { color: "#3498db", neighbors: ["몬트리올", "워싱턴", "런던", "마드리드"] }, "애틀랜타": { color: "#3498db", neighbors: ["시카고", "워싱턴", "마이매미"] }, "워싱턴": { color: "#3498db", neighbors: ["몬트리올", "뉴욕", "애틀랜타", "마이매미"] }, "런던": { color: "#3498db", neighbors: ["뉴욕", "마드리드", "파리", "에센"] }, "에센": { color: "#3498db", neighbors: ["런던", "파리", "밀라노", "상트페테르부르크"] }, "상트페테르부르크": { color: "#3498db", neighbors: ["에센", "모스크바", "이스탄불"] }, "마드리드": { color: "#3498db", neighbors: ["뉴욕", "런던", "파리", "알제", "상파울루"] }, "파리": { color: "#3498db", neighbors: ["런던", "마드리드", "밀라노", "에센", "알제"] }, "밀라노": { color: "#3498db", neighbors: ["파리", "에센", "이스탄불"] },
    "로스앤젤레스": { color: "#f1c40f", neighbors: ["샌프란시스코", "시카고", "멕시코시티", "시드니"] }, "멕시코시티": { color: "#f1c40f", neighbors: ["시카고", "로스앤젤레스", "마이매미", "보고타"] }, "마이매미": { color: "#f1c40f", neighbors: ["애틀랜타", "워싱턴", "멕시코시티", "보고타"] }, "보고타": { color: "#f1c40f", neighbors: ["멕시코시티", "마이매미", "리마", "상파울루"] }, "리마": { color: "#f1c40f", neighbors: ["보고타", "산티아고"] }, "산티아고": { color: "#f1c40f", neighbors: ["리마"] }, "부에노스아이레스": { color: "#f1c40f", neighbors: ["산티아고", "상파울루"] }, "상파울루": { color: "#f1c40f", neighbors: ["보고타", "부에노스아이레스", "마드리드", "라고스"] }, "라고스": { color: "#f1c40f", neighbors: ["상파울루", "킨샤샤", "카르툼"] }, "킨샤샤": { color: "#f1c40f", neighbors: ["라고스", "요하네스버그", "카르툼"] }, "카르툼": { color: "#f1c40f", neighbors: ["라고스", "킨샤샤", "요하네스버그", "카이로"] }, "요하네스버그": { color: "#f1c40f", neighbors: ["킨샤샤", "카르툼"] },
    "알제": { color: "#7f8c8d", neighbors: ["마드리드", "파리", "이스탄불", "카이로"] }, "이스탄불": { color: "#7f8c8d", neighbors: ["밀라노", "상트페테르부르크", "알제", "카이로", "바그다드"] }, "모스크바": { color: "#7f8c8d", neighbors: ["상트페테르부르크", "테헤란"] }, "테헤란": { color: "#7f8c8d", neighbors: ["모스크바", "바그다드", "카라치", "델리"] }, "바그다드": { color: "#7f8c8d", neighbors: ["이스탄불", "테헤란", "카이로", "리야드", "카라치"] }, "카이로": { color: "#7f8c8d", neighbors: ["알제", "이스탄불", "바그다드", "리야드", "카르툼"] }, "리야드": { color: "#7f8c8d", neighbors: ["카이로", "바그다드", "카라치"] }, "카라치": { color: "#7f8c8d", neighbors: ["테헤란", "바그다드", "리야드", "델리", "뭄바이"] }, "델리": { color: "#7f8c8d", neighbors: ["테헤란", "카라치", "콜카타", "뭄바이"] }, "뭄바이": { color: "#7f8c8d", neighbors: ["카라치", "델리", "첸나이"] }, "첸나이": { color: "#7f8c8d", neighbors: ["뭄바이", "콜카타", "방콕"] }, "콜카타": { color: "#7f8c8d", neighbors: ["델리", "첸나이", "방콕", "홍콩"] },
    "베이징": { color: "#e74c3c", neighbors: ["상하이", "서울"] }, "서울": { color: "#e74c3c", neighbors: ["베이징", "도쿄", "상하이"] }, "도쿄": { color: "#e74c3c", neighbors: ["서울", "상하이", "샌프란시스코"] }, "상하이": { color: "#e74c3c", neighbors: ["베이징", "서울", "도쿄", "홍콩", "타이베이"] }, "방콕": { color: "#e74c3c", neighbors: ["첸나이", "콜카타", "홍콩", "호치민 시티", "자카르타"] }, "홍콩": { color: "#e74c3c", neighbors: ["콜카타", "상하이", "타이베이", "방콕", "호치민 시티", "마닐라"] }, "타이베이": { color: "#e74c3c", neighbors: ["상하이", "홍콩", "오사카", "마닐라"] }, "오사카": { color: "#e74c3c", neighbors: ["타이베이", "도쿄"] }, "자카르타": { color: "#e74c3c", neighbors: ["방콕", "호치민 시티", "시드니"] }, "호치민 시티": { color: "#e74c3c", neighbors: ["방콕", "홍콩", "자카르타", "마닐라"] }, "마닐라": { color: "#e74c3c", neighbors: ["홍콩", "타이베이", "호치민 시티", "시드니", "샌프란시스코"] }, "시드니": { color: "#e74c3c", neighbors: ["자카르타", "마닐라", "로스앤젤레스"] }
};

const roleDetails = {
    '운항 관리자': { color: '#b45309', desc: '✈️ 다른 플레이어의 말을 움직이거나 합류시킬 수 있습니다.' },
    '건축 전문가': { color: '#a855f7', desc: '🏢 연구소 건설 시 카드가 필요 없고, 연구소에서 카드 1장 버리고 어디든 갑니다.' },
    '과학자': { color: '#22c55e', desc: '🧪 같은 색상 카드 4장만으로 치료제를 개발합니다.' },
    '위생병': { color: '#f97316', desc: '🚑 치료 시 도시의 해당 색상 모든 큐브를 제거하며, 백신 개발 시 액션 없이 치료합니다.' },
    '연구원': { color: '#d97706', desc: '🤝 같은 도시에 있다면 조건 없이 아무 도시 카드나 동료에게 줄 수 있습니다.' },
    '검역 전문가': { color: '#15803d', desc: '🛡️ 현재 위치한 도시와 인접한 도시들의 감염을 완벽히 차단합니다.' }
};

const chanceCardGuides = {
    "정부 보조금": "아무 도시에나 연구소 하나를 즉시 건설합니다.",
    "긴급 공중 수송": "본인이나 동료의 말을 원하는 도시로 즉시 이동시킵니다.",
    "평온한 하룻밤": "다음 감염 단계를 통째로 건너뜁니다.",
    "예측": "감염 카드 더미 맨 위 6장을 확인하고 원하는 순서로 재배치합니다.",
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
    let eventCards = Object.keys(chanceCardGuides).map(name => ({ name, color: "#9333ea", type: "chance" }));
    let epidemicCards = Array(4).fill(null).map(() => ({ name: "⚠️ 전염 발생", type: "epidemic" }));

    gameState.infectionDeck = shuffle([...cityNames]);
    gameState.infectionDiscard = [];
    gameState.infectionRateIndex = 0;
    gameState.infectionRate = infectionRateTrack[0];
    gameState.outbreaks = 0;

    for (let name in cityData) {
        gameState.cities[name] = { 
            color: cityData[name].color, 
            neighbors: cityData[name].neighbors, 
            cubes: { "#3498db": 0, "#f1c40f": 0, "#7f8c8d": 0, "#e74c3c": 0 }, 
            hasResearchStation: (name === "애틀랜타") 
        };
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

    gameState.playerDeck = shuffle([...basePlayerDeck, ...epidemicCards]);
    gameState.log.unshift("🎮 인류를 위한 방역 작전을 시작합니다.");
}

function checkEradication(color) {
    if (!gameState.cures[color]) return;
    let count = 0;
    for (let n in gameState.cities) count += gameState.cities[n].cubes[color];
    if (count === 0 && !gameState.eradicated[color]) {
        gameState.eradicated[color] = true;
        gameState.log.unshift(`🔥 [근절 완료] ${color} 바이러스가 지구상에서 박멸되었습니다!`);
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
        gameState.log.unshift(`⚠️ [확산] ${cityName}에서 [${diseaseColor}] 질병 연쇄 확산!! (${gameState.outbreaks}/8)`);
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
    gameState.log.unshift(`--- 작전권이 이양되었습니다. ---`);
}

io.on('connection', (socket) => {
    socket.emit('setupData', { roleDetails, chanceCardGuides });

    socket.on('resetGame', () => {
        gameState = getInitialGameState();
        io.emit('forceReload');
    });

    socket.on('selectRole', (roleName) => {
        if (!gameState.players[socket.id]) {
            gameState.players[socket.id] = { id: socket.id, role: roleName, roleColor: roleDetails[roleName].color, location: "애틀랜타", cards: [] };
            if (!gameState.currentTurnPlayer) gameState.currentTurnPlayer = socket.id;
            
            if (!gameState.gameStarted) {
                initGame();
            } else {
                for (let k = 0; k < 4; k++) {
                    if (gameState.playerDeck.length > 0) {
                        gameState.players[socket.id].cards.push(gameState.playerDeck.pop());
                    }
                }
                gameState.log.unshift(`👥 [중도 합류] ${roleName} 요원이 뒤늦게 방역 작전에 동참하여 초기 보급품을 받았습니다.`);
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

        if (card.name === "정부 보조금") gameState.cities[data.targetCity].hasResearchStation = true;
        else if (card.name === "긴급 공중 수송") gameState.players[data.targetPlayerId || socket.id].location = data.targetCity;
        else if (card.name === "평온한 하룻밤") gameState.quietNightActive = true;
        else if (card.name === "예측") {
            let top = [];
            for(let i=0; i<6; i++) if(gameState.infectionDeck.length > 0) top.push(gameState.infectionDeck.pop());
            top.reverse().forEach(c => gameState.infectionDeck.push(c));
        } else if (card.name === "항체 보유자") {
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

        // 💡 [추가 및 수정된 부분] 운항 관리자가 다른 플레이어를 조종할 수 있게 대상(mover)을 설정합니다.
        let mover = p; 
        if (p.role === '운항 관리자' && data.targetMoverId) {
            mover = gameState.players[data.targetMoverId] || p;
        }

        // 💡 [수정된 부분] 아래 이동 관련 로직에서 p.location 대신 mover.location을 사용합니다.
        if (data.type === 'move_drive' && cityData[mover.location].neighbors.includes(data.target)) { 
            mover.location = data.target; 
            gameState.actionsLeft--; 
        }
        else if (data.type === 'move_direct') {
            let idx = p.cards.findIndex(c => c.name === data.target);
            if (idx !== -1) { p.cards.splice(idx, 1); mover.location = data.target; gameState.actionsLeft--; }
        } 
        else if (data.type === 'move_charter') {
            let idx = p.cards.findIndex(c => c.name === mover.location);
            if (idx !== -1) { p.cards.splice(idx, 1); mover.location = data.target; gameState.actionsLeft--; }
        } 
        else if (data.type === 'move_shuttle' && gameState.cities[mover.location].hasResearchStation && gameState.cities[data.target].hasResearchStation) { 
            mover.location = data.target; 
            gameState.actionsLeft--; 
        }
        else if (data.type === 'build') {
            if (p.role === '건축 전문가' || p.cards.some(c => c.name === p.location)) {
                if (p.role !== '건축 전문가') p.cards.splice(p.cards.findIndex(c => c.name === p.location), 1);
                gameState.cities[p.location].hasResearchStation = true; gameState.actionsLeft--;
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
                gameState.log.unshift(`💊 [치료] ${p.role}이(가) ${p.location}에서 질병을 치료했습니다.`);
            }
        } 
        else if (data.type === 'share_give' && partner && partner.location === p.location) {
            let cardName = data.cardName;
            let idx = p.cards.findIndex(c => c.name === cardName);
            if (idx !== -1) {
                if (p.role === '연구원' || cardName === p.location) {
                    partner.cards.push(p.cards.splice(idx, 1)[0]);
                    gameState.actionsLeft--;
                    gameState.log.unshift(`🤝 [지식 공유] ${p.role}이(가) ${partner.role}에게 [${cardName}] 카드를 넘겨주었습니다.`);
                }
            }
        } 
        else if (data.type === 'discoverCure' && gameState.cities[p.location].hasResearchStation) {
            const need = (p.role === '과학자') ? 4 : 5;
            let counts = {};
            p.cards.forEach(c => { if(c.type==='city') counts[c.color] = (counts[c.color] || 0) + 1; });
            for (let col in counts) {
                if (counts[col] >= need) {
                    gameState.cures[col] = true; p.cards = p.cards.filter(c => c.color !== col || c.type !== 'city');
                    gameState.actionsLeft--; checkEradication(col);
                    if (Object.values(gameState.cures).every(v => v)) gameState.gameWin = true;
                    break;
                }
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
http.listen(PORT, () => console.log(`작전 서버 가동: ${PORT}`));