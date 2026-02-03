let currentId = null;

const searchTerm = document.getElementById('search-term');
const searchBtn = document.getElementById('search-btn');
const clearBtn = document.getElementById('clear-btn');
const newBtn = document.getElementById('new-btn');
const printBtn = document.getElementById('print-btn');
const saveBtn = document.getElementById('save-btn');
const toggleBtn = document.getElementById('toggle-password');
const passwordInput = document.getElementById('password');

function clearForm() {
  document.getElementById('full-name').value = '';
  document.getElementById('email').value = '';
  document.getElementById('web-address').value = '';
  document.getElementById('username').value = '';
  passwordInput.value = '';
  document.getElementById('home-address').value = '';
  document.getElementById('optional-info').value = '';
  currentId = null;
}

function loadForm(record) {
  document.getElementById('full-name').value = record.full_name || '';
  document.getElementById('email').value = record.email || '';
  document.getElementById('web-address').value = record.web_address || '';
  document.getElementById('username').value = record.username || '';
  passwordInput.value = record.password || '';
  document.getElementById('home-address').value = record.home_address || '';
  document.getElementById('optional-info').value = record.optional_info || '';
  currentId = record.id;
}

function getFormData() {
  return {
    id: currentId,
    full_name: document.getElementById('full-name').value.trim(),
    email: document.getElementById('email').value.trim(),
    web_address: document.getElementById('web-address').value.trim(),
    username: document.getElementById('username').value.trim(),
    password: passwordInput.value,
    home_address: document.getElementById('home-address').value.trim(),
    optional_info: document.getElementById('optional-info').value.trim(),
  };
}

// Event listeners
searchBtn.addEventListener('click', async () => {
  const term = searchTerm.value.trim();
  try {
    const results = await window.api.searchRecords(term);
    if (results.length > 0) {
      loadForm(results[0]); // Load first match; extend to list if needed
      if (results.length > 1) alert(`Multiple matches found (${results.length}). Loaded the most recent.`);
    } else {
      alert('No matching records found.');
    }
  } catch (err) {
    alert('Search error: ' + err.message);
  }
});

saveBtn.addEventListener('click', async () => {
  try {
    const data = getFormData();
    const result = await window.api.saveRecord(data);
    if (result.success) {
      currentId = result.id;
      alert('Record saved/updated successfully!');
    }
  } catch (err) {
    alert('Save error: ' + err.message);
  }
});

clearBtn.addEventListener('click', clearForm);
newBtn.addEventListener('click', () => {
  clearForm();
  alert('Form cleared for new record.');
});

printBtn.addEventListener('click', () => {
  window.print();
});

toggleBtn.addEventListener('click', () => {
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleBtn.textContent = '🙈';
  } else {
    passwordInput.type = 'password';
    toggleBtn.textContent = '👁';
  }
});