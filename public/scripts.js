document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
  
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const username = document.getElementById('regUsername').value;
      const password = document.getElementById('regPassword').value;
  
      try {
        const response = await fetch('http://localhost:3000/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
  
        const data = await response.json();
        alert(data.message);
      } catch (error) {
        console.error('Error registering:', error);
        alert('Registration failed');
      }
    });
  
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const username = document.getElementById('loginUsername').value;
      const password = document.getElementById('loginPassword').value;
  
      try {
        const response = await fetch('http://localhost:3000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
  
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
          alert('Login successful');
          window.location.href = '/'; // Redirect to homepage or dashboard
        } else {
          alert('Login failed');
        }
      } catch (error) {
        console.error('Error logging in:', error);
        alert('Login failed');
      }
    });
  });
  