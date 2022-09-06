import DeleteIcon from "@mui/icons-material/Delete";
import { Modal } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import axios from "axios";
import * as React from "react";
import ReactCompareImage from "react-compare-image";
import { Navigate } from "react-router-dom";
import baseUrl from "../backend_config";
import Navbar from "./Navbar";

const theme = createTheme();
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  border: "2px solid #FFF",
  boxShadow: 24,
  p: 4,
};

function Dashboard() {
  const [userImageData, setUserImageData] = React.useState([]);
  const fetchImages = () => {
    axios
      .get(`${baseUrl}/api/v1/getUserImages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      })
      .then(function (response) {
        console.log(response);
        setUserImageData(response.data.images);
        console.log(userImageData);
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  React.useEffect(() => fetchImages(), []);

  const [originalImage, setOriginalImage] = React.useState();
  const [processedImage, setProcessedImage] = React.useState();
  const [imageName, setImageName] = React.useState();
  const [imageId, setImageId] = React.useState();
  const [imageProcessing, setImageProcessing] = React.useState();

  // modal related
  const [open, setOpen] = React.useState(false);
  function handleOpen(image_item) {
    setOriginalImage(require(`../${image_item.original_image_fpath}`));
    setProcessedImage(require(`../${image_item.processed_image_fpath}`));
    setImageName(image_item.name);
    setImageId(image_item.id);
    setImageProcessing(image_item.processing);
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
    setDeleteStatusText("");
  };

  // delete
  const [deleteStatusText, setDeleteStatusText] = React.useState();
  function handleDelete(image_id) {
    axios
      .delete(`${baseUrl}/api/v1/deleteImage/${image_id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      })
      .then(function (response) {
        console.log(response);
        setDeleteStatusText(response.data.message);
      })
      .catch(function (error) {
        console.log(error);
        setDeleteStatusText(error.response.data.message);
      });
  }

  // authentication
  const authenticated = localStorage.getItem("authenticated") || false;
  if (authenticated === "false") {
    console.log(`Currently logged in: ${authenticated}`);
    return <Navigate replace to="/" />;
  } else {
    return (
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="md">
          <CssBaseline />
          <Navbar />
          <Box sx={{ marginTop: 10 }} />
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <ReactCompareImage
                leftImage={originalImage}
                rightImage={processedImage}
              />
              <Box>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                  {imageName}
                </Typography>
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                  {imageProcessing}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                onClick={() => handleDelete(imageId)}
              >
                Delete
              </Button>
              <div>{deleteStatusText}</div>
            </Box>
          </Modal>
          <ImageList>
            {userImageData.map((item) => (
              <ImageListItem key={item.id} onClick={() => handleOpen(item)}>
                <img
                  src={require(`../${item.original_image_fpath}`)}
                  srcSet={require(`../${item.original_image_fpath}`)}
                  alt={"image not available"}
                />
                <ImageListItemBar title={item.name} position="below" />
              </ImageListItem>
            ))}
          </ImageList>
        </Container>
      </ThemeProvider>
    );
  }
}

export default Dashboard;
