import React, { useState, useEffect } from 'react';
import data from './data/passwords.json';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getUserFromCode, convertVotingResultsToDisplayFormat, findIfVotedIsImposter } from "../utils/util";
import dbConnect from '../utils/dbConnect';
import Player from '../models/Player';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import { CardMedia } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import CardActionArea from '@material-ui/core/CardActionArea';
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
    margin: '1rem',
  },
  label: {
    textTransform: 'uppercase',
  },
  paper: {
    height: 140,
    width: 100,
  },
  image: {
    width: 128,
    height: 128,
  },
  img: {
    margin: 'auto',
    display: 'block',
    maxWidth: '100%',
    maxHeight: '100%',
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
    const [activeplayers, setActiveplayers] = useState(new Set())
    const [admin, setAdmin] = useState(false)
    const [vote, setVote] = useState(false)
    const [ghosts, setGhosts] = useState(new Set())
    const [isImposter, setIsImposter] = useState(false);
    const [imposter, setImposter] = useState([]);
    const [round, setRound] = useState(false);
    const [roundNumber, setRoundNumber] = useState(1)
    const [playerNumber, setPlayerNumber] = useState(0)
    const [showVoting, setShowVoting] = useState(false)
    const [votingResults, setVotingResults] = useState(new Map())
    const [result, setResult] = useState({})
    const [numberofimposters, setNumberofimposters] = useState(1)
    const [ghostNumber, setGhostNumber] = useState(0);

    // ################# EFFECTS ###################
    useEffect(() => {
        setShowVoting(false);
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
        // console.debug(player);
        
    },[player]);
    
    useEffect(() => {
      setShowVoting(true);
    }, [votingResults]);

    useEffect(() => {
      if (imposter instanceof Array) {
        setNumberofimposters(imposter.length);
        console.info('TOTAL ACTIVE IMPOSTERS: ', imposter.length);
      }
    }, [imposter]);

    useEffect(() => {
      if (ghosts instanceof Set) {
        setGhostNumber(ghosts.size);
        console.info('TOTAL INACTIVE PLAYERS (GHOSTS): ', ghosts.size);
        if (ghosts.size > 0) {
          console.info('UPDATING GHOSTS ON SERVER');
          ghosts.forEach((ghost) => {
            ghost.kicked = true;
            updatePlayerOnServer(ghost);
          })
        }
      }
    }, [ghosts]);

    useEffect(() => {
      if (activeplayers instanceof Set) {
        setPlayerNumber(activeplayers.size);
        console.info('TOTAL ACTIVE PLAYERS: ', activeplayers.size);
      }
      
    }, [activeplayers]);

    useEffect(() => {
      console.log('====================================');
      console.log('OTHER PLAYERS CHANGED HERE: ', otherPlayers);
      console.log('====================================');
    }, [otherPlayers])


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
            activeplayers.add(playerFromData);
          }
          otherPlayers.add(playerFromData);
          
        }
      });
      
    }

    
    const displayVotingResults = () => {
      try {
        fetch('/api/votes', {
          method: 'GET',
        }).then(response => response.json()).then(data => processVotingResult(data))
        // Throw Error
        // if (!res.ok) {
        //   throw new Error(res.status)
        // } else {
        //   console.debug('====================================');
        //   console.debug(res.json());
        //   console.debug('====================================');
        // }
      } catch (error) {
        console.error(error);
      }
      
    }

    const processVotingResult = (votingResult) => {
      console.info('PROCESSING VOTING RESULTS');
      console.debug('====================================');
      console.debug(votingResult.data);
      console.debug('====================================');
      let reformatVotingResult = convertVotingResultsToDisplayFormat(votingResult.data)
      console.debug('====================================');
      console.debug(reformatVotingResult);
      console.debug('====================================');
      // setShowVoting(true);
      setVotingResults(reformatVotingResult);
      let ghosted = findIfVotedIsImposter(reformatVotingResult, imposter, activeplayers);
      console.debug('====================================');
      console.debug("GHOST RESULTS");
      console.debug(ghosted);
      console.debug('====================================');
      setResult(ghosted);
      console.debug('====================================');
      console.debug('Resetting the number of active imposters');
      if (ghosted !=undefined && ghosted.type != undefined && ghosted.player != undefined) {
        if (ghosted.type === 'imposter'){
          // TODO: Remove Imposters from imposter array
          removeGhostedImposter(ghosted.player);
          // TODO: Add Imposter to Ghost array
          // TODO: Make useEffect() when imposter array changes or ghost array changes to post that data to server
        }
        if (ghosted.type === 'crewmate') {
          // TODO: Add player to ghost array
          addPlayerToGhosts(ghosted.player);
        }


      }
      console.debug('====================================');
      // Send this ghosted data to server
      // prepareGhostDataAndUpdateServer(ghosted);
    }
    
    const removeGhostedImposter = (ghostedImposterName) => {
      
      if (imposter != undefined && imposter instanceof Array && ghostedImposterName != undefined) {
        console.info('====================================');
        console.info('Removing Imposter from List of Imposters');
        console.info('====================================');
        let newImposter = []
        imposter.map((imp) => {
          if (imp.name != ghostedImposterName) {
            imp.kicked = true;
            newImposter.push(imp);
            // let newPlayer = returnNewPlayer(imp);
            updatePlayerOnServer(imp);
          }
        });

        setImposter(newImposter);
        addPlayerToGhosts(ghostedImposterName);
      }

    }

    const addPlayerToGhosts = (ghostedPlayerName) => {
      let newOtherPlayers = new Set();
      console.log(ghosts);
      console.log(activeplayers);
      console.log(ghostedPlayerName.value);
      if (ghosts != undefined && ghosts instanceof Set && ghostedPlayerName != undefined && activeplayers != undefined) {
        console.info('====================================');
        console.info('Adding removed Player to Ghosts');
        console.info('====================================');
        activeplayers.forEach((player) => {
          if (player.name === ghostedPlayerName.value) {
            player.kicked = true;
            console.log('PLAYER BEING GHOSTED: ', player);
            let newGhost = returnNewPlayer(player);
            ghosts.add(newGhost);
            updatePlayerOnServer(newGhost);
          } else {
            newOtherPlayers.add(player);
          }
        });
        setActiveplayers(newOtherPlayers);
        setGhosts(ghosts);
        setGhostNumber(ghosts.size);  
        console.log(ghosts);
      }
    }

    const prepareGhostDataAndUpdateServer = (ghost) => {
      let newPlayer = {}
      if (ghost != undefined && ghost.type != undefined && ghost.player != undefined && playersFromData != undefined) {
        console.debug("Updating server with ghost data:  ", ghost);
        playersFromData.map((player) => {
          if (player.name === ghost.player) {
            console.debug(ghost.player, " is ghosted and is a ", ghost.type);
            newPlayer = returnNewPlayer(player);
            if (ghost.type === "imposter") {
              newPlayer.imposter = true;
            } else if (ghost.type === "crewmate") {
              newPlayer.kicked = true;
            }
          }
        });
        console.debug("Updating Player: ", newPlayer);
        if (newPlayer.name != null){
          
          console.log('====================================');
          console.log('THIS IMPOSTER IS SUPPOSED TO BE LOADED IN SERVER', newPlayer);
          console.log('====================================');
        }
          // updatePlayerOnServer(newPlayer);
      }
      
      
    }

    const recordVoting = (otherPlayer) => {
      player.voted = true;
      setVote(player.voted);
      console.debug('Voting recorder');
      console.debug(player);
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
      // let numberImposterArray = Array(numberofimposters).fill();
      // console.debug(numberImposterArray);
      Array(numberofimposters).fill().map((_, i) => asignAndPost(i));
      setRound(true);
      let roundData = {
        "number": roundNumber,
        "imposter_name": imposter.name,
        "winner": "None",
      }
      postRoundData(roundData);
    }

    const asignAndPost = (i) => {
      let randomInt = -1;
      let newRandom = -1;
      do {
        newRandom = getRandomInt(playersFromData.length - 1);
      } while(newRandom === randomInt || newRandom == -1 || playersFromData[newRandom]['name'] === 'Admin')
      randomInt = newRandom;
      let newImposter = playersFromData[randomInt]
      postImposter(newImposter);
      alert('Imposter assigned');
      console.debug('Imposter ', i, 'assigned');
    }

    const returnNewPlayer = (player) => {
      if (player.name != null) {
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
      
    }

    const returnColorObject = (colorMap) => {
      if (colorMap != undefined) {
        return {
          "r": colorMap.get('r'),
          "g": colorMap.get('g'),
          "b": colorMap.get('b'),
          "a": colorMap.get('a'),
        }
      }
      
    }

    const updatePlayerOnServer = async (newPlayer) => {
      console.debug('====================================');
      console.debug('THE PLAYER TO UPLOAD IS: ', newPlayer);
      console.debug('====================================');
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
    }

    const postImposter = async (newImposter) => {
      let newPlayer = returnNewPlayer(newImposter);
      newPlayer.imposter = true;
      console.debug("New Player (Imposter)", newPlayer);
      imposter.push(newPlayer);
      setIsImposter(true);
      if (newPlayer.name != null) {
        updatePlayerOnServer(newPlayer);
      }
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

    const resetRound = () => {
      setRound(false);
      setShowVoting(false);
      
    }

    const restartRound = () => {
      console.warn("Restarting Round now");
      console.debug(playersFromData);
      setIsImposter(false);
      setRound(false);
      console.debug(imposter);
      resetImpostersOnServer();
      console.debug("All players crewmate");

      resetGhostsOnServer();
      console.debug("All ghosts reset");

      // resetActivePlayers();
      setActiveplayers(new Set(otherPlayers));
    }
    
    const resetImpostersOnServer = () => {
      if (imposter != undefined && imposter.size != 0) {
        
        imposter.map((imp, i) => {
          console.debug('Imposter: ', i, ": ", imp);
          imp.imposter = false;
          if (imp.name != null) {
            updatePlayerOnServer(imp);
          }
        });
        
        setImposter([]);
      }
    }

    const resetGhostsOnServer = () => {
      if (ghosts != undefined && ghosts.size != 0) {
        ghosts.forEach((ghost) => {
          ghost.imposter = false;
          ghost.kicked = false;
          ghost.voted = false;
          if (ghost.name != null) {
            updatePlayerOnServer(ghost);
          }
        });
        setGhosts(new Set());
      }
    }

    return (
        <div>
            <Head>
                <title>Welcome to Lobby {user}</title>
            </Head>
            <main>
                <h1 className='title'>
                    Lobby
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
                    <p>
                      Select Number of Imposters
                      <ButtonGroup color="secondary" aria-label="outlined primary button group" style={{marginLeft: '1rem'}}>
                        <Button onClick={() => setNumberofimposters(1)} variant={imposter.length != 0 && imposter.length===1 ? "contained": imposter.length != 0 && imposter.length===2 ? "outlined": numberofimposters===1 ? "contained": "outlined"}>One</Button>
                        <Button onClick={() => setNumberofimposters(2)} variant={imposter.length != 0 && imposter.length===2 ? "contained": imposter.length != 0 && imposter.length===1 ? "outlined": numberofimposters===2 ? "contained": "outlined"}>Two</Button>
                      </ButtonGroup>
                    </p>
                    <span>Active Players: {playerNumber}</span>
                    <span>Ghosts: {ghostNumber}</span>
                    <span>Imposters: {numberofimposters}</span>
                    
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
                    showVoting
                      ?
                        // ADMIN PAGE: SHOW VOTING
                        <>
                          <Container maxWidth="sm">
                            {console.debug(result)}
                            
                          {
                            result != undefined ?
                            result.type != undefined 
                            ? 
                              result.type === 'imposter' 
                              ?
                                <Grid
                                container
                                direction="column"
                                justify="center"
                                alignItems="center"
                                spacing={4}
                                >
                                  <Grid item>
                                    <Card style={{width: 345, background: 'transparent'}}>
                                      <CardActionArea>
                                          <CardMedia
                                            style={{height: 200}}
                                            image="/images/imposter2.jpg"
                                          />
                                      </CardActionArea>
                                    </Card>
                                    
                                  </Grid>
                                  <Grid item>
                                      <span className="title">
                                        Imposter: {result.player.value}  found
                                      </span>
                                  </Grid>
                                </Grid>
                                
                              : 
                                result.type === 'crewmate' 
                                ?
                                  <Grid
                                  container
                                  direction="column"
                                  justify="center"
                                  alignItems="center"
                                  spacing={4}
                                >
                                  <Grid item>
                                <Card style={{width: 345, background: 'transparent'}}>
                                  <CardActionArea>
                                      <CardMedia
                                        style={{height: 200}}
                                        image="/images/crewmate.jpg"
                                      />
                                  </CardActionArea>
                                </Card>
                                
                              </Grid>
                                  <Grid item>
                                    <span className="title">
                                      Crewmate: {result.player.value} Ghosted
                                    </span>
                                  </Grid>
                                </Grid>
                                :
                                  null
                            :
                              <Grid
                                container
                                direction="column"
                                justify="center"
                                alignItems="center"
                                spacing={4}
                              >
                                <Grid item>
                                  <Card style={{width: 345, background: 'transparent'}}>
                                    <CardActionArea>
                                        <CardMedia
                                          style={{height: 200}}
                                          image="/images/killer_loose.jpg"
                                        />
                                    </CardActionArea>
                                  </Card>
                                  
                                </Grid>
                                <Grid item>
                                    <span className="title">
                                      No one was ghosted
                                    </span>
                                </Grid>
                              </Grid>
                            : <Grid
                            container
                            direction="column"
                            justify="center"
                            alignItems="center"
                            spacing={4}
                          >
                            <Grid item>
                              <Card style={{width: 345, background: 'transparent'}}>
                                <CardActionArea>
                                    <CardMedia
                                      style={{height: 200}}
                                      image="/images/killer_loose.jpg"
                                    />
                                </CardActionArea>
                              </Card>
                              
                            </Grid>
                            <Grid item>
                                <span className="title">
                                  No one was ghosted
                                </span>
                            </Grid>
                          </Grid>
                          }
                        </Container>
                          <Grid container justify="center" spacing={4} direction="column" alignItems="center">

                            {
                              Array.from(votingResults.keys()).map((key) => {
                                return (
                                <div className="paper">
                                  <Grid key={key} item>
                                    <Grid item xs={12} sm container spacing={2}>
                                      <Typography gutterBottom variant="h4">
                                        {key}
                                      </Typography>
                                      <Grid item xs container spacing={2}>
                                        <Grid item xs spacing={2}>
                                        {
                                          votingResults.get(key).map((voter) => (
                                            <div key={voter} style={{padding: "0.5rem"}}>
                                              <Typography key={voter} variant="title" gutterBottom>
                                                {voter} 
                                              </Typography>
                                            </div>
                                            
                                          ))
                                        }
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </div>
                              )})
                            }
                          <Button classes={{
                                            root: classes.voting,
                                            label: classes.label,
                                          }} variant="contained" onClick={resetRound}>Back to Lobby</Button>  
                        </Grid>
                        </>
                      :
                        // ADMIN PAGE: SHOW PLAYERS
                        <Grid container justify="center" spacing={2} direction="column" alignItems="center">
                          <Grid item container justify="center" spacing={1} alignItems="center">
                            {
                              Array.from(otherPlayers).map((otherPlayer) => (
                                
                                otherPlayer.name != null
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
                                                otherPlayer.kicked 
                                                  ? 
                                                  otherPlayer.imposter 
                                                      ?
                                                        <p>Imposter kicked</p>
                                                      :
                                                        <p>Crewmate Kicked</p>
                                                  :
                                                    <p>Player active</p>
                                              }
                                          </div>
                                        </div>
                                        <div className="card-content-child-color" style={{backgroundColor: `rgba(${parseInt(otherPlayer.color.get('r'))}, ${parseInt(otherPlayer.color.get('g'))}, ${parseInt(otherPlayer.color.get('b'))}, ${parseInt(otherPlayer.color.get('a'))})`}} >
                                        </div>
                                      </div>
                                              
                                    </div>
                                  </div> 
                                :
                                  null
                              ))
                            }
                          </Grid>
                          <Grid item container justify="center" spacing={1}>
                            <Button classes={{
                                            root: classes.voting,
                                            label: classes.label,
                                            }} variant="contained" onClick={displayVotingResults}>
                              Voting Results
                            </Button>
                            {
                              isImposter
                              ?
                                <>
                                  <Button classes={{
                                                    root: classes.imposter,
                                                    label: classes.label,
                                                  }} variant="contained" disabled>
                                    Assign Imposter
                                  </Button>
                                  <Button classes={{
                                                    root: classes.round,
                                                    label: classes.label,
                                                  }} variant="contained" onClick={restartRound}>
                                    Restart Round
                                  </Button>
                                </>
                              :
                                <>
                                  <Button classes={{
                                                    root: classes.imposter,
                                                    label: classes.label,
                                                  }} variant="contained" onClick={assignImposter}>
                                    Assign Imposter
                                  </Button>
                                </>
                            }
                        </Grid>
                        </Grid>
                  :
                    // USER PAGE: SHOW LOBBY SELF CARD
                    <Grid container justify="center" alignItems="center" direction="column" spacing={4}>
                      <Grid container justify="center" spacing={4}>
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
                                    player.imposter 
                                    ?
                                      <p>Imposter</p>
                                    :
                                      <p>Crewmate</p>
                                  }
                                </div>
                              </div>
                              {
                                player.color === undefined
                                ?
                                  null 
                                :  
                                  <div 
                                    className="card-content-child-color" 
                                    style={
                                      {
                                        backgroundColor: `rgba(${player.color.get('r')}, ${player.color.get('g')}, ${player.color.get('b')}, ${player.color.get('a')})`
                                      }
                                    } 
                                  />
                              }
                            </div>
                          </div>
                        </div>
                        {/* USER PAGE: LOBBY OTHER PLAYERS */}
                          {
                            Array.from(otherPlayers).map((otherPlayer) => (
                              <>
                                {
                                  otherPlayer.name != 'Admin' && otherPlayer.name != null
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
                                              {console.log(otherPlayer)}
                                              {
                                                player.kicked || otherPlayer.kicked || vote ?
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
                                          <div 
                                            className="card-content-child-color" 
                                            style={
                                              {
                                                backgroundColor: `rgba(${otherPlayer.color.get('r')}, ${otherPlayer.color.get('g')}, ${otherPlayer.color.get('b')}, ${otherPlayer.color.get('a')})`
                                              }
                                            } />
                                        </div>  
                                      </div>
                                    </div>
                                  :
                                    null
                                }
                                </>
                            
                            ))
                          }
                  </Grid>
                  
                  <Button classes={{
                    root: classes.get_tasks,
                    label: classes.label,
                  }} variant='contained' onClick={gotToTasks}>
                Get Your Tasks
              </Button>
              </Grid>
                }
                
            </main>
            <style jsx global>
                {
                    ` 
                      body {
                      background-color: #171d1c;
                      color: #efe9f4;
                      }
                      .paper {
                        margin: 2rem;
                        padding: 2rem;
                        border: 1px solid #eb5160;
                        border-radius: 1rem;
                        background: #071013;
                        color: #b7999c;
                      }
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
                            font-family: amongus_1;
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
                            margin-bottom: 2rem;
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
                          .grid-container: {
                            margin: 2rem;
                          }
                          .grid {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            flex-wrap: wrap;
                            max-width: 800px;
                            margin-top: 3rem;
                          }

                          .grid2 {
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
                            // background-color: #DCEDC8;
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

                          @font-face {
                            font-family: "amongus_1";
                            src: url("/fonts/amongus_1.ttf");
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