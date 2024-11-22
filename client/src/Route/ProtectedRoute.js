import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getUser } from '../utils/helpers';

const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const fetchedUser = await getUser();
                console.log('Fetched User:', fetchedUser); // Log the fetched user
                setUser(fetchedUser);
            } catch (error) {
                console.error('Error fetching user:', error); // Log any errors during user fetch
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) return null; // Optionally return a loading spinner or placeholder

    if (!user) {
        console.log('No user found, redirecting to /login');
        return <Navigate to='/login' />;
    }

    console.log('User Role:', user.role); // Log the user's role

    // Redirect non-admin users to home page
    if (user.role !== 'admin') {
        console.log('User is not an admin, redirecting to /');
        return <Navigate to='/' />;
    }

    return children; // If user is an admin, render the protected component
};

export default ProtectedRoute;
