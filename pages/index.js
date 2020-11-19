import React, { useState } from 'react';
import data from './data/passwords.json';
import { useRouter } from 'next/router';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import {
  withStyles,
  makeStyles,
} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { CardMedia } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
  root: {
    width: 345,
    background: 'transparent'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    background: 'transparent'
  },
  media: {
    height: 200
  },
  button: {
    margin: theme.spacing(1),
  },
  enter_game: {
    background: '#8cd867',
    borderRadius: 3,
    border: 0,
    color: 'white',
    height: 48,
    padding: '0 30px',
    // boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    margin: '1rem'
  },
  label: {
    textTransform: 'uppercase',
  },
}));

const useStyles2 = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  margin: {
    margin: theme.spacing(1),
  },
}));

const CssTextField = withStyles({
  root: {
    '& label.Mui-focused': {
      color: '#fc9e4f',
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: '#fc9e4f',
    },
    '& input': {
      color: '#d72638',
    },
    '& label': {
      color: '#4f5d75',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#fdfffc',
      },
      '&:hover fieldset': {
        borderColor: '#fdfffc',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#fc9e4f',
      }
    },
  },
})(TextField);

export default function Index() {

  const classes = useStyles();
  const classes2 = useStyles2();
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

      <CssBaseline />
      <Container maxWidth="sm">
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
                    image="/images/welcome_wallpaper.jpg"
                  />
              </CardActionArea>
            </Card>
            
          </Grid>
          <Grid item>
            <main>
              <span className="title">
                Among us
              </span>
              <span className="description">Castleboy</span>
            </main>
          </Grid>
          <Grid item>
          <form style={{display: 'flex',flexWrap: 'wrap',}} noValidate>
            <CssTextField
              label="Password"
              variant="outlined"
              id="custom-css-outlined-input"
              onChange={getLinkFromPwd}
            />
          </form>
            {/* <TextField
              id="standard-password-input"
              label="Password"
              type="password"
              autoComplete="current-password"
            /> */}
          </Grid>
          <Grid item>
            <Button classes={{
                          root: classes.enter_game,
                          label: classes.label,
                        }} variant='contained' onClick={handleClick}>
                      Get Your Tasks
            </Button>
          </Grid>
          </Grid>
      </Container>

      {/* Welcome
      {passwordsFromData} */}

      {/* <form>
        <label>
          Enter Password:  
          <input type="text" name="pwd" onChange={getLinkFromPwd}/>
        </label>
        <a onClick={handleClick}>
          Click Me
        </a>
      </form> */}
      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #0a1214;
        }
        main {
          padding: 0.2rem 0;
          font-family: amongus;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
      }

      .title {
        color: #fdfffc;
          text-decoration: none;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }
        .description {
          color: #05b2dc;
          line-height: 1.5;
          font-size: 2.5rem;
          font-family: vibro;
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
            @font-face {
              font-family: "amongus";
              src: url("/fonts/amongus.ttf");
            }
          `
        }
      </style>
    </div>
  )
  
}