// profile.js or another relevant client-side script
async function fetchProfile() {
    let token = localStorage.getItem('jwtToken');
    let refreshToken = localStorage.getItem('refreshToken');
  
    try {
      const response = await fetch('http://localhost:3000/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}` // Include token in header
        }
      });
  
      if (response.status === 401) {
        // Token might be expired; attempt to refresh it
        const refreshResponse = await fetch('http://localhost:3000/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refreshToken })
        });
  
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          token = data.token;
  
          // Store new token and retry the original request
          localStorage.setItem('jwtToken', token);
  
          // Retry the profile fetch
          const retryResponse = await fetch('http://localhost:3000/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
  
          if (retryResponse.ok) {
            const profileData = await retryResponse.json();
            console.log('Profile Data:', profileData);
          } else {
            console.error('Failed to fetch profile after token refresh');
          }
        } else {
          console.error('Failed to refresh token');
        }
      } else {
        const data = await response.json();
        console.log('Profile Data:', data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }
  
  // Call this function when needed, e.g., after page load
  fetchProfile();
  