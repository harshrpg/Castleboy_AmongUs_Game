import React, { useState, useEffect } from 'react';
import data from './data/passwords.json';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getUserFromCode } from "../utils/util";
import dbConnect from '../utils/dbConnect';
import Player from '../models/Player';
import Button from '@material-ui/core/Button';

export default function Lobby({ playersFromData }) {
    const {
        query: { pass },
      } = useRouter();
    const router = useRouter();
    const contentType = 'application/json';
    const [authenticated, setAuthenticated] = useState(false);
    const [load, setLoad] = useState(false);
    const [user, setUser] = useState('');
    const [errors, setErrors] = useState({})
    const [message, setMessage] = useState('')
    const [player, setPlayer] = useState({})
    const [otherPlayers, setOtherPlayers] = useState(new Set())
    const [admin, setAdmin] = useState(false)
    const [vote, setVote] = useState(false)
    useEffect(() => {

        let query_vals = getUserFromCode(pass);
        let pwd = query_vals[0];
        let ifLoad = query_vals[1] != '' ? true : false;
        setLoad(ifLoad);
        data.map((val) => {
            if (pwd in val) {
                setAuthenticated(true);
                setUser(query_vals[1]);
                if (query_vals[1] === 'admin') {
                  setAdmin(true);
                } else {
                  setAdmin(false);
                }
            }
        });

        currentUserDataFromPlayers(query_vals[1]);
        console.log(player);
        
    },[player]);
    
    const currentUserDataFromPlayers = (user_name) => {
      playersFromData.map((playerFromData) => {
        if (typeof playerFromData.color === "string") {
          playerFromData.color = new Map(JSON.parse(playerFromData.color))
        }
        if (user_name != 'admin' && playerFromData.name === user_name) {
          setPlayer(playerFromData);
          setVote(playerFromData.voted);
        } else {
          otherPlayers.add(playerFromData);
        }
      })
    }

    useEffect(() => {
      console.log("Changes occured in player");
    }, [vote])

    const recordVoting = (otherPlayer) => {
      player.voted = true;
      setVote(player.voted);
      console.log('Voting recorder');
      console.log(player);
      postData(otherPlayer)
    }

    const postData = async (otherPlayer) => {
      let voteData = {
        "name": player.name,
        "voted": otherPlayer
      };
      try {
        const res = await fetch('/api/votes', {
          method: 'POST',
          headers: {
            Accept: contentType,
            'Content-Type': contentType,
          },
          body: JSON.stringify(voteData),
        })
        // Throw Error
        if (!res.ok) {
          throw new Error(res.status)
        }

        router.push({
                pathname: "/lobby",
                query: {pass: pass}
        });
      } catch (error) {
        setMessage('Failed to vote');
      }
    }

    return (
        <div>
            <Head>
                <title>Welcome to Lobby {user}</title>
            </Head>
            <main>
                <h1 className='title'>
                    Welcome {user}
                </h1>
                {
                  user === 'Admin'
                  ?
                  <div className="grid">
                    
                    {Array.from(otherPlayers).map((otherPlayer) => (
                      
                        <div key={otherPlayer._id}>
                                
                                <div className="card">
                                  <div className="card-content">
                                    <div className="card-content-child-names-action">
                                      <div className="card-content-child-names">
                                        <h3>{otherPlayer.avatar_name} </h3>
                                        <p>{otherPlayer.name}</p>
                                      </div>
                                      <div className="card-content-child-action">
                                                    {
                                            player.kicked ? player.imposter ?
                                            <p>Imposter kicked</p>
                                            :<p>Crewmate Kicked</p>:
                                            <p>Player active</p>
                                          }
                                      </div>
                                    </div>
                                    <div className="card-content-child-color" style={{backgroundColor: `rgba(${otherPlayer.color.get('r')}, ${otherPlayer.color.get('g')}, ${otherPlayer.color.get('b')}, ${otherPlayer.color.get('a')})`}} >
                                      
                                    </div>
                                  </div>
                                    
                                </div>
                            </div>
                        
                    ))}
                </div>
                
                  :
                  <div className="grid">
                  <div key={player._id}>   
                      <div className="card self">
                      <div className="card-content">
                        <div className="card-content-child-names-action">
                          <div className="card-content-child-names">
                            <h3>{player.avatar_name} </h3>
                            <p>{player.name}</p>
                          </div>
                          <div className="card-content-child-action">
                            {
                              player.imposter ?
                              <p>Imposter</p>
                              :
                              <p>Crewmate</p>
                            }
                          </div>
                        </div>
                        {player.color === undefined? null :  <div className="card-content-child-color" style={{backgroundColor: `rgba(${player.color.get('r')}, ${player.color.get('g')}, ${player.color.get('b')}, ${player.color.get('a')})`}} >
                          
                          </div>}
                        
                      </div>
                      </div>
                    </div>
                    
                    {Array.from(otherPlayers).map((otherPlayer) => (

                      <>
                        {
                          otherPlayer.name != 'Admin'
                          ?
                          <div key={otherPlayer._id}>
                                {console.log(otherPlayer)}
                                <div className="card">
                                  <div className="card-content">
                                    <div className="card-content-child-names-action">
                                      <div className="card-content-child-names">
                                        <h3>{otherPlayer.avatar_name} </h3>
                                        <p>{otherPlayer.name}</p>
                                      </div>
                                      <div className="card-content-child-action">
                                        {
                                          vote ?
                                          <Button variant="outlined" disabled>
                                            Vote
                                          </Button>
                                          :
                                          <Button variant="outlined" color="primary" onClick={() => recordVoting(otherPlayer.name)}>
                                            Vote
                                          </Button>
                                        }
                                      </div>
                                    </div>
                                    <div className="card-content-child-color" style={{backgroundColor: `rgba(${otherPlayer.color.get('r')}, ${otherPlayer.color.get('g')}, ${otherPlayer.color.get('b')}, ${otherPlayer.color.get('a')})`}} >
                                      
                                    </div>
                                  </div>
                                    
                                </div>
                            </div>
                          :
                          null
                        }
                        </>
                    ))}
                </div>
                
                }
                
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
                            display: flex;
                            margin: 1rem;
                            flex-basis: 50%;
                            padding: 1.5rem;
                            text-align: left;
                            color: inherit;
                            text-decoration: none;
                            border: 1px solid #eaeaea;
                            border-radius: 10px;
                            transition: color 0.15s ease, border-color 0.15s ease;
                          }

                          .card-content {
                            display: flex;
                            flex-grow: 1;
                            order: 1;
                            height: 100%;
                            justify-content: space-between;
                          }

                          .self {
                            border-color: #76FF03;
                            background-color: #DCEDC8;
                          }

                          .card-content-child-color {
                            order: 2;
                            flex-grow: 2;
                            border: 2px solid #eaeaea;
                            border-radius: 10px;
                            width: 5rem;
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
                          .card-content-child-names-action {
                            display: flex;
                            order: 1;
                            flex-grow: 4;
                            margin-right: 1em;
                            align-items: center;
                          }

                          .card-content-child-names {
                            margin-right: 1em;
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

    return { props: { playersFromData: players } }
}