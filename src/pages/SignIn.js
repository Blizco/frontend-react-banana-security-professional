import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useForm } from 'react-hook-form';


function SignIn() {
    const {login, enteredEmail} = useContext(AuthContext);
    const {handleSubmit, register, formState: {errors}} = useForm();
    const [error, setError] = useState('');
    const source = axios.CancelToken.source();

    // mocht onze pagina ge-unmount worden voor we klaar zijn met data ophalen, aborten we het request
    useEffect(() => {
        return function cleanup() {
            source.cancel();
        }
    }, []);

    async function onSubmit(data) {
        // omdat onSubmit meerdere keren kan worden aangeroepen, beginnen we altijd met een "schone" lei (geen errors)
        setError('');

        try {
            const result = await axios.post('http://localhost:3000/login', {
                    email: data.email,
                    password: data.password,
                },
                {
                    cancelToken: source.token,
                });

            // geef de JWT door aan de context
            login(result.data.accessToken);

        } catch (e) {
            // op het error (e) object zit altijd een message property, maar die kan wat abstract zijn. Daarom extra text:
            if (e.response.data === "Cannot find user") {
                setError(`Het inloggen is mislukt. Emailadres is onbekend!`);
            } else if (e.response.data === "Incorrect password") {
                setError(`Het inloggen is mislukt. Wachtwoord onjuist!`);
            } else {
                setError(`Het inloggen is mislukt. Probeer het opnieuw of registreer eerst (${e.response.data})`);
            }
        }
    }

    return (
        <>
            <h1>Inloggen</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab alias cum debitis dolor dolore fuga id
                molestias qui quo unde?</p>

            <form onSubmit={handleSubmit(onSubmit)}>
                <label htmlFor="email-field">
                    Emailadres:
                    <input
                        type="email"
                        id="email-field"
                        {...register("email", {
                            required: "Emailadres is verplicht", value: (enteredEmail)
                        })
                        }
                    />
                </label>
                {errors.email && <h4>{errors.email.message}</h4>}

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
                {errors.password && <h4>{errors.password.message}</h4>}

                <button
                    type="submit"
                    className="form-button"
                >
                    Inloggen
                </button>
                {error && <p className="error-message">{error}</p>}
            </form>

            <p>Heb je nog geen account? <Link to="/signup">Registreer</Link> je dan eerst.</p>
        </>
    );
}

export default SignIn;
