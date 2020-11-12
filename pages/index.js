import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import data from './data/passwords.json';
import { useRouter } from 'next/router';

const MyButton = React.forwardRef(({ onClick, href }, ref) => {
  return (
    <a href={href} onClick={onClick} ref={ref}>
      Click Me
    </a>
  )
})

export default function Index() {

  const [password, setpassword] = useState("Enter password here");
  const [passwords, setPasswords] = useState([{}]);
  const [encode, setEncode] = useState("");
  const [link, setLink] = useState("/");
  const router = useRouter();

  const passwordsFromData = data.map((data) => {
    passwords.push(data);
  });

  const getLinkFromPwd = evt => {
    let encoder = new TextEncoder();
    let pwd = evt.target.value;
    setpassword(pwd);
    passwords.map((pass) => {
      if (pwd in pass) {
        let val = pwd + ',' + pass[pwd];
        // console.log(encoder.encode(val))
        setEncode(encoder.encode(val));
        setLink(pass[pwd]);
      }
    })
  }

  const handleClick = (e) => {
    // console.log(link);
    if (link != "/") {
      router.push({
        pathname: "/user",
        query: {pass: encode.toString()}
      });
    }
    
  }

  return (
    <div className='container'>

      Welcome
      {passwordsFromData}

      <form>
        <label>
          Enter Password: 
          <input type="text" name="pwd" onChange={getLinkFromPwd}/>
        </label>
        <a onClick={handleClick}>
          Click Me
        </a>
      </form>
      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        `}
        </style>

      <style jsx global>
        {
          `
            html,
            body {
              padding: 0;
              margin: 0;
              font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
                Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, vibro, flegrie, sofia,
                sans-serif;
            }
    
            * {
              box-sizing: border-box;
            }
    
            @font-face {
              font-family: "vibro";
              src: url("/fonts/vibro.ttf");
            }

            @font-face {
              font-family: "flegrie";
              src: url("/fonts/flegrie.ttf");
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