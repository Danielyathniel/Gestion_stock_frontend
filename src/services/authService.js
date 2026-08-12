import api from './api';

const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      

      if (response.data.token) {
        const { user, token } = response.data;
        
      
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        return { 
          success: true, 
          user: user,
          token: token
        };
      }
      
      return { 
        success: false, 
        message: response.data.message || 'Erreur de connexion' 
      };
    } catch (error) {
      
      const errorMessage = error.response?.data?.errors?.email?.[0] 
        || error.response?.data?.message 
        || 'Erreur de connexion';
      
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Erreur déconnexion', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },


  fetchUser: async () => {
    try {
      const response = await api.get('/me');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération utilisateur', error);
      return null;
    }
  }
};

export default authService;