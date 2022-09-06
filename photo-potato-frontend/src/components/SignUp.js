import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import axios from "axios";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import baseUrl from "../backend_config";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="#">
        Photo Potato
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const theme = createTheme();

export default function SignUp() {
    
  // error message when username is longer than 20 characters
  const [usernameErrorText, setUsernameErrorText] = React.useState();
  const onUsernameChange = (event) => {
    if (event.target.value.length < 21) {
      setUsernameErrorText("");
    } else {
      setUsernameErrorText("max 20 chars");
    }
  };

  // error message when password is less than 8 characters
  const [passwordErrorText, setPasswordErrorText] = React.useState();
  const onPasswordChange = (event) => {
    if (event.target.value.length > 7) {
      setPasswordErrorText("");
    } else {
      setPasswordErrorText("min 8 chars");
    }
  };

  // error message when username is unavailable
  const [usernameUnavailableErrorText, setUsernameUnavailableErrorText] =
    React.useState();

  let navigate = useNavigate();
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    axios
      .post(`${baseUrl}/api/v1/signup`, data)
      .then(function (response) {
        console.log(response);
        if (response.data.message === "Username unavailable.") {
          setUsernameUnavailableErrorText(response.data.message);
        } else {
          // successful registration, redirect to login
          navigate("/login");
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: "url(https://source.unsplash.com/random)",
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography component="h1" variant="h5">
              Sign up
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                helperText={usernameErrorText}
                error={usernameErrorText}
                onChange={onUsernameChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                helperText={passwordErrorText}
                error={passwordErrorText}
                onChange={onPasswordChange}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                helperText={usernameUnavailableErrorText}
                error={usernameUnavailableErrorText}
                sx={{ mt: 3, mb: 2 }}
              >
                Sign Up
              </Button>
              {usernameUnavailableErrorText && (
                <div className="error"> {usernameUnavailableErrorText} </div>
              )}
              <Grid container justifyContent="center">
                <Grid item>
                  <Link href="/login" variant="body2">
                    {"Already have an account? Log in."}
                  </Link>
                </Grid>
              </Grid>
              <Copyright sx={{ mt: 5 }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
