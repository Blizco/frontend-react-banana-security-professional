import React, {createContext, useState, useEffect} from 'react';
import axios from "axios";
import jwt_decode from "jwt-decode";
import {useHistory} from 'react-router-dom';

export const AuthContext = createContext({});

function AuthContextProvider({children}) {
    const [authState, setAuthState] = useState({
        isAuth: false,
        user: null,
        status: 'pending',
    });

    const history = useHistory();

    function isTokenValid(jwtToken) {
        const decodedToken = jwt_decode(jwtToken);
        const expirationUnix = decodedToken.exp; // let op: dit is een UNIX timestamp

        const now = new Date().getTime(); // dit is een javascript timestamp
        const currentUnix = Math.round(now / 1000); // nu is het ook een UNIX timestamp
        // Als er nog seconden over zijn wanneer we "nu" aftrekken van de expiratiedatum is hij nog geldig
        const isTokenStillValid = expirationUnix - currentUnix > 0;

        return isTokenStillValid;
    }

    useEffect(() => {
        // na refresh is userkey leeg, (initial state) maar we
        // checken of we nog een (geldige) token hebben in de local storage
        // zo ja, dan willen we op basis van die gegevens opnieuw gebruikersdata ophalen => status 'done
        const token = localStorage.getItem('token');

        if (!authState.user && token && isTokenValid(token)) {
            const decodedToken = jwt_decode(token);

            getUserData(token, decodedToken.sub);
        } else {
            // zo nee, dan gaan we verder met ons leven => status: done,
            setAuthState({
                ...authState,
                user: null,
                status: 'done',
            });
        }
    }, []);


    function login(JWT) {

        // JWT in de local storage zetten
        localStorage.setItem('token', JWT);

        // token decoderen
        const decodedToken = jwt_decode(JWT);
        const userId = decodedToken.sub;

        // Op basis van die informatie kunnen we de gebruikersgegevens ophalen via een GET-request
        // met async functie etc............en in de state plaatsen
        getUserData(JWT, userId, authState);
    }

    async function getUserData(token, id, authState) {
        try {
            const result = await axios.get(`http://localhost:3000/600/users/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            });

            setAuthState({
                ...authState,
                isAuth: true,
                user: {
                    username: result.data.username,
                    email: result.data.email,
                    id: result.data.id,
                    // extra data meegeven kan
                    country: result.data.country,
                    // ook een bepaalde rol meegeven is hier gebruikelijk
                    role: result.data.role,
                },
                status: 'done',
            });

            history.push('/profile');

        } catch (e) {
            console.error(e);
        }
    }

    function logout() {

        setAuthState({
            ...authState,
            isAuth: false,
            user: null,
            status: 'done',
        });
        history.push('/');
    }

    const contextData = {
        ...authState,
        login: login,
        logout: logout,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {authState.status === 'done'
                ? children
                : <p>Loading...</p>
            }
        </AuthContext.Provider>
    );
}

export default AuthContextProvider;