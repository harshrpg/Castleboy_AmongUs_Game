import Head from 'next/head';
import { getUserFromCode } from "../utils/util";
import React, { useState, useEffect } from 'react';
import data from './data/passwords.json';
import tasks from './data/tasks.json';
import imposter_tasks from './data/imposter_tasks.json';
import { useRouter } from 'next/router';
import TaskViewCard from "../components/taskViewCard";
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Player from '../models/Player';
import dbConnect from '../utils/dbConnect';

const useStyles = makeStyles({
    get_lobby: {
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
export default function Tasks({playersFromData}) {
    const classes = useStyles();
    const router = useRouter();
    const {
        query: { pass },
      } = useRouter();
    const [user, setUser] = useState('');
    const [authenticated, setAuthenticated] = useState(false);
    const [load, setLoad] = useState(false);
    const [isImposter, setIsImposter] = useState(false);
    const [fiveTasks, setFiveTasks] = useState([])

    console.log('====================================');
    console.log(playersFromData);
    console.log('====================================');

    useEffect(() => {

        let query_vals = getUserFromCode(pass);
        if (query_vals != undefined) {
            let pwd = query_vals[0];
            let ifLoad = query_vals[1] != '' ? true : false;
            setLoad(ifLoad);
            data.map((val) => {
                if (pwd in val) {
                    setAuthenticated(true);
                    setUser(query_vals[1]);
                }
            });

            getIfPlayerImposter(query_vals[1]);
        }
        let arr = []
        while(arr.length < 5){
            var r = Math.floor(Math.random() * 5) + 1;
            if(arr.indexOf(r) === -1) arr.push(r);
        }

        console.info("Getting random tasks");
        arr.map((i) => {
          fiveTasks.push(tasks[i]);
        });
        

        

        console.log('====================================');
        console.log(fiveTasks);
        console.log('====================================');

        
        
    },[]);

    const getIfPlayerImposter = (username) => {
      if (playersFromData != undefined && user != undefined) {
        console.log("settingImposter");
        console.log(username);
        playersFromData.map((player) => {
          if (player.name === username && player.imposter) {
            setIsImposter(true);
            console.log(username, "is Imposter");
          }
        })
      }
    }

    const goToLobby = () => {
      router.push({
        pathname: "/lobby",
        query: {pass: pass}
      })
    }
    return (
        <div>
            {
                authenticated
                ?
                load
                ?
                    <div>
                        <Head>
                            <title>Task Page</title>
                        </Head>
                        {
                          isImposter
                          ?
                          <main>
                            <h1 className='title'>
                                You're an Imposter {user}
                            </h1>
                            {
                                imposter_tasks.map((task) => (
                                    <span className="taskCover">
                                        {
                                            task['type'] === 'kill'
                                            ?
                                                <TaskViewCard media="/images/kill.webp" header="Kill them all" task={task.value}/>
                                            :
                                            task['type'] === 'sabotage'
                                            ?
                                                <TaskViewCard media="/images/sabotage.jpg" header="Its all politics" task={task.value}/>
                                            : null
                                        }
                                        
                                    </span>
                                    
                                ))
                            }
                            <Button classes={{
                                                root: classes.get_lobby,
                                                label: classes.label,
                                            }} variant='contained' onClick={goToLobby}>
                                Go to lobby
                            </Button>
                        </main>
                        
                          :
                          <main>
                            <h1 className='title'>
                                Your Tasks {user}
                            </h1>
                            {
                                fiveTasks.map((task) => (
                                    <span className="taskCover">
                                        {
                                            task['type'] === 'electrical'
                                            ?
                                                <TaskViewCard media="/images/Electrical_Gen.webp" header="Electric" task={task.value}/>
                                            :
                                            task['type'] === 'admin'
                                            ?
                                                <TaskViewCard media="/images/Admin.webp" header="Admin" task={task.value}/>
                                            :
                                            task['type'] === 'communications'
                                            ?
                                                <TaskViewCard media="/images/DownloadUploadData.webp" header="Communications" task={task.value}/>
                                            :
                                            task['type'] === 'security'
                                            ?
                                                <TaskViewCard media="/images/Security.webp" header="Security" task={task.value}/>
                                            : null
                                        }
                                        
                                    </span>
                                    
                                ))
                            }
                            <Button classes={{
                                                root: classes.get_lobby,
                                                label: classes.label,
                                            }} variant='contained' onClick={goToLobby}>
                                Go to lobby
                            </Button>
                        </main>
                        
                        }
                        
                    </div>
                :
                "Nothing to show here"
                :
                "You are not authenticated correctly"

            }

            <style jsx>
                {
                    `
                    html {
                        background-color: #171d1c;
                    }
                    tasksCover {
                        border: 1px solid #16bac5;
                        margin:
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

                          @font-face {
                            font-family: "amongus_1";
                            src: url("/fonts/amongus_1.ttf");
                          }
                    `
                }
            </style>
            <style jsx global>
                {
                    `
                        body {
                            background-color: #171d1c;
                            color: #efe9f4;
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