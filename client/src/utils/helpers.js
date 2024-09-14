// Check if running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Save authentication data to session storage
export const authenticate = (data, next) => {
    if (isBrowser) {
        try {
            sessionStorage.setItem('token', JSON.stringify(data.token));
            sessionStorage.setItem('user', JSON.stringify(data.user));
            console.log('Stored token:', data.token);
            console.log('Stored user:', data.user);
        } catch (error) {
            console.error('Error saving to session storage:', error);
        }
    }
    next();
};

// Retrieve token from session storage
export const getToken = () => {
    if (isBrowser) {
        try {
            const token = sessionStorage.getItem('token');
            const parsedToken = token ? JSON.parse(token) : null;
            console.log('Retrieved token:', parsedToken);
            return parsedToken;
        } catch (error) {
            console.error('Error retrieving token from session storage:', error);
        }
    }
    return null;
};

// Retrieve user data from session storage
export const getUser = () => {
    if (isBrowser) {
        try {
            const user = sessionStorage.getItem('user');
            const parsedUser = user ? JSON.parse(user) : null;
            console.log('Retrieved user:', parsedUser);
            return parsedUser;
        } catch (error) {
            console.error('Error retrieving user from session storage:', error);
        }
    }
    return null;
};

// Remove authentication data from session storage
export const logout = (next) => {
    if (isBrowser) {
        try {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            console.log('Removed token and user from session storage');
        } catch (error) {
            console.error('Error removing from session storage:', error);
        }
    }
    next();
};
