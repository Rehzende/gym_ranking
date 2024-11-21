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

        document.getElementById('last4MonthsButton').addEventListener('click', function() {
            startCountdown(() => {
                calculateLast4Months(data.stats);
                showPodioModal();
            });
        });

    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
    }
}

function startCountdown(callback) {
    var countdownElement = document.getElementById('countdown');
    var countdown = 5;

    countdownElement.classList.remove('hidden');

    var interval = setInterval(function() {
        countdownElement.textContent = countdown;
        countdownElement.style.opacity = '1';
        countdownElement.style.transform = 'scale(1.5)';
        
        setTimeout(function() {
            countdownElement.style.opacity = '0';
            countdownElement.style.transform = 'scale(1)';
        }, 500);

        countdown--;

        if (countdown < 0) {
            clearInterval(interval);
            countdownElement.classList.add('hidden');
            callback(); // Chama a função de cálculo após a contagem regressiva
        }
    }, 1000);
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
        return diffMonths <= 3;
    });

    const userPoints = aggregatePoints(last4MonthsData);
    updateTable(userPoints.sort((a, b) => b.pontos - a.pontos));

    const top5 = userPoints.sort((a, b) => b.pontos - a.pontos).slice(0, 5);
    updatePodium(top5);

    // Mostra popup e confetes
    showPodioModal();
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

function updatePodium(top5) {
    const positions = ['primeiro', 'segundo', 'terceiro', 'quarto', 'quinto'];
    top5.forEach((person, index) => {
        const position = positions[index];
        document.getElementById(`${position}Foto`).src = person.foto;
        document.getElementById(`${position}Nome`).innerText = person.nome;
        document.getElementById(`${position}Pontos`).innerText = `Pontos: ${person.pontos.toFixed(2)}`;
    });
}

function showWinnersPopup(top5) {
    var modal = document.getElementById('podioModal');
    var closeBtn = document.getElementById('closePodioModal');

    modal.classList.remove('hidden');
    modal.style.display = 'block';

    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
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

function showPodioModal() {
    var modal = document.getElementById('podioModal');
    var closeBtn = document.getElementById('closePodioModal');

    modal.classList.remove('hidden');
    modal.style.display = 'block';

    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

window.onload = loadData;