import SearchOffIcon from "@mui/icons-material/SearchOff";
import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router";
import { PageContainer } from "../components/layout/PageContainer";

export const NotFoundPage = () => {
  return (
    <PageContainer>
      <Box sx={{ textAlign: "center", py: 8 }}>
        <SearchOffIcon sx={{ color: "text.secondary", fontSize: 80, mb: 2 }} />
        <Typography variant="h2" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Az oldal nem található
        </Typography>
        <Button variant="contained" component={Link} to="/">
          Vissza a főoldalra
        </Button>
      </Box>
    </PageContainer>
  );
};
