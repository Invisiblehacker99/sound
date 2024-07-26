// login.js
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent form from submitting normally
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
  
      if (!response.ok) {
        const error = await response.json();
        console.error('Login error:', error.message);
        return;
      }
  
      const data = await response.json();
      const token = data.token;
      const refreshToken = data.refreshToken;
  
      // Store the tokens
      localStorage.setItem('jwtToken', token);
      localStorage.setItem('refreshToken', refreshToken);
  
      // Redirect or perform further actions
      window.location.href = '/profile'; // Example redirect to profile
    } catch (error) {
      console.error('Login error:', error);
    }
  });
  