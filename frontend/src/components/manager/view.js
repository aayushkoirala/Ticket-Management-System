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
  const [nurse, setNurse] = useState([]);

  useEffect(() => getNurse(), []);
  const getNurse = () => {
    axios
      .post("https://team106.pythonanywhere.com/tickets_api", {
        action: "get_ticket_info",
        ticket_id: localStorage.getItem("ticket_id"),
      })
      .then(function (response) {
        console.log(response.data);
        setNurse(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  const classes = useStyles();
  const cards = cardStyles();

  function mapCards(nurse, index) {
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
              {nurse.description}
            </Typography>
            <Typography variant="body2">
            <b>Status:</b> {nurse.status}
            </Typography>
            <Typography variant="body2">
              <b>Created Date:</b> {nurse.created_date}
            </Typography>
            <Typography variant="body2">
              <b>Due Date:</b> {nurse.created_date}
            </Typography>
            <Typography variant="body2">
              <b>Assigned to:</b> {nurse.assined_to}
            </Typography>
          </CardContent>
          <CardActions style={{ justifyContent: "center" }}>
            <Button
              onClick={() => {
                console.log(nurse.type)
                localStorage.setItem("room_number", nurse.room_number);
                localStorage.setItem("r_id", nurse.r_id);
                navigate("/manager_edit");
              }}
              size="small"
            >
              Edit ticket
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  }
  return (
    <div>
      <div>
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
              <Typography variant="body1" component="h2">
              {localStorage.getItem('team')}
              </Typography>
              <Button
                onClick={() => {
                  navigate("/");
                }}
                size="small"
                variant="outlined"
              >
                View tickets
              </Button>
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
        {nurse.map(mapCards)}
      </Grid>
    </div>
  );
}

export default OutlinedCard;