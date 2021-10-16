import React, { createContext, useState, useEffect } from 'react';
// import axios from "axios";
// import jwt_decode from "jwt-decode";
import { useHistory } from 'react-router-dom';

export const AuthContext = createContext({});

function AuthContextProvider({children}) {
    const [isAuth, toggleIsAuth] = useState({
        isAuth: false,
        user: null,
        status: 'pending',
    });

    const history = useHistory();

    useEffect(() => {
        // hier gaan we later checken of er toevallig nog een ingelogde gebruiker is, zodat we opnieuw gegevens kunnen ophalen
        // maar voor doen we dat niet, dus zetten we de status op 'done'
        toggleIsAuth({ ...isAuth,
            user: null,
            status: 'done',
        })
    }, []);

    function login(email) {
        console.log('Gebruiker is ingelogd!');
        toggleIsAuth({
            isAuth: true,
            user: email,
        });
        history.push('/profile');
    }

    function logout() {
        console.log('Gebruiker is uitgelogd!');
        toggleIsAuth({
            isAuth: false,
            user: '',
        });
        history.push('/');
    }

    const contextData = {
        isAuth: isAuth.isAuth,
        user: isAuth.user,
        login: login,
        logout: logout,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContextProvider;