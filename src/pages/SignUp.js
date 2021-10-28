import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link, useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';

function SignUp() {
    // useForm Hooks ipv controlled components met useState email, username en password
    const {handleSubmit, register, formState: {errors}} = useForm();

    const [loading, toggleLoading] = useState(false);
    const [registerSuccess, toggleRegisterSuccess] = useState(false);
    const [error, setError] = useState('');

    const [emailExist, toggleEmailExist] = useState(false);

    // We maken een canceltoken aan voor ons netwerk-request
    const source = axios.CancelToken.source();
    const history = useHistory();

    //Unmounting ingeval tijdens ophalen data ge-unmount wordt
    useEffect(() => {
        return function cleanup() {
            source.cancel();
        }
    }, []);

    async function onSubmit(data) {
        // omdat onSubmit meerdere keren kan worden aangeroepen, beginnen we altijd met een "schone" lei (geen errors)
        setError('');
        toggleLoading(true);

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
            // const registerData = JSON.parse(result.config.data);
            // console.log(`Email (registerData): ${registerData.email}`);

            // we willen even wachten met doorlinken zodat de gebruiker de tijd heeft om de succesmelding ook daadwerkelijk te zien
            setTimeout(() => {
                history.push('/signin');
            }, 3000);
        } catch (e) {

            // op het error (e) object zit altijd een message property, maar die kan wat abstract zijn. Daarom extra text:
            if (e.response.data === "Email already exists") {
                toggleEmailExist(true);
                // const registerData = JSON.parse(e.config.data);
                // console.log(`Email (registerData): ${registerData.email}`);

            } else {
                setError(`Het registeren is mislukt. Probeer het opnieuw (${e.response.data})`);
            }

            // TIP: Wanneer er echt iets fout gaat, krijg je een 404 error. Wanneer de gebruikersnaam al bestond,
            // krijg je waarschijnlijk een 400 error.Zo kun je hier ook nog invloed uitoefenen op welke error message je laat zien op de gebruiker!
        }

        toggleLoading(true);
    }

    function loginExistingEmail() {
        history.push('/signin');
    }

    return (
        <>
            <h1>Registreren</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aspernatur atque consectetur, dolore eaque
                eligendi
                harum, numquam, placeat quisquam repellat rerum suscipit ullam vitae. A ab ad assumenda, consequuntur
                deserunt
                doloremque ea eveniet facere fuga illum in numquam quia reiciendis rem sequi tenetur veniam?</p>
            <form onSubmit={handleSubmit(onSubmit)}>
                <label htmlFor="email-field">
                    Email:
                    <input
                        type="email"
                        id="email-field"
                        {...register("email", {required: "Emailadres is verplicht"})}
                    />
                </label>
                {errors.email && <p className="error-message">{errors.email.message}</p>}
                <label htmlFor="username-field">
                    Gebruikersnaam:
                    <input
                        type="text"
                        id="username-field"
                        {...register("username",)}
                    />
                </label>
                <label htmlFor="password-field">
                    Wachtwoord:
                    <input
                        type="password"
                        id="password-field"
                        {...register("password", {
                            required: "Wachtwoord is verplicht",
                            minLength: {
                                value: 6,
                                message: "Minimaal 6 tekens gebruiken",
                            }
                        })}
                    />
                </label>
                {errors.password && <p className="error-message">{errors.password.message}</p>}
                <button
                    type="submit"
                    className="form-button"
                    disabled={loading}
                >
                    Maak account aan
                </button>
                {registerSuccess === true &&
                <p>Registeren is gelukt! Je wordt nu doorgestuurd naar de inlog pagina!</p>}

                {emailExist &&
                <p className="error-message">Het registeren is mislukt. Het ingevoerde email bestaat al. Ander <a
                    onClick={() => {
                        window.location.href = "/signup"
                    }}>emailadres </a>gebruiken of <a
                    onClick={loginExistingEmail}>inloggen</a> met dit emailadres!</p>}
            </form>
            <p>Heb je al een account? Je kunt je <Link to="/signin">hier</Link> inloggen.</p>
        </>
    );
}

export default SignUp;