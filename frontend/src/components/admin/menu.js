import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
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

function OutlinedCard() {
  const navigate = useNavigate();
  const classes = useStyles();

  return (
    <div>
      <center>
        <Card className={classes.root} variant="outlined">
          <CardContent>
            <Typography
              className="Hospital"
              color="textSecondary"
              gutterBottom
            ></Typography>
            <Typography variant="h5" component="h2">
              Ticket management system
            </Typography>
            <Typography variant="h9" component="h9">
              Admin
            </Typography>
            <CardActions style={{ justifyContent: "center" }}>
            </CardActions>

          </CardContent>
        </Card>
      </center>
      &nbsp;
      <Grid
        container
        spacing={4}
        className={classes.gridContainer}
        justifyContent="center"
      >
        <Grid item xs={12} sm={6} md={4}>
          <Card className={classes.root} variant="outlined">
            <CardContent>
              <Typography
                className={classes.title}
                color="textSecondary"
                gutterBottom
              ></Typography>
              <Typography variant="h5" component="h2" style={{textAlign: "center" }}>
                Frontend
              </Typography>
            </CardContent>

            <CardActions style={{ justifyContent: "center" }}>
              <Button
                onClick={() => {
                  console.log(1);
                  navigate("/doctor");
                }}
                size="small"
              >
                Select Front End
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card className={classes.root} variant="outlined">
            <CardContent>
              <Typography
                className={classes.title}
                color="textSecondary"
                gutterBottom
              ></Typography>
              <Typography variant="h5" component="h2">
                <center>Backend</center>
              </Typography>
            </CardContent>
            <CardActions style={{ justifyContent: "center" }}>
              <Button
                onClick={() => {
                  console.log(1);
                  navigate("/patient");
                }}
                size="small"
              >
                Select Backend
              </Button>
            </CardActions>
          </Card>
        </Grid>

  



        <Grid item xs={12} sm={6} md={4}>
          <Card className={classes.root} variant="outlined">
            <CardContent>
              <Typography
                className={classes.title}
                color="textSecondary"
                gutterBottom
              ></Typography>
              <Typography variant="h5" component="h2">
                <center>UI/UX</center>
              </Typography>
            </CardContent>
            <CardActions style={{ justifyContent: "center" }}>
              <Button
                onClick={() => {
                  navigate("/maintenance");
                  console.log(1);
                }}
                size="small"
              >
                Select UI/UX
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

export default OutlinedCard;