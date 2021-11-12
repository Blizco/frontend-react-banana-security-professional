import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Profile() {
    const [privateContent, setPrivateContent] = useState({});

    const { user } = useContext(AuthContext);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const source = axios.CancelToken.source();

        async function getPrivateContent() {
            try {
                const result = await axios.get('http://localhost:3000/660/private-content', {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`},
                        cancelToken:source.token,
                });

                setPrivateContent(result.data);
            } catch(e) {
                console.error(e);
            }
        }

        getPrivateContent();

        return function cleanup() {
            source.cancel();

        }
    }, []);

  return (
    <>
      <h1>Profielpagina</h1>
      <section>
        <h2>Gegevens</h2>
          {user &&
          <>
              <p><strong>Gebruikersnaam:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
          </>
          }
      </section>
        {privateContent &&
        <section>
            <h2>Afgeschermde content voor ingelogde gebruikers</h2>
            <h3>{privateContent.title}</h3>
            <p>{privateContent.content}</p>
        </section>
        }
        <p>Terug naar de <Link to="/">Homepagina</Link></p>
    </>
  );
}

export default Profile;