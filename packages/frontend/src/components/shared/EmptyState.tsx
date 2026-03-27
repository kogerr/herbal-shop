import { Box, Button, Typography } from "@mui/material";
import type { ReactNode } from "react";

type Props = {
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ReactNode;
  message: string;
};

export const EmptyState = ({ action, icon, message }: Props) => {
  return (
    <Box sx={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 2, py: 8 }}>
      {icon && <Box sx={{ color: "text.secondary", fontSize: 48 }}>{icon}</Box>}
      <Typography variant="h6" color="text.secondary">
        {message}
      </Typography>
      {action && (
        <Button variant="contained" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Box>
  );
};
