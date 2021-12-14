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
  const [nurse, setNurse] = useState([]);
  const [values, setValues] = React.useState([]);
  const [selected, setSelected] = useState(" ");
  const [loading, setLoading] = useState(false);

  useEffect(() => getNurse(), []);
  useEffect(() => getDoctor(), []);

  const getNurse = () => {
    axios
      .post("https://team106.pythonanywhere.com/tickets_api", {
        action: "get_ticket_info",
        ticket_id: localStorage.getItem("ticket_id"),
      })
      .then(function (response) {
        console.log(response.data);
        setNurse(response.data);
        setLoading(true);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const cards = cardStyles();

  function handleChange(event) {
    setSelected(event.target.value);
  }

  const getDoctor = () => {
    axios
      .post("http://127.0.0.1:5000/getDoctors", {
        queryType: "hospital",
        hospital_name: localStorage.getItem("hospital_name"),
      })
      .then(function (response) {
        console.log(response.data);
        setValues(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  };


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
      team_id:"1",
    }
  );

  const handleSubmit = (evt) => {
    evt.preventDefault();
    let data = { formInput };
    
    axios.post('', data)
    .then(function (response) {
      console.log(response.data);
      navigate('/patient')
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

  function renderItems(){
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
              <Typography variant="body2" component="p">
              {localStorage.getItem('location')}
              </Typography>
            </CardContent>
          </Card>
        </center>
        &nbsp;
      </div>
      <Paper className={classes.root} justifyontent="center">
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
              defaultValue={""}
              className={classes.textField}
              helperText="Enter Due date"
              onChange={handleInput}
            />

            <TextField
              label="Status"
              id="margin-normal"
              name="status"
              defaultValue={""}
              className={classes.textField}
              helperText="Enter Status"
              onChange={handleInput}
            />

            <TextField
              label="Description"
              id="margin-normal"
              name="description"
              defaultValue={""}
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
  }

  return loading ? <div>{renderItems()}</div> : <div>loading...</div>;
}

export default MaterialUIFormSubmit;