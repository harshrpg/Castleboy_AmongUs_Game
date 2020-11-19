import React, { useState, useEffect } from 'react';
import data from './data/passwords.json';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getUserFromCode } from "../utils/util";
import dbConnect from '../utils/dbConnect';
import Player from '../models/Player';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  imposter: {
    background: 'linear-gradient(45deg, #cc2b5e 30%, #753a88 90%)',
    borderRadius: 3,
    border: 0,
    color: 'white',
    height: 48,
    padding: '0 30px',
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    margin: '1rem'
  },
  voting: {
    background: 'linear-gradient(45deg, #2193b0 30%, #6dd5ed 90%)',
    borderRadius: 3,
    border: 0,
    color: 'white',
    height: 48,
    padding: '0 30px',
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    margin: '1rem'
  },
  round: {
    background: 'linear-gradient(45deg, #56ab2f 30%, #a8e063 90%)',
    borderRadius: 3,
    border: 0,
    color: 'white',
    height: 48,
    padding: '0 30px',
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    margin: '1rem'
  },
  round_disabled: {
    background: 'linear-gradient(45deg, #bdc3c7 30%, #2c3e50 90%)',
    borderRadius: 3,
    border: 0,
    color: 'white',
    height: 48,
    padding: '0 30px',
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    margin: '1rem'
  },
  get_tasks: {
    background: 'linear-gradient(45deg, #9d50bb 30%, #6e48aa 90%)',
    borderRadius: 3,
    border: 0,
    color: 'white',
    height: 48,
    padding: '0 30px',
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    margin: '1rem'
  },
  label: {
    textTransform: 'uppercase',
  },
});

const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
}

export default function Lobby({ playersFromData }) {
  const classes = useStyles();
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
    const [ghosts, setGhosts] = useState(new Set())
    const [isImposter, setIsImposter] = useState(false);
    const [imposter, setImposter] = useState({});
    const [round, setRound] = useState(false);
    const [roundNumber, setRoundNumber] = useState(0)
    const [playNumber, setPlayNumber] = useState(0)
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
          if (playerFromData.kicked) {
            ghosts.add(playerFromData)
          } else {
            otherPlayers.add(playerFromData);
          }
          
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

    const assignImposter = () => {
      let randomInt = -1;
      do {
        setImposter({})
        randomInt = getRandomInt(playersFromData.length - 1);
        setImposter(playersFromData[randomInt]);
        setIsImposter(true);
        console.log("IMPOSTER:: ",playersFromData[randomInt]);
      } while (playersFromData[randomInt]['name'] === 'Admin');
      postImposter(playersFromData[randomInt]);
      alert('Imposter assigned');
    }

    const returnNewPlayer = (player) => {
      return {
        "name": player.name,
        "avatar_name": player.avatar_name,
        "color": JSON.stringify(Array.from(Object.entries(returnColorObject(player.color)))),
        "tasks": player.tasks,
        "imposter": player.imposter,
        "kicked": player.kicked,
        "voted": player.voted,
    }
    }

    const returnColorObject = (colorMap) => {
      return {
        "r": colorMap.get('r'),
        "g": colorMap.get('g'),
        "b": colorMap.get('b'),
        "a": colorMap.get('a'),
      }
    }

    const postImposter = async (imposter) => {
      playersFromData.map(async (player) => {
        let newPlayer = returnNewPlayer(player);
        if (newPlayer["name"] === imposter["name"]) {
          console.log("Imposter found");
          newPlayer.imposter = true;
        } else {
          newPlayer.imposter = false;
        }
        console.log(newPlayer);
        try {
          const res = await fetch('/api/players', {
            method: 'POST',
            headers: {
              Accept: contentType,
              'Content-Type': contentType,
            },
            body: JSON.stringify(newPlayer),
          })
          // Throw Error
          if (!res.ok) {
            throw new Error(res.status)
          }
        } catch (error) {
          setMessage('Failed to add player');
        }
      })
    }

    const startRound = () => {
      let rN = roundNumber + 1;
      setRoundNumber(rN);
      setRound(true);
      let roundData = {
        "number": rN,
        "imposter_name": imposter.name,
        "winner": "None",
      }
      postRoundData(roundData);
    }

    const postRoundData = async (roundData) => {
      try {
        const res = await fetch('/api/rounds', {
          method: 'POST',
          headers: {
            Accept: contentType,
            'Content-Type': contentType,
          },
          body: JSON.stringify(roundData),
        })
        // Throw Error
        if (!res.ok) {
          throw new Error(res.status)
        }
      } catch (error) {
        setMessage('Failed to add round');
      }
    }

    const gotToTasks = () => {
      router.push({
        pathname: "/tasks",
        query: {pass: pass}
      })
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
                  <>
                    <p className="description">Round Status:  
                    {
                      round
                      ?
                      <span> Started</span>:<span> Not Started</span>
                    }
                    </p>
                    <span>Active Players: {otherPlayers.size}</span>
                    <span>Ghosts: {ghosts.size}</span>
                    {
                      isImposter
                      ?<span>Imposters: 1</span>
                      :<span>Imposters: 0</span>
                    }
                    
                  </>
                  :
                    vote
                  ?
                    <p className="description">You have voted now</p>
                  :
                    null
                }
                
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
                                    <div className="card-content-child-color" style={{backgroundColor: `rgba(${parseInt(otherPlayer.color.get('r'))}, ${parseInt(otherPlayer.color.get('g'))}, ${parseInt(otherPlayer.color.get('b'))}, ${parseInt(otherPlayer.color.get('a'))})`}} >
                                      
                                    </div>
                                  </div>
                                    
                                </div>
                            </div>
                        
                    ))}
                    <Button classes={{
                                      root: classes.voting,
                                      label: classes.label,
                                    }} variant="contained">Voting Results</Button>
                    
                    {
                      isImposter
                      ?
                      <>
                      <Button classes={{
                        root: classes.imposter,
                        label: classes.label,
                      }} variant="contained" disabled>Assign Imposter</Button>
                      <Button classes={{
                        root: classes.round,
                        label: classes.label,
                      }} variant="contained" onClick={startRound}>
                        Start Round
                      </Button>
                      </>
                      :
                      <>
                      <Button classes={{
                        root: classes.imposter,
                        label: classes.label,
                      }} variant="contained" onClick={assignImposter}>Assign Imposter</Button>
                      <Button classes={{
                        root: classes.round,
                        label: classes.label,
                      }} variant="contained" disabled>
                        Start Round
                      </Button>
                      </>
                    }
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
                  <Button classes={{
                        root: classes.get_tasks,
                        label: classes.label,
                      }} variant='contained' onClick={gotToTasks}>
                    Get Your Tasks
                  </Button>
                  </div>
                
                }
                
            </main>
            <style jsx>
                {
                    `
                      #voting-result-btn {
                        margin: 0.25rem;
                      }
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