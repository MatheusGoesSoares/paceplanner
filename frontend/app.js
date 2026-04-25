const API_URL = 'https://paceplanner-backend.onrender.com/api/runs';

const form = document.getElementById('run-form');
const runId = document.getElementById('run-id');
const title = document.getElementById('title');
const distance = document.getElementById('distance');
const duration = document.getElementById('duration');
const pace = document.getElementById('pace');
const date = document.getElementById('date');
const notes = document.getElementById('notes');
const locationInput = document.getElementById('location');

const runsList = document.getElementById('runs-list');
const message = document.getElementById('message');
const cancelEdit = document.getElementById('cancel-edit');
const formTitle = document.getElementById('form-title');
const reloadBtn = document.getElementById('reload-btn');
const getLocationBtn = document.getElementById('get-location');

const openHistoryBtn = document.getElementById('open-history');
const closeHistoryBtn = document.getElementById('close-history');
const historyModal = document.getElementById('history-modal');

function showMessage(text) {
  message.textContent = text;
}

function clearForm() {
  form.reset();
  runId.value = '';
  formTitle.textContent = 'Novo treino';
  cancelEdit.classList.add('hidden');
}

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString('pt-BR');
}

async function loadRuns() {
  const response = await fetch(API_URL);
  const runs = await response.json();

  if (!runs.length) {
    runsList.innerHTML = '<p>Nenhum treino encontrado.</p>';
    return;
  }

  runsList.innerHTML = runs.map(run => `
    <div class="entry-item">
      <h3>${run.title}</h3>
      <p><strong>Distância:</strong> ${run.distance} km</p>
      <p><strong>Duração:</strong> ${run.duration} min</p>
      <p><strong>Pace:</strong> ${run.pace}</p>
      <p><strong>Data:</strong> ${formatDate(run.date)}</p>
      <p><strong>Observações:</strong> ${run.notes || 'Sem observações'}</p>
      <p><strong>Localização:</strong> ${run.location || 'Não informada'}</p>

      <div class="entry-buttons">
        <button onclick="editRun('${run._id}')">Editar</button>
        <button onclick="deleteRun('${run._id}')">Excluir</button>
      </div>
    </div>
  `).join('');
}

async function saveRun(data) {
  const id = runId.value;
  const url = id ? `${API_URL}/${id}` : API_URL;
  const method = id ? 'PUT' : 'POST';

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

window.editRun = async function (id) {
  const response = await fetch(`${API_URL}/${id}`);
  const run = await response.json();

  runId.value = run._id;
  title.value = run.title;
  distance.value = run.distance;
  duration.value = run.duration;
  pace.value = run.pace;
  date.value = new Date(run.date).toISOString().split('T')[0];
  notes.value = run.notes || '';
  locationInput.value = run.location || '';

  formTitle.textContent = 'Editar treino';
  cancelEdit.classList.remove('hidden');
  showMessage('Editando treino.');
  closeModal();
};

window.deleteRun = async function (id) {
  if (!confirm('Deseja excluir este treino?')) return;

  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  showMessage('Treino excluído.');
  loadRuns();
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    title: title.value,
    distance: Number(distance.value),
    duration: Number(duration.value),
    pace: pace.value,
    date: date.value,
    notes: notes.value,
    location: locationInput.value
  };
  console.log(data);
  await saveRun(data);
  showMessage(runId.value ? 'Treino atualizado.' : 'Treino criado.');
  clearForm();
  loadRuns();
});

cancelEdit.addEventListener('click', () => {
  clearForm();
  showMessage('Edição cancelada.');
});

reloadBtn.addEventListener('click', loadRuns);

function openModal() {
  historyModal.classList.remove('hidden');
  loadRuns();
}

function closeModal() {
  historyModal.classList.add('hidden');
}

openHistoryBtn.addEventListener('click', openModal);
closeHistoryBtn.addEventListener('click', closeModal);

historyModal.addEventListener('click', (e) => {
  if (e.target === historyModal) {
    closeModal();
  }
});

if (getLocationBtn && locationInput) {
  getLocationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada neste navegador.');
      return;
    }

    getLocationBtn.textContent = 'Obtendo...';

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );

          const data = await response.json();
          const address = data.address || {};

          const city =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            '';

          const state = address.state || '';
          const suburb = address.suburb || address.neighbourhood || '';

          let formattedLocation = '';

          if (suburb && city && state) {
            formattedLocation = `${suburb}, ${city} - ${state}`;
          } else if (city && state) {
            formattedLocation = `${city} - ${state}`;
          } else if (data.display_name) {
            formattedLocation = data.display_name;
          } else {
            formattedLocation = `Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`;
          }

          locationInput.value = formattedLocation;
        } catch (error) {
          locationInput.value = `Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`;
        }

        getLocationBtn.textContent = 'Usar localização';
      },
      () => {
        alert('Não foi possível obter sua localização.');
        getLocationBtn.textContent = 'Usar localização';
      }
    );
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('./service-worker.js');
      console.log('Service Worker registrado com sucesso.');
    } catch (error) {
      console.log('Erro ao registrar Service Worker:', error);
    }
  });
}

clearForm();
loadRuns();