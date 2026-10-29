let token = localStorage.getItem('hc_token') || '';
let currentUser = null;

function logConsole(method, url, status, data) {
  const box = document.getElementById('consoleOutput');
  const timestamp = new Date().toLocaleTimeString();
  const formatted = `[${timestamp}] ${method} ${url} -> Status ${status}\n${JSON.stringify(data, null, 2)}\n\n`;
  box.textContent = formatted + box.textContent;
}

function updateAuthUI() {
  const badge = document.getElementById('authBadge');
  const greeting = document.getElementById('userGreeting');
  const tokenDisplay = document.getElementById('tokenDisplay');
  const forms = document.getElementById('authForms');
  const loggedInActions = document.getElementById('authLoggedInActions');

  if (token) {
    badge.className = 'badge badge-emerald';
    badge.textContent = 'Authenticated (JWT Active)';
    tokenDisplay.textContent = token;
    greeting.textContent = currentUser ? `Logged in as: ${currentUser.name} (${currentUser.email})` : 'Logged in with saved JWT';
    forms.style.display = 'none';
    loggedInActions.style.display = 'block';
  } else {
    badge.className = 'badge badge-rose';
    badge.textContent = 'Not Authenticated';
    tokenDisplay.textContent = 'None';
    greeting.textContent = 'Please register or log in to manage patients and mappings.';
    forms.style.display = 'block';
    loggedInActions.style.display = 'none';
  }
}

async function apiRequest(endpoint, method = 'GET', body = null, requiresAuth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (requiresAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(endpoint, options);
    const data = await res.json().catch(() => ({ message: 'Non-JSON response' }));
    logConsole(method, endpoint, res.status, data);

    if (res.status === 401 && requiresAuth) {
      alert('Session expired or unauthorized. Please log in.');
      handleLogout();
    }
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    logConsole(method, endpoint, 'ERR', { error: err.message });
    return { ok: false, status: 500, data: { message: err.message } };
  }
}

async function handleRegister() {
  const name = document.getElementById('authName').value;
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;

  const res = await apiRequest('/api/auth/register/', 'POST', { name, email, password }, false);
  if (res.ok) {
    token = res.data.data.token;
    currentUser = res.data.data.user;
    localStorage.setItem('hc_token', token);
    updateAuthUI();
    fetchPatients();
    fetchDoctors();
    fetchMappings();
    alert('Registration successful! Authenticated with JWT.');
  } else {
    alert('Registration failed: ' + (res.data.message || 'Check errors in console'));
  }
}

async function handleLogin() {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;

  const res = await apiRequest('/api/auth/login/', 'POST', { email, password }, false);
  if (res.ok) {
    token = res.data.data.token;
    currentUser = res.data.data.user;
    localStorage.setItem('hc_token', token);
    updateAuthUI();
    fetchPatients();
    fetchDoctors();
    fetchMappings();
  } else {
    alert('Login failed: ' + (res.data.message || 'Check credentials'));
  }
}

function handleLogout() {
  token = '';
  currentUser = null;
  localStorage.removeItem('hc_token');
  updateAuthUI();
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  event.currentTarget.classList.add('active');
  document.getElementById(`tab-${tabName}`).classList.add('active');

  if (tabName === 'patients') fetchPatients();
  if (tabName === 'doctors') fetchDoctors();
  if (tabName === 'mappings') {
    fetchMappings();
    populateMappingDropdowns();
  }
}

// Patient CRUD
async function createPatient() {
  if (!token) return alert('Please login first!');
  const name = document.getElementById('patientName').value;
  const age = parseInt(document.getElementById('patientAge').value);
  const gender = document.getElementById('patientGender').value;
  const contact = document.getElementById('patientContact').value;
  const address = document.getElementById('patientAddress').value;
  const medical_history = document.getElementById('patientHistory').value;

  const res = await apiRequest('/api/patients/', 'POST', {
    name, age, gender, contact, address, medical_history
  });

  if (res.ok) {
    alert('Patient added successfully!');
    fetchPatients();
  } else {
    alert('Failed to add patient: ' + (res.data.message || 'Error'));
  }
}

async function fetchPatients() {
  if (!token) {
    document.getElementById('patientsTableBody').innerHTML = `
      <tr><td colspan="6" style="text-align:center; color: var(--rose);">Login required to view your patients.</td></tr>`;
    return;
  }

  const res = await apiRequest('/api/patients/', 'GET');
  const tbody = document.getElementById('patientsTableBody');

  if (res.ok && res.data.data) {
    const list = res.data.data;
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-dim);">No patients created yet. Add one on the left!</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(p => `
      <tr>
        <td><strong>#${p.id}</strong></td>
        <td><strong>${p.name}</strong></td>
        <td>${p.age} yrs / ${p.gender}</td>
        <td>${p.contact}</td>
        <td>
          ${p.doctors && p.doctors.length > 0 
            ? p.doctors.map(d => `<span class="badge badge-primary">${d.name} (${d.specialization})</span>`).join(' ')
            : '<span style="color:var(--text-dim)">None</span>'}
        </td>
        <td>
          <button class="btn btn-danger" style="padding:4px 8px; font-size:0.75rem;" onclick="deletePatient(${p.id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }
}

async function deletePatient(id) {
  if (!confirm(`Are you sure you want to delete patient #${id}?`)) return;
  const res = await apiRequest(`/api/patients/${id}/`, 'DELETE');
  if (res.ok) {
    fetchPatients();
    fetchMappings();
  }
}

// Doctor CRUD
async function createDoctor() {
  if (!token) return alert('Please login first!');
  const name = document.getElementById('doctorName').value;
  const specialization = document.getElementById('doctorSpecialization').value;
  const email = document.getElementById('doctorEmail').value;
  const phone = document.getElementById('doctorPhone').value;
  const available_days = document.getElementById('doctorDays').value;

  const res = await apiRequest('/api/doctors/', 'POST', {
    name, specialization, email, phone, available_days
  });

  if (res.ok) {
    alert('Doctor registered successfully!');
    fetchDoctors();
  } else {
    alert('Failed to register doctor: ' + (res.data.message || 'Error'));
  }
}

async function fetchDoctors() {
  const res = await apiRequest('/api/doctors/', 'GET', null, false);
  const tbody = document.getElementById('doctorsTableBody');

  if (res.ok && res.data.data) {
    const list = res.data.data;
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-dim);">No doctors registered yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(d => `
      <tr>
        <td><strong>#${d.id}</strong></td>
        <td><strong>${d.name}</strong></td>
        <td><span class="badge badge-primary">${d.specialization}</span></td>
        <td>${d.phone}</td>
        <td>${d.available_days || 'N/A'}</td>
        <td>
          <button class="btn btn-danger" style="padding:4px 8px; font-size:0.75rem;" onclick="deleteDoctor(${d.id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }
}

async function deleteDoctor(id) {
  if (!confirm(`Are you sure you want to delete doctor #${id}?`)) return;
  const res = await apiRequest(`/api/doctors/${id}/`, 'DELETE');
  if (res.ok) {
    fetchDoctors();
    fetchMappings();
  }
}

// Mappings CRUD
async function populateMappingDropdowns() {
  const pSelect = document.getElementById('mappingPatientSelect');
  const dSelect = document.getElementById('mappingDoctorSelect');

  if (token) {
    const pRes = await apiRequest('/api/patients/', 'GET');
    if (pRes.ok && pRes.data.data) {
      pSelect.innerHTML = '<option value="">-- Choose Patient --</option>' +
        pRes.data.data.map(p => `<option value="${p.id}">#${p.id} - ${p.name}</option>`).join('');
    }
  }

  const dRes = await apiRequest('/api/doctors/', 'GET', null, false);
  if (dRes.ok && dRes.data.data) {
    dSelect.innerHTML = '<option value="">-- Choose Doctor --</option>' +
      dRes.data.data.map(d => `<option value="${d.id}">#${d.id} - ${d.name} (${d.specialization})</option>`).join('');
  }
}

async function createMapping() {
  if (!token) return alert('Please login first!');
  const patient_id = parseInt(document.getElementById('mappingPatientSelect').value);
  const doctor_id = parseInt(document.getElementById('mappingDoctorSelect').value);
  const appointment_date = document.getElementById('mappingDate').value || null;
  const notes = document.getElementById('mappingNotes').value;

  if (!patient_id || !doctor_id) {
    return alert('Please select both a patient and a doctor.');
  }

  const res = await apiRequest('/api/mappings/', 'POST', {
    patient_id, doctor_id, appointment_date, notes
  });

  if (res.ok) {
    alert('Doctor successfully assigned to patient!');
    fetchMappings();
    fetchPatients();
  } else {
    alert('Failed to assign doctor: ' + (res.data.message || 'Error'));
  }
}

async function fetchMappings() {
  if (!token) {
    document.getElementById('mappingsTableBody').innerHTML = `
      <tr><td colspan="5" style="text-align:center; color: var(--rose);">Login required to view mappings.</td></tr>`;
    return;
  }

  const res = await apiRequest('/api/mappings/', 'GET');
  const tbody = document.getElementById('mappingsTableBody');

  if (res.ok && res.data.data) {
    const list = res.data.data;
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-dim);">No mappings found. Assign one on the left!</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(m => `
      <tr>
        <td><strong>#${m.id}</strong></td>
        <td>${m.patient ? `${m.patient.name} (#${m.patient.id})` : 'N/A'}</td>
        <td>${m.doctor ? `<strong>${m.doctor.name}</strong> (${m.doctor.specialization})` : 'N/A'}</td>
        <td>${m.appointment_date ? new Date(m.appointment_date).toLocaleString() : 'Not scheduled'}</td>
        <td>
          <button class="btn btn-danger" style="padding:4px 8px; font-size:0.75rem;" onclick="removeMapping(${m.id})">
            <i class="fa-solid fa-unlink"></i> Remove
          </button>
        </td>
      </tr>
    `).join('');
  }
}

async function removeMapping(id) {
  if (!confirm(`Remove mapping #${id}?`)) return;
  const res = await apiRequest(`/api/mappings/${id}/`, 'DELETE');
  if (res.ok) {
    fetchMappings();
    fetchPatients();
  }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  fetchDoctors();
  if (token) {
    fetchPatients();
    fetchMappings();
  }
});
