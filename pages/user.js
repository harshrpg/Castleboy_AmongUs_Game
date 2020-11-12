import React, { useState, useEffect } from 'react';
import data from './data/passwords.json';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ColorPicker } from '../components/colorPicker';
import { getUserFromCode } from "../utils/util";
// import { connectToDatabase } from '../utils/mongodb';

function compareArrays(a, b) {
    return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}

export default function User()  {

    // const { db } = await connectToDatabase();
    // const users = await db.collection('users');
    const router = useRouter();
    const {
        query: { pass },
      } = useRouter();
    const [authenticated, setAuthenticated] = useState(false);
    const [load, setLoad] = useState(false);
    const [user, setUser] = useState('');
    const [avatar, setAvatar] = useState('');
    const [color, setColor] = useState({
        r: '241',
        g: '112',
        b: '19',
        a: '1',
    });
    const [userInfo, setUserInfo] = useState({})

    const handleAvatarNameChange = (evt) => {
        setAvatar(evt.target.value);
    }

    // One of the popular cases that using useState inside of useEffect will not cause an infinite loop is when you pass an empty array as a second argument to useEffect like useEffect(() => {....}, []) which means that the effect function should be called once: after the first mount/render only. 
    // https://stackoverflow.com/questions/53715465/can-i-set-state-inside-a-useeffect-hook
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

    const onColorChange = (color) => {
        setColor(color.rgb);
    }
    const enterLobby = () => {
        if (user != '' && avatar != '') {
            let userInfoLocal = {
                "user": user,
                "avatar": avatar,
                "color": color,
                "tasksdone": 0,
                "imposter": false,
                "kicked": false,
            }
            setUserInfo(userInfoLocal);
            // if (collection != undefined) {
            //     collection.insertOne(userInfo);
            // } else {
            //     console.log("Collection Undefined");
            // }
            

            console.log(userInfoLocal);
            updateUser(userInfoLocal);
            // router.push({
            //     pathname: "/lobby",
            //     query: {pass: pass}
            //   });
        }
    }
    
    const updateUser = async (user) => {
      // console.log(user);
      const res = await fetch('https://localhost:3000/api/users', {
        method: 'post',
        body: JSON.stringify(user),
      });
      console.log(res);
    }
    return (
        
        <div> 
            {
                authenticated ?
                    load ?
                    <div>
                        <Head>
                            <title>Welcome {user}</title>
                        </Head>
                        <main>
                            <h1 className='title'>
                                Welcome {user}
                            </h1>
                            <div>
                                
                            </div>
                            <div className="grid">
                                <div className="card">
                                    <h3>Select Color </h3>
                                    <ColorPicker onChange={onColorChange}/>
                                </div>

                                <div className="card">
                                    <h3>Select Avatar Name </h3>
                                    <input type="text" name="avatar" onChange={handleAvatarNameChange}/>
                                </div>

                                <div className="card pointer" onClick={enterLobby}>
                                    <h3>Enter Lobby &rarr;</h3>
                                </div>
                            </div>
                        </main>
                    </div>
                    :
                        "No one's home"
                :
                    <h1> Not authenticated</h1>
            }

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
