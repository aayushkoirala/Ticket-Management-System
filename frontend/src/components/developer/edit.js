import React, { useReducer } from "react";
import { Button, TextField, Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
const cardStyles = makeStyles({
  gridContainer: {
    paddingLeft: "20px",
    paddingRight: "20px",
  },
});

function MaterialUIFormSubmit(props) {
  const navigate = useNavigate();
  const [statuses, setStatus] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => getDoctor(), []);
  const getDoctor = () => {
    axios
      .post("https://team106.pythonanywhere.com/tickets_api", {
        queryType: "developer",
        assined_to: localStorage.getItem("assined_to"),
        ticket_due_date: localStorage.getItem("due_date"),
      })
      .then(function (response) {
        console.log(response.data);
        setStatus(response.data);
        setLoading(true);
      })
      .catch(function (error) {
        console.log(error);
      });

  };

  const cards = cardStyles();
  const useStyles = makeStyles((theme) => ({
    button: {
      margin: theme.spacing(1),
    },
    root: {
      padding: theme.spacing(3, 2),
    },
    container: {
      display: "flex",
      flexWrap: "wrap",
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 400,
    },
  }));

  const [formInput, setFormInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      status: "",
      ticket_id: "",
    }
  );
  const handleSubmit = (evt) => {
    evt.preventDefault();
    formInput["status"] = localStorage.getItem("status");
    formInput["ticket_id"] = localStorage.getItem("ticket_id");
    let data = { formInput };
    axios.put('https://team106.pythonanywhere.com/tickets_api', data)
      .then(function (response) {
        console.log(response.data);
        navigate('-1')
      })
      .catch(function (error) {
        console.log(error);
      });

    console.log(data);
  };

  
  const handleInput = (evt) => {
    const name = evt.target.name;
    const newValue = evt.target.value;
    setFormInput({ [name]: newValue });
  };

  const classes = useStyles();

  function renderItems() {
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
                  {localStorage.getItem("assined_to")}
                </Typography>
                <Typography variant="body2" component="p">
                  {localStorage.getItem("due_date")}
                </Typography>
              </CardContent>
            </Card>
          </center>
          &nbsp;
        </div>
        <Paper className={classes.root} justifycontent="center">
          <center>
            <Typography variant="h5" component="h3">
              {props.formName}
            </Typography>
            <Typography component="p">{props.formDescription}</Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                label="Status"
                id="margin-normal"
                name="status"
                defaultValue={statuses[0]['status']}
                className={classes.textField}
                helperText="Enter new Status"
                onChange={handleInput}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.button}
              >
                Submit
              </Button>
              
            </form>
          </center>
        </Paper>
      </div>
    );
  }

  return loading ? <div>{renderItems()}</div> : <div>loading...</div>;
}

export default MaterialUIFormSubmit;