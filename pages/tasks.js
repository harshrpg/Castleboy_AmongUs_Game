import Head from 'next/head';
import { getUserFromCode } from "../utils/util";
import React, { useState, useEffect } from 'react';
import data from './data/passwords.json';
import { useRouter } from 'next/router';
import TaskViewCard from "../components/taskViewCard";

export default function Tasks() {
    const router = useRouter();
    const {
        query: { pass },
      } = useRouter();
    const [user, setUser] = useState('');
    const [authenticated, setAuthenticated] = useState(false);
    const [load, setLoad] = useState(false);
    const [tasks, setTasks] = useState([{'type': 'electrical', 'value': 1},{'type': 'admin', 'value': 2},{'type': 'it', 'value': 3},{'type': 'security', 'value': 4},{'type': 'pets', 'value': 5}])

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
        }
        
        
      },[]);
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
                        <main>
                            <h1 className='title'>
                                Your Tasks {user}
                            </h1>
                            {
                                tasks.map((task) => (
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
                                            task['type'] === 'it'
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
                        </main>
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