import { Box, Paper, Typography } from "@mui/material";
import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  iconBgColor?: string;
  label: string;
  value: number | string;
};

export const StatCard = ({ icon, iconBgColor = "primary.light", label, value }: Props) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ alignItems: "center", display: "flex", gap: 2 }}>
        <Box
          sx={{
            alignItems: "center",
            bgcolor: iconBgColor,
            borderRadius: 2,
            color: "primary.main",
            display: "flex",
            height: 48,
            justifyContent: "center",
            width: 48,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h4" component="p">
            {value}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
