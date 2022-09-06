import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import baseUrl from '../backend_config';

export default function Navbar() {
  let navigate = useNavigate();
  const handleClick = () => {
    localStorage.setItem("authenticated", false);
    axios.get(`${baseUrl}/api/v1/logout`, { headers: { 'Authorization': `Bearer ${localStorage.getItem("access")}` } })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
    localStorage.removeItem("access");
    navigate("/login");
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="absolute">
        <Toolbar variant="dense">
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Photo Potato
          </Typography>
          <Button color="inherit" href="/dashboard">Home</Button>
          <Button color="inherit" href="/upload">Upload</Button>
          <Button color="inherit" onClick={handleClick}>Logout</Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}