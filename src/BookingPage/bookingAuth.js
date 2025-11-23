
const API_BASE = 'http://localhost:3000';

// helpers
async function postJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body || {})
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `POST ${path} failed`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { message: text }; }
}

// Register customer + vehicle
document.getElementById('customerRegisterForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('regUsername').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const vehType  = document.getElementById('regVehType').value;
  const plateNum = document.getElementById('regPlateNum').value.trim();

  if (!username || !email || !password || !vehType || !plateNum) {
    alert('Please fill all fields');
    return;
  }

  try {
    const data = await postJson('/customer/register', {
      username,
      email,
      password,
      vehType,
      plateNum
    });
    alert('Registered successfully, please login.');
    // close modal and open login
    const regModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
    regModal.hide();
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
  } catch (err) {
    alert(err.message);
  }
});

// Login customer
document.getElementById('customerLoginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    alert('Please enter email and password');
    return;
  }

  try {
    const data = await postJson('/customer/login', { email, password });
    alert('Login successful!');
    // close modal
    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    loginModal.hide();
    // now session is set and /api/booking etc. can use req.session.userId & vehicle
  } catch (err) {
    alert(err.message);
  }
});
