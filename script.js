async function loadData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();

        // Função auxiliar para popular o filtro de meses
        populateMonthFilter(data.stats);

        const top10 = aggregatePoints(data.stats).sort((a, b) => b.pontos - a.pontos).slice(0, 10);
        updateTable(top10);

        document.getElementById('filterButton').addEventListener('click', () => {
            const selectedMonth = document.getElementById('monthFilter').value;
            filterByMonth(data.stats, selectedMonth);
        });

        document.getElementById('last4MonthsButton').addEventListener('click', () => {
            calculateLast4Months(data.stats);
        });

    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
    }
}

// Função para popular o filtro de meses
function populateMonthFilter(data) {
    const monthFilter = document.getElementById('monthFilter');

    const months = new Set();

    data.forEach(person => {
        const activityDate = new Date(person.dataAtividade.split('-').reverse().join('-'));
        const monthYear = `${activityDate.getFullYear()}-${String(activityDate.getMonth() + 1).padStart(2, '0')}`;
        months.add(monthYear);
    });

    months.forEach(month => {
        const option = document.createElement('option');
        option.value = month;
        option.text = month;
        monthFilter.appendChild(option);
    });
}

function filterByMonth(data, selectedMonth) {
    if (selectedMonth === 'all') {
        const aggregatedData = aggregatePoints(data);
        updateTable(aggregatedData.sort((a, b) => b.pontos - a.pontos)); // Ordena por pontos
        return;
    }

    const filteredData = data.filter(person => {
        const activityDate = new Date(person.dataAtividade.split('-').reverse().join('-'));
        const activityMonthYear = `${activityDate.getFullYear()}-${String(activityDate.getMonth() + 1).padStart(2, '0')}`;
        return activityMonthYear === selectedMonth;
    });

    const userPointsByMonth = aggregatePoints(filteredData);
    updateTable(userPointsByMonth.sort((a, b) => b.pontos - a.pontos)); // Ordena por pontos
}

function calculateLast4Months(data) {
    const currentDate = new Date();
    const last4MonthsData = data.filter(person => {
        const activityDate = new Date(person.dataAtividade.split('-').reverse().join('-'));
        const diffMonths = (currentDate.getFullYear() - activityDate.getFullYear()) * 12 + 
                           (currentDate.getMonth() - activityDate.getMonth());
        return diffMonths <= 4;
    });

    const userPoints = aggregatePoints(last4MonthsData);
    updateTable(userPoints.sort((a, b) => b.pontos - a.pontos));

    const top3 = userPoints.sort((a, b) => b.pontos - a.pontos).slice(0, 3);
    updatePodium(top3);

    // Mostra popup e confetes
    showWinnersPopup(top3);
    triggerConfetti(); // Dispara confetes!

    document.getElementById('podio').style.display = 'flex';

    const totalPontos = userPoints.reduce((total, person) => total + person.pontos, 0);
    document.getElementById('totalPontos').innerText = totalPontos.toFixed(2);
}

function aggregatePoints(data) {
    const userPoints = {};

    data.forEach(person => {
        const pontos = parseFloat(person.pontosAtividade);
        if (userPoints[person.idUsuario]) {
            userPoints[person.idUsuario].pontos += pontos;
        } else {
            userPoints[person.idUsuario] = {
                nome: person.nomeUsuario,
                foto: person.fotoUsuario || './profile.png',
                pontos: pontos
            };
        }
    });

    return Object.values(userPoints);
}

function updateTable(data) {
    const tbody = document.querySelector('#ranking tbody');
    tbody.innerHTML = '';

    data.forEach((person, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${person.nome}</td>
            <td>${person.pontos.toFixed(2)}</td>
            <td>-</td>
        `;
        tbody.appendChild(row);
    });
}

function updatePodium(top3) {
    const positions = ['primeiro', 'segundo', 'terceiro'];
    top3.forEach((person, index) => {
        const positionId = positions[index];
        document.getElementById(`${positionId}Nome`).innerText = person.nome;
        document.getElementById(`${positionId}Foto`).src = person.foto;
    });
}

function showWinnersPopup(top3) {
    const modal = document.getElementById('myModal');
    const closeBtn = document.querySelector('.close');
    const winnerList = document.getElementById('winnerList');

    winnerList.innerHTML = '';
    top3.forEach((person, index) => {
        winnerList.innerHTML += `
            <p>${index + 1}. ${person.nome} - ${person.pontos.toFixed(2)} pontos 🏆</p>
        `;
    });

    modal.style.display = 'block';

    closeBtn.onclick = function () {
        modal.style.display = 'none';
    };

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

function triggerConfetti() {
    // Efeito de confete
    var duration = 5 * 1000;
    var end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
        });
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

window.onload = loadData;