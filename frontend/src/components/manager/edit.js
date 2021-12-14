import React, { useReducer } from "react";
import { Button, TextField, Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormControl, InputLabel, Select, MenuItem } from "@material-ui/core";

const cardStyles = makeStyles({
  gridContainer: {
    paddingLeft: "20px",
    paddingRight: "20px",
  },
});

function MaterialUIFormSubmit(props) {
  const navigate = useNavigate();
  const [values, setValues] = React.useState([]);
  const [selected, setSelected] = useState(" ");
  const [ticket, setTicket] = useState([]);
  const [loading, setLoading] = useState(false);

  const cards = cardStyles();
  useEffect(() => getTicket(), []);
  useEffect(() => getDev(), []);

  const getDev = () => {
    if (localStorage.getItem("token") === " ") {
      navigate("/")
    }
    axios
      .post("https://team106.pythonanywhere.com/users", {
        team_name: localStorage.getItem("team")
      })
      .then(function (response) {
        console.log(response.data);
        setValues(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const getTicket = () => {
    axios
      .post("https://team106.pythonanywhere.com/tickets_api", {
        action: "get_ticket_info",
        ticket_id: localStorage.getItem("ticket_id"),
      })
      .then(function (response) {
        console.log(response.data);
        setTicket(response.data);
        setLoading(true);
      })
      .catch(function (error) {
        console.log(error);
      });
  };


  function handleChange(event) {
    setSelected(event.target.value);
  }

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
      team_name: "",
    }
  );
  const handleSubmit = (evt) => {
    evt.preventDefault();
    formInput["action"] = "edit_ticket"
    formInput["team_name"] = localStorage.getItem("team")
    formInput["assigned_id_to"] = selected.id
    formInput["ticket_id"] = localStorage.getItem('ticket_id')
    let data = { formInput };

    console.log(data)

    axios.put('https://team106.pythonanywhere.com/tickets_api', data)
      .then(function (response) {
        console.log(response.data);
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
                  className="Ticket"
                  color="textSecondary"
                  gutterBottom
                ></Typography>
                <Typography variant="h5" component="h2">
                  <b>EDIT TICKET</b>
                </Typography>
                <Typography variant="body2" component="p">
                  {localStorage.getItem("team")}
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
                label="Due Date"
                id="margin-normal"
                name="due_date"
                defaultValue={ticket[0]['due_date']}
                className={classes.textField}
                helperText="Enter Due date"
                onChange={handleInput}
              />

              <TextField
                label="Status"
                id="margin-normal"
                name="status"
                defaultValue={ticket[0]['status']}
                className={classes.textField}
                helperText="Enter Status"
                onChange={handleInput}
              />

              <TextField
                label="Description"
                id="margin-normal"
                name="description"
                defaultValue={ticket[0]['description']}
                className={classes.textField}
                helperText="Enter short description"
                onChange={handleInput}
              />

              <FormControl>
                <InputLabel htmlFor="choose-dev">Dev</InputLabel>
                <Select
                  value={selected}
                  onChange={handleChange}
                  inputProps={{
                    dev_name: "dev",
                    id: "name",
                  }}
                >
                  {values.map((value, index) => {
                    return (
                      <MenuItem key={index} value={value}>
                        {value.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

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