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
  const [ticket, setTicket] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => getTicket(), []);
  const getTicket = () => {
    if(localStorage.getItem("token") === " "){
      navigate("/")
    }
    axios
      .post("https://team106.pythonanywhere.com/tickets_api", {
        action: "get_comments_given_ticket",
        ticket_id: localStorage.getItem("ticket_id"),
      })
      .then(function (response) {
        console.log(response.data);
        setTicket(response.data);
        setLoading(true)
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  const classes = useStyles();
  const cards = cardStyles();

  function mapCards(ticket, index) {
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
              {ticket.ticket_id}
            </Typography>
            <Typography variant="h5" component="h2">
              {ticket.summary}
            </Typography>
            <Typography variant="body2" component="p">
                <b>{ticket.comment}</b>
            </Typography>
          </CardContent>
          <CardActions style={{ justifyContent: "center" }}>
          </CardActions>
        </Card>
      </Grid>
    );
  }

  function renderItems() {
    return (
      <div>
        <div>
          <center>
            <Card className={cards.root} variant="outlined">
              <CardContent>
                <Typography
                  className="Ticket"
                  color="textSecondary"
                  gutterBottom
                ></Typography>
                <Typography variant="h5" component="h2">
                 <b>Comments</b>
                </Typography>
                <Typography variant="body1" component="h2" justifyContent="">
                  {localStorage.getItem('team')}
                </Typography>
                <Typography variant="body2" component="p">
              
                  <Button
                    onClick={() => {
                    navigate("/insert_comments");
                    }}
                    size="small"
                    variant="outlined"
                  >
                    Insert Comments
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
          {ticket.map(mapCards)}
        </Grid>
      </div>
    );

  }

  return loading ? <div>{renderItems()}</div> : <div>loading...</div>;
}

export default OutlinedCard;