import AddAPhotoRoundedIcon from "@mui/icons-material/AddAPhotoRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import axios from "axios";
import * as React from "react";
import { Navigate } from "react-router-dom";
import baseUrl from "../backend_config";
import Navbar from "./Navbar";

const theme = createTheme();

export default function Upload() {
  const [processing, setProcessing] = React.useState("");
  const handleProcessingChange = (event) => {
    setProcessing(event.target.value);
  };

  // file selection states
  const [selectedFile, setSelectedFile] = React.useState();
  const [isFileSelected, setIsFileSelected] = React.useState(false);
  const handleFileChange = (event) => {
    // reset
    setUploadStatusText();
    setUploadSubmit(false);

    setSelectedFile(event.target.files[0]);
    setIsFileSelected(true);
  };

  // upload states
  const [uploadStatusText, setUploadStatusText] = React.useState();
  const [uploadSubmit, setUploadSubmit] = React.useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    let data = new FormData(event.currentTarget);
    data.append("file", selectedFile);
    data.append("processing", processing);
    axios
      .post(`${baseUrl}/api/v1/uploadImage`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      })
      .then(function (response) {
        console.log(response);
        setUploadStatusText("Upload successful!");
      })
      .catch(function (error) {
        console.log(error);
        setUploadStatusText("Upload failed.");
      });
    setUploadSubmit(true);
    setIsFileSelected(false);
    setSelectedFile();
  };

  // authentication
  const authenticated = localStorage.getItem("authenticated") || false;
  if (authenticated === "false") {
    console.log(`Currently logged in: ${authenticated}`);
    return <Navigate replace to="/" />;
  } else {
    return (
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Navbar />
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography component="h1" variant="h5">
              Upload
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Image name"
                name="name"
                autoComplete="name"
                autoFocus
              />
              <Box sx={{ minWidth: 120 }}>
                <FormControl fullWidth required margin="dense">
                  <InputLabel id="processing">Processing</InputLabel>
                  <Select
                    labelId="processing"
                    id="processing"
                    value={processing}
                    label="Processing"
                    onChange={handleProcessingChange}
                  >
                    <MenuItem value={"rotate_90deg_clockwise"}>
                      Rotate 90 degrees clockwise
                    </MenuItem>
                    <MenuItem value={"annotate_circles"}>
                      Annotate circles
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Button
                variant="contained"
                component="label"
                size="small"
                endIcon={<AddAPhotoRoundedIcon />}
              >
                Select File
                <input
                  hidden
                  accept=".png, .jpg, .jpeg"
                  type="file"
                  required
                  onChange={handleFileChange}
                />
              </Button>
              {isFileSelected && selectedFile ? (
                <div>
                  <p>File name: {selectedFile.name}</p>
                </div>
              ) : (
                <div className="error">
                  {" "}
                  <p>{"Please select a file"}</p>{" "}
                </div>
              )}
              {isFileSelected ? (
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Upload
                </Button>
              ) : (
                <Button
                  disabled
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Upload
                </Button>
              )}
              {uploadSubmit && (
                <div>
                  {" "}
                  <p>{uploadStatusText}</p>
                </div>
              )}
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    );
  }
}
