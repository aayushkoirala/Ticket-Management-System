import React, { useReducer } from "react";
import { Button, TextField, Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
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
    (state, newState) => ({ ...state, ...newState })
  );

  const handleSubmit = (evt) => {
    evt.preventDefault();
    formInput["action"] = "post_comment";
    formInput["ticket_id"] = localStorage.getItem("ticket_id");
    let data = { formInput };

    axios.post('https://team106.pythonanywhere.com/tickets_api', data)
    .then(function (response) {
      console.log(response.data);
      navigate('/developer_comment')
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

  return (
    <div>
      <div>
      <center>
          <Card className={cards.root} variant="outlined">
            <CardContent>
              <Typography
                className="Comment"
                color="textSecondary"
                gutterBottom
              ></Typography>
              <Typography variant="h5" component="h2">
                <b>Insert Comment</b>
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
              label="Comment"
              id="margin-normal"
              name="comment"
              defaultValue={""}
              className={classes.textField}
              helperText="Enter comment"
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

export default MaterialUIFormSubmit;
