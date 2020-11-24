import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
    container: {
        border: 1,
        borderColor: '#16bac5',
    },
  root: {
    maxWidth: 345,
    backgroundColor: 'transparent',
    margin: '1.5rem'
  },
  media: {
    height: 140,
  },
  rootTyp: {
      color: '#16bac5'
  },
  subTyp: {
      color: '#efe9f4'
  }
});

export default function TaskViewCard(props) {
  const classes = useStyles();

  return (
      <Card className={classes.root} border={1}>
      <CardActionArea>
        <CardMedia
          className={classes.media}
          image={props.media}
          title="Contemplative Reptile"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2" className={classes.rootTyp}>
            <span className="header">
              {
                props.header === "Kill them all" || props.header === "Its all politics"
                ? props.header
                : props.header + "Room"
              }
              
            </span>
          </Typography>
          <Typography variant="body2" component="p" className={classes.subTyp}>
          <span className="header">
              {props.task}
            </span>
          </Typography>
        </CardContent>
      </CardActionArea>
      {/* <CardActions>
        <Button size="small" color="primary">
          Share
        </Button>
        <Button size="small" color="primary">
          Learn More
        </Button>
      </CardActions> */}

      <style jsx>
        {
          `
            .header {
              font-family: amongus_1;
            }

            @font-face {
              font-family: "amongus_1";
              src: url("/fonts/amongus_1.ttf");
            }
          `
        }
      </style>
    </Card>
    );
}
