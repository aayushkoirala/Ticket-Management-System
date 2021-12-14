import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { useEffect, useState } from "react";
import axios from "axios";
import { Grid } from "@material-ui/core";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles({
  root: {
    minWidth: 200,
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

const cardStyles = makeStyles({
  gridContainer: {
    paddingLeft: "20px",
    paddingRight: "20px",
  },
});

function OutlinedCard() {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState([]);

//   adding a new const for comments
 const [comments,setComments] = useState([]);
 useEffect(() => getComments(), []);
 const getComments = () => {

    let formData = {
        "action":"get_comments_given_ticke",
        "ticket_id":"developer1"
    }
    axios.post('https://team106.pythonanywhere.com/tickets_api',formData)
    .then(function (response) {
      console.log(response.data)
      setComments(response.data)
    })
    .catch(function (error) {
        console.log(error);
        alert("Login Failed, Try Again")
    });
 };

  useEffect(() => getHospital(), []);
  const getHospital = () => {

    let formData = {
        "action":"get_ticket_info",
        "ticket_id":"developer1"
    }
    axios.post('https://team106.pythonanywhere.com/tickets_api',formData)
    .then(function (response) {
      console.log(response.data)
      setHospital(response.data)
    })
    .catch(function (error) {
        console.log(error);
        alert("Login Failed, Try Again")
    });
    
  };
  const classes = useStyles();
  const cards = cardStyles();

  function mapCards(hospital, index,comments) {
    return (
      <Grid item xs={12} sm={6} md={4} key={index}>
        <Card className={classes.root} variant="outlined">
          <CardContent style={{ textAlign: "center" }}>
            <Typography
              className={classes.title}
              color="textSecondary"
              gutterBottom
            ></Typography>
            <Typography variant="h5" component="h2">
              {hospital.ticket_id}
            </Typography>
            <Typography variant="h5" component="h2">
              {hospital.assined_to}
            </Typography>
            <Typography variant="h5" component="h2">
              {hospital.team}
            </Typography>
            <Typography variant="h5" component="h2">
              {hospital.due_date}
            </Typography>
            <Typography variant="h5" component="h2">
              {hospital.created_date}
            </Typography>
            <Typography variant="h5" component="h2">
              {hospital.status}
            </Typography>
            <Typography variant="h5" component="h2">
              {hospital.description}
            </Typography>
            <Typography variant="h5" component="h2">
            <b>Messages:</b> 
            </Typography>
            <Typography variant="body2" component="p">
              <b>ID:</b> {comments.id}
            </Typography>
            <Typography variant="body2" component="p">
              <b>Message:</b> {comments.comment}
            </Typography>
          </CardContent>
          <CardActions style={{ justifyContent: "center" }}>
            <Button
              onClick={() => {
                console.log(hospital);
                localStorage.setItem("ticket_id", hospital.ticket_id)
                navigate("/messages/msg");
              }}
              size="small"
            >
              Message
            </Button>
            <Button
              onClick={() => {
                console.log(hospital);
                localStorage.setItem("ticket_id", hospital.ticket_id)
                navigate("/comments/comment");
              }}
              size="small"
            >
              Create Comment
            </Button>
            <Button
              onClick={() => {
                console.log(hospital);
                localStorage.setItem("ticket_id", hospital.ticket_id)
                navigate("/edit");
              }}
              size="small"
            >
              Move Status
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  }
  return (
    <div>
      <div>
        <left>
        <Typography variant="h5" component="h2">
                Hello,
              </Typography>
        </left>
        <right>
        <Typography variant="body2" component="p">
              <Button

              onClick={() => {
                navigate("/logout");
              }}
              size="small"
              variant="outlined"
            >
             Logout
            </Button>
              </Typography>
        </right>
        <center>
          <Card className={cards.root} variant="outlined">
            <CardContent>
              <Typography
                className="Hospital"
                color="textSecondary"
                gutterBottom
              ></Typography>
              <Typography variant="h5" component="h2">
                Ticket Management System
              </Typography>
              <Typography variant="h5" component="h2">
                Developer:
              </Typography>
              <Typography variant="body2" component="p">
              <Button
              onClick={() => {
                navigate("/insert_hospital");
              }}
              size="small"
              variant="outlined"
            >
             
            </Button>
              </Typography>
            </CardContent>
          </Card>
        </center>
        &nbsp;
      </div>
      <Grid
        container
        spacing={4}
        className={cards.gridContainer}
        justifyContent="center"
      >
        {hospital.map(mapCards)}
      </Grid>
    </div>
  );
}

export default OutlinedCard;