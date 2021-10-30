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

    const [registerSuccess, toggleRegisterSuccess] = useState(false);
    const [error, setError] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [loading, toggleLoading] = useState(false);
    const [emailExist, toggleEmailExist] = useState(false);
    const [signinEmail, setSigninEmail] = useState('');

    // MOUNTING EFFECT
    useEffect(() => {
        // na refresh is user key leeg, (initial state) maar we
        // checken of we nog een (geldige) token hebben in de local storage
        // zo ja, dan willen we op basis van die gegevens opnieuw gebruikersdata ophalen => status 'done
        const token = localStorage.getItem('token');

        // als er WEL een token is, haal dan opnieuw de gebruikersdata op
        if (token && isTokenValid(token)) {
            const decodedToken = jwt_decode(token);
            getUserData(token, decodedToken.sub);
        } else {
            // als er GEEN token is doen we niks, en zetten we de status op 'done'
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

    function logout() {
        // JWT uit de local storage halen
        localStorage.clear();

        toggleIsAuth({
            isAuth: false,
            user: null,
            status: 'done',
        });
        setSigninEmail('');
        toggleEmailExist(false);

        history.push('/');
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

            // als er een redirect URL is meegegeven (bij het mount-effect doen we dit niet) linken we hier naar toe,
            // als we de history.push in de login-functie zouden zetten, linken we al door voor de gebruiker is opgehaald!
            if (redirectUrl) {
                history.push(redirectUrl);
            }

        } catch (e) {
            //    ging er iets mis? Plaatsen we geen data in de state
            toggleIsAuth({
                isAuth: false,
                user: null,
                status: 'done',
            });
        }
    }


    // We maken een canceltoken aan voor ons netwerk-request
    const source = axios.CancelToken.source();


    //Unmounting ingeval tijdens ophalen data ge-unmount wordt
    useEffect(() => {
        return function cleanup() {
            source.cancel();
        }
    }, []);

    // Hier gaan we registreren op pagina "/signup"
    async function onSignUp(data) {

        // omdat onSubmit meerdere keren kan worden aangeroepen, beginnen we altijd met een "schone" lei (geen errors)
        setError('');

        if (data.username === 'admin') {
            data.role = 'admin'
        } else {
            data.role = 'user'
        }

        try {
            const result = await axios.post('http://localhost:3000/register', {
                email: data.email,
                password: data.password,
                country: 'Nederland',
                username: data.username,
                role: data.role,
            }, {
                cancelToken: source.token,
            });
            toggleRegisterSuccess(true);
            toggleLoading(true);

            const registerData = JSON.parse(result.config.data);
            setRegisterEmail(registerData.email);

            // we willen even wachten met doorlinken zodat de gebruiker de tijd heeft om de succesmelding ook daadwerkelijk te zien
            // setTimeout(loginExistingEmail, 3000);

        } catch (e) {

            // op het error (e) object zit altijd een message property, maar die kan wat abstract zijn. Daarom extra text:
            if (e.response.data === "Email already exists") {
                toggleEmailExist(true);

                const registerData = JSON.parse(e.config.data);
                setRegisterEmail(registerData.email);

            } else {
                setError(`Het registeren is mislukt. Probeer het opnieuw (${e.response.data})`);
            }
            toggleLoading(true);

            // TIP: Wanneer er echt iets fout gaat, krijg je een 404 error. Wanneer de gebruikersnaam al bestond,
            // krijg je waarschijnlijk een 400 error.Zo kun je hier ook nog invloed uitoefenen op welke error message je laat zien op de gebruiker!
        }
    }

    function loginExistingEmail() {
        toggleLoading(false);
        setSigninEmail(registerEmail);
        toggleRegisterSuccess(false);
        setError('');
        history.push('/signin');
    }

    const contextData = {
        isAuth: isAuth.isAuth,
        user: isAuth.user,
        login: login,
        logout: logout,
        onSignUp: onSignUp,
        loginExistingEmail: loginExistingEmail,
        loading: loading,
        registerSuccess: registerSuccess,
        error: error,
        emailExist: emailExist,
        registerEmail: registerEmail,
        signinEmail: signinEmail,
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