import React, { useState, useEffect } from 'react';
import data from './data/passwords.json';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getUserFromCode } from "../utils/util";

export default function Lobby() {
    const {
        query: { pass },
      } = useRouter();
    const [authenticated, setAuthenticated] = useState(false);
    const [load, setLoad] = useState(false);
    const [user, setUser] = useState('');
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
            Welcome to Lobby {user}
        </div>
    )
}