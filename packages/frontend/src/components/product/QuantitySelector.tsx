import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Box, IconButton, Typography } from "@mui/material";

type Props = {
  max?: number;
  min?: number;
  onChange: (value: number) => void;
  value: number;
};

export const QuantitySelector = ({ max = 99, min = 1, onChange, value }: Props) => {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <Box sx={{ alignItems: "center", display: "flex", gap: 1 }}>
      <IconButton aria-label="Csökkentés" onClick={handleDecrease} disabled={value <= min} size="small">
        <RemoveIcon />
      </IconButton>
      <Typography sx={{ minWidth: 24, textAlign: "center" }}>{value}</Typography>
      <IconButton aria-label="Növelés" onClick={handleIncrease} disabled={value >= max} size="small">
        <AddIcon />
      </IconButton>
    </Box>
  );
};
