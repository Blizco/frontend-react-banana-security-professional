import React, {useContext} from 'react';
import axios from "axios";
import {Link} from 'react-router-dom';
import {AuthContext} from '../context/AuthContext';
import {useForm} from 'react-hook-form';

function SignIn() {
    const {login} = useContext(AuthContext);
    const {handleSubmit, register, formState: {errors}} = useForm();

    async function onSubmit(data) {

        try {
            const result = await axios.post('http://localhost:3000/login', {
                email: data.email,
                password: data.password,
            });
            // geef de JWT door aan de context
            login(result.data.accessToken);
        } catch (e) {
            console.error(e);
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
                        {...register("email", {required: "Emailadres is verplicht"})}
                    />
                </label>
                {errors.email && <h4>{errors.email.message}</h4>}

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
                    Inloggen
                </button>
            </form>

            <p>Heb je nog geen account? <Link to="/signup">Registreer</Link> je dan eerst.</p>
        </>
    );
}

export default SignIn;
