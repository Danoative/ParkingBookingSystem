const API_BASE = 'http://localhost:3000';

// ---------- generic helpers ----------
async function postJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body || {})
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `POST ${path} failed with status ${res.status}`);
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();

  const text = await res.text();
  try { return JSON.parse(text); } catch { return { message: text }; }
}

async function getJson(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    credentials: 'include'
  });

  if (!res.ok) return null;

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return null;
}

// ---------- main ----------
document.addEventListener('DOMContentLoaded', () => {
  console.log('bookingAuth.js DOMContentLoaded');

  // header elements
  const loginBtn     = document.getElementById('loginBtn');
  const registerBtn  = document.getElementById('registerBtn');
  const logoutBtn    = document.getElementById('logoutBtn');
  const userGreeting = document.getElementById('userGreeting');
  const greetingName = document.getElementById('greetingName');

  // auth forms (modals)
  const regForm      = document.getElementById('customerRegisterForm');
  const loginForm    = document.getElementById('customerLoginForm');

  // payment modal (custom overlay) – may not exist on all pages
  const paymentModalEl = document.getElementById('paymentModal');

  console.log('Header elements:', { loginBtn, registerBtn, logoutBtn, userGreeting, greetingName });

  function hidePaymentModal() {
    if (paymentModalEl) paymentModalEl.style.display = 'none';
  }

  // ---------- UI helpers ----------
  function setLoggedOutUI() {
    console.log('setLoggedOutUI');
    if (userGreeting) userGreeting.style.display = 'none';
    if (greetingName) greetingName.textContent = '';
    if (loginBtn)     loginBtn.style.display = 'inline-block';
    if (registerBtn)  registerBtn.style.display = 'inline-block';
    if (logoutBtn)    logoutBtn.style.display = 'none';
  }

  function setLoggedInUI(username) {
    console.log('setLoggedInUI', username);
    if (greetingName) greetingName.textContent = username || '';
    if (userGreeting) userGreeting.style.display = 'inline';
    if (loginBtn)     loginBtn.style.display = 'none';
    if (registerBtn)  registerBtn.style.display = 'none';
    if (logoutBtn)    logoutBtn.style.display = 'inline-block';
  }

  // ---------- check session on page load ----------
  async function checkAuth() {
    try {
      const data = await getJson('/auth/me');  // server.js implements this
      console.log('/auth/me:', data);
      if (data && data.loggedIn) {
        setLoggedInUI(data.username);
      } else {
        setLoggedOutUI();
      }
    } catch (err) {
      console.error('auth check failed', err);
      setLoggedOutUI();
    }
  }

  checkAuth();

  // ---------- Register customer + vehicle ----------
  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
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
        await postJson('/customer/register', {
          username,
          email,
          password,
          vehType,
          plateNum
        });

        alert('Registered successfully, please login.');

        const regModalEl = document.getElementById('registerModal');
        if (regModalEl) {
          const regModal = bootstrap.Modal.getInstance(regModalEl)
                         || new bootstrap.Modal(regModalEl);
          regModal.hide();
        }

        const loginModalEl = document.getElementById('loginModal');
        if (loginModalEl) {
          const loginModal = bootstrap.Modal.getInstance(loginModalEl)
                           || new bootstrap.Modal(loginModalEl);
          loginModal.show();
        }

        hidePaymentModal();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // ---------- Login customer ----------
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email    = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      if (!email || !password) {
        alert('Please enter email and password');
        return;
      }

      try {
        const data = await postJson('/customer/login', { email, password });
        console.log('login response:', data);

        alert('Login successful!');
        setLoggedInUI(data.username);   // server.js returns username

        const loginModalEl = document.getElementById('loginModal');
        if (loginModalEl) {
          const loginModal = bootstrap.Modal.getInstance(loginModalEl)
                           || new bootstrap.Modal(loginModalEl);
          loginModal.hide();
        }

        hidePaymentModal();
        loginForm.reset();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // ---------- Logout ----------
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await postJson('/logout', {});  // matches app.post('/logout') in server.js
        setLoggedOutUI();
        hidePaymentModal();
      } catch (err) {
        alert(err.message);
      }
    });
  }
});
