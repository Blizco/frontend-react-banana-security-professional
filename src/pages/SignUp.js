import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AuthContext } from "../context/AuthContext";

function SignUp() {
    // useForm Hooks ipv controlled components met useState email, username en password
    const {handleSubmit, register, formState: {errors}} = useForm( {mode: "onBlur"});

    // state voor functionaliteit (useContext)
    const {loading, registerSuccess, emailExist, onSignUp, loginExistingEmail} = useContext(AuthContext);

    return (
        <>
            <h1>Registreren</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aspernatur atque consectetur, dolore eaque
                eligendi
                harum, numquam, placeat quisquam repellat rerum suscipit ullam vitae. A ab ad assumenda, consequuntur
                deserunt
                doloremque ea eveniet facere fuga illum in numquam quia reiciendis rem sequi tenetur veniam?</p>
            <form onSubmit={handleSubmit(onSignUp)}>
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

                {registerSuccess &&
                <p className="normal-message">Het registreren is gelukt! Klik button voor inloggen met ingevulde email-adres!
                    <button
                        type="button"
                        className="popup-button"
                        onClick={loginExistingEmail}
                        >
                        Inloggen met ingevulde email-adres
                    </button>
                </p>}

                {emailExist &&
                <p className="error-message">Het registeren is mislukt. Het ingevulde email-adres bestaat al.
                    <button
                        type="button"
                        className="popup-button"
                        onClick={() => {
                            window.location.href = "/signup"
                        }}
                    >
                        Ander email-adres gebruiken
                    </button>
                    <button
                        type="button"
                        className="popup-button"
                        onClick={loginExistingEmail}
                    >
                        Inloggen met ingevulde email-adres
                    </button>
                </p>}
            </form>
            <p>Heb je al een account? Je kunt je <Link to="/signin">hier</Link> inloggen.</p>
        </>
    );
}

export default SignUp;