import React, {useState} from 'react';
import axios from "axios";
import {Link, useHistory} from 'react-router-dom';
import {useForm} from 'react-hook-form';

function SignUp() {
    const [loading, toggleLoading] = useState(false);
    const [error, setError] = useState('');
    const [emailExists, toggleEmailExists] = useState(false)
    const [registerSuccess, toggleRegisterSuccess] = useState(false);

    const history = useHistory();
    const {handleSubmit, register, formState: {errors}} = useForm();

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
            });

            console.log(result);
            // als deze console.log wordt uitgevoerd is alles goed gegaan, want we zijn niet naar het catch blok gesprongen
            // in de console zie je de gebruikelijke respons en daarin ook 'status: 201'

            toggleRegisterSuccess(true);

            // we willen even wachten met doorlinken zodat de gebruiker de tijd heeft om de succesmelding ook daadwerkelijk te zien
            setTimeout(() => {
                history.push('/signin');
            }, 3000);
        } catch(e) {

            // op het error (e) object zit altijd een message property, maar die kan wat abstract zijn. Daarom extra text:
            if (e.response.data === "Email already exists") {
                toggleEmailExists(!emailExists);
                setError(`Het registeren is mislukt. Het ingevoerde email bestaat al. Probeer hiermee in te loggen)`);
            } else {
                setError(`Het registeren is mislukt. Probeer het opnieuw (${e.message})`);

            }

            // TIP: Wanneer er echt iets fout gaat, krijg je een 404 error. Wanneer de gebruikersnaam al bestond,
            // krijg je waarschijnlijk een 400 error.Zo kun je hier ook nog invloed uitoefenen op welke error message je laat zien op de gebruiker!
        }

        toggleLoading(false);
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
                    {emailExists && <h4>Email bestaat al. Log in met dit emailadres!</h4>}
                </label>
                {errors.email && <h4>{errors.email.message}</h4>}

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
                        {...register("password", {required: "Wachtwoord is verplicht",
                            minLength: {
                                value: 6,
                                message: "Minimaal 6 tekens gebruiken",
                            }
                        })}
                    />
                </label>
                {errors.password && <h4>{errors.password.message}</h4>}
                <button
                    type="submit"
                    className="form-button"
                >
                    Maak account aan
                </button>
                {registerSuccess === true &&  <p>Registeren is gelukt! Je wordt nu doorgestuurd naar de inlog pagina!</p>}
                {error && <p className="error-message">{error}</p>}
            </form>
            <p>Heb je al een account? Je kunt je <Link to="/signin">hier</Link> inloggen.</p>
        </>
    );
}

export default SignUp;