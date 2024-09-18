import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getUser } from '../utils/helpers';

const ProtectedRoute = ({ children, isAdmin = false }) => {
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

    if (loading) return null;

    if (!user) {
        console.log('No user found, redirecting to /login');
        return <Navigate to='/login' />;
    }

    console.log('User Role:', user.role); // Log the user's role

    if (isAdmin && user.role !== 'admin') {
        console.log('User is not an admin, redirecting to /');
        return <Navigate to='/' />;
    }

    return children;
};

export default ProtectedRoute;

// import React, { useState, useEffect } from 'react';
// import { Navigate } from 'react-router-dom';
// import { getUser } from '../utils/helpers';

// const ProtectedRoute = ({ children, isAdmin = false }) => {
//     const [loading, setLoading] = useState(true);
//     const [user, setUser] = useState(null);

//     useEffect(() => {
//         const fetchUser = async () => {
//             try {
//                 const fetchedUser = await getUser();
//                 console.log('Fetched User:', fetchedUser); // Log the fetched user
//                 setUser(fetchedUser);
//             } catch (error) {
//                 console.error('Error fetching user:', error); // Log any errors during user fetch
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchUser();
//     }, []);

//     if (loading) return null;

//     if (!user) {
//         console.log('No user found, redirecting to /login');
//         return <Navigate to='/login' />;
//     }

//     console.log('User Role:', user.role); // Log the user's role

//     if (isAdmin && !(user.role === 'admin' || user.role === 'member' || user.role === 'user')) {
//         console.log('User does not have the required role, redirecting to /');
//         return <Navigate to='/' />;
//     }

//     return children;
// };

// export default ProtectedRoute;
