import { Box, CircularProgress } from "@mui/material";

export const LoadingSpinner = () => {
  return (
    <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", py: 8 }}>
      <CircularProgress />
    </Box>
  );
};
