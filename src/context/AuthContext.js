import React, { createContext, useState, useEffect } from 'react';
import axios from "axios";
import jwt_decode from "jwt-decode";
import { useHistory } from 'react-router-dom';
import isTokenValid from "../helpers/isTokenValid";

export const AuthContext = createContext({});

function AuthContextProvider({children}) {
    const [isAuth, toggleIsAuth] = useState({
        isAuth: false,
        user: null,
        status: 'pending',
    });
    const history = useHistory();

    // MOUNTING EFFECT
    useEffect(() => {
        // na refresh is user key leeg, (initial state) maar we
        // checken of we nog een (geldige) token hebben in de local storage
        // zo ja, dan willen we op basis van die gegevens opnieuw gebruikersdata ophalen => status 'done
        const token = localStorage.getItem('token');

        if (token && isTokenValid(token)) {
            const decodedToken = jwt_decode(token);

            getUserData(token, decodedToken.sub);
        } else {
            // zo nee, dan gaan we verder met ons leven => status: done,
            toggleIsAuth({
                isAuth: false,
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
        getUserData(JWT, userId, '/profile');
    }

    async function getUserData(token, id, redirectUrl) {
        try {
            const result = await axios.get(`http://localhost:3000/600/users/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            });

            // zet de gegevens in de state
            toggleIsAuth({
                ...isAuth,
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

            // als er een redirect URL is meegegeven (bij het mount-effect doen we dit niet) linken we hiernnaartoe door
            // als we de history.push in de login-functie zouden zetten, linken we al door voor de gebuiker is opgehaald!
            if (redirectUrl) {
                history.push(redirectUrl);
            }

        } catch (e) {
            console.error(e);
            //    ging er iets mis? Plaatsen we geen data in de state
            toggleIsAuth({
                isAuth: false,
                user: null,
                status: 'done',
            });
        }
    }

    function logout() {
        // JWT uit de local storage halen
        localStorage.clear();

        toggleIsAuth({
            isAuth: false,
            user: null,
            status: 'done',
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
            {isAuth.status === 'done'
                ? children
                : <p>Loading...</p>
            }
        </AuthContext.Provider>
    );
}

export default AuthContextProvider;