import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';

export function useAuth() {
  const authStore = useAuthStore();
  const { user, isAuthenticated, loading, error } = storeToRefs(authStore);

  // Register user
  const register = async (name, email, password, passwordConfirmation) => {
    return await authStore.register({
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
  };

  // Login user
  const login = async (emailOrPayload, password) => {
    const payload =
      typeof emailOrPayload === 'object' && emailOrPayload !== null
        ? emailOrPayload
        : { email: emailOrPayload, password };

    return await authStore.login(payload);
  };

  // Logout user
  const logout = async () => {
    return await authStore.logout();
  };

  // Get profile
  const getProfile = () => {
    return authStore.user;
  };

  // Update profile
  const updateProfile = async (name, email) => {
    return await authStore.updateProfile({
      name,
      email,
    });
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    return await authStore.changePassword({
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: newPassword,
    });
  };

  return {
    // State
    user,
    isAuthenticated,
    loading,
    error,
    
    // Actions
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    changePassword,
  };
}
