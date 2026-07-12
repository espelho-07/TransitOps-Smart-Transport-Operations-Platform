/**
 * Promise-based Mock Auth Service
 * Replaces login, logout, and password resets with standard async flows.
 */
export const authService = {
  login: (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          resolve({ success: true, email });
        } else {
          reject(new Error("Credentials parameters are audited. Check inputs."));
        }
      }, 300);
    });
  },
  logout: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true }), 200);
    });
  },
  resetPassword: (email) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email) resolve({ success: true });
        else reject(new Error("Recovery email target required."));
      }, 300);
    });
  }
};
export default authService;
