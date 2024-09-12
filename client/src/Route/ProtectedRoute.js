import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getUser } from '../utils/helpers'

const ProtectedRoute = ({ children, isAdmin = false }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const fetchedUser = await getUser();
            setUser(fetchedUser);
            setLoading(false);
        };

        fetchUser();
    }, []);

    if (loading) return null;

    if (!user) {
        return <Navigate to='/login' />;
    }

    if (isAdmin && user.role !== 'admin') {
        return <Navigate to='/' />;
    }

    return children;
};

export default ProtectedRoute;
