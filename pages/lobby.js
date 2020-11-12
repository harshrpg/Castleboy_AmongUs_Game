import React, { useState, useEffect } from 'react';
import data from './data/passwords.json';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getUserFromCode } from "../utils/util";
import dbConnect from '../utils/dbConnect';
import Player from '../models/Player';

export default function Lobby({ players }) {
    const {
        query: { pass },
      } = useRouter();
    const router = useRouter();
    const [authenticated, setAuthenticated] = useState(false);
    const [load, setLoad] = useState(false);
    const [user, setUser] = useState('');
    const [errors, setErrors] = useState({})
    const [message, setMessage] = useState('')
    const [player, setPlayer] = useState({})
    const [otherPlayers, setOtherPlayers] = useState({})
    useEffect(() => {

        let query_vals = getUserFromCode(pass);
        let pwd = query_vals[0];
        let ifLoad = query_vals[1] != '' ? true : false;
        setLoad(ifLoad);
        data.map((val) => {
            if (pwd in val) {
                setAuthenticated(true);
                setUser(query_vals[1]);
            }
        });
        
    },[]);

    return (
        <div>
            <Head>
                <title>Welcome to Lobby {user}</title>
            </Head>
            <main>
                <h1 className='title'>
                    Welcome {user}
                </h1>
                <div className="grid">
                    {players.map((player) => (
                        <div key={player._id}>
                            
                                <div className="card">
                                    <h3>{player.avatar_name} </h3>
                                </div>
                            </div>
                        
                    ))}
                </div>
                
            </main>
            <style jsx>
                {
                    `
                        input {
                            width: 100%; 
                            border-style: solid;
                            border-width: 0px 0px 1px 0px;
                        }
                        main {
                            padding: 5rem 0;
                            flex: 1;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            font-family: sofia;
                        }

                        .title a {
                            color: #0070f3;
                            text-decoration: none;
                          }
                  
                          .title a:hover,
                          .title a:focus,
                          .title a:active {
                            text-decoration: underline;
                          }
                  
                          .title {
                            margin: 0;
                            line-height: 1.15;
                            font-size: 2rem;
                          }
                  
                          .title,
                          .description {
                            text-align: center;
                          }
                  
                          .description {
                            line-height: 1.5;
                            font-size: 1.5rem;
                          }
                          .grid {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            flex-wrap: wrap;
                  
                            max-width: 800px;
                            margin-top: 3rem;
                          }
                  
                          .card {
                            margin: 1rem;
                            flex-basis: 45%;
                            padding: 1.5rem;
                            text-align: left;
                            color: inherit;
                            text-decoration: none;
                            border: 1px solid #eaeaea;
                            border-radius: 10px;
                            transition: color 0.15s ease, border-color 0.15s ease;
                          }

                          .pointer {
                              cursor: pointer;
                          }
                  
                          .card:hover,
                          .card:focus,
                          .card:active {
                            color: #0070f3;
                            border-color: #0070f3;
                          }
                  
                          .card h3 {
                            margin: 0 0 1rem 0;
                            font-size: 1.5rem;
                          }
                  
                          .card p {
                            margin: 0;
                            font-size: 1.25rem;
                            line-height: 1.5;
                          }
                  
                          .logo {
                            height: 1em;
                          }
                  
                          @media (max-width: 600px) {
                            .grid {
                              width: 100%;
                              flex-direction: column;
                            }
                          }

                        @font-face {
                            font-family: "sofia";
                            src: url("/fonts/sofia.ttf");
                          }
                    `
                }
            </style>
        </div>
    )
}

export async function getServerSideProps() {
    await dbConnect();

    const result = await Player.find({})
    const players = result.map((doc) => {
        const player = doc.toObject()
        player._id = player._id.toString()
        return player
    });

    return { props: { players: players } }
}