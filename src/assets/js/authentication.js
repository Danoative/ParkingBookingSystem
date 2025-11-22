const API_BASE = 'http://localhost:3000';

// POST helper
async function postJson(path, payload) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Request failed');
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { message: text }; }
}

// Register (AdminDash & Booking)
async function handleRegister(form) {
  const username = form.querySelector('#regName')?.value?.trim();
  const email = form.querySelector('#regEmail')?.value?.trim();
  const password = form.querySelector('#regPassword')?.value;
  const role = form.getAttribute('data-role'); // "ADMIN" or "CUSTOMER"

  if (!username || !email || !password) {
    alert('Please fill all fields');
    return;
  }

  try {
    const data = await postJson('/register', { username, email, password, role });
    // backend should redirect with query ?msg=registered_admin_success
    // but if using JSON you can also just do:
    if (data.redirect) {
      window.location.href = data.redirect;
    } else {
      // default: go to admin login and show message via query
      window.location.href = 'src/AdminDash/authentication-login.html?msg=registered_admin_success';
    }
  } catch (err) {
    alert(err.message);
  }
}

// Login (AdminDash & Booking)
async function handleLogin(form) {
  const email = form.querySelector('#loginEmail')?.value?.trim();
  const password = form.querySelector('#loginPassword')?.value;

  if (!email || !password) {
    alert('Please fill all fields');
    return;
  }

  try {
    const data = await postJson('/login', { email, password });
    if (data.redirect) {
      window.location.href = data.redirect;
    } else if (data.role === 'ADMIN') {
      window.location.href = '../AdminDash/index.html';
    } else if (data.role === 'CUSTOMER') {
      window.location.href = '../BookingPage/index.html';
    } else {
      alert('Login success but unknown role');
    }
  } catch (err) {
    alert(err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.querySelector('form[data-auth="register"]');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleRegister(registerForm);
    });
  }

  const loginForm = document.querySelector('form[data-auth="login"]');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleLogin(loginForm);
    });
  }
});
