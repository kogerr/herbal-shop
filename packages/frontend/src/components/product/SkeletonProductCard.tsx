import { Card, CardContent, Skeleton } from "@mui/material";

export const SkeletonProductCard = () => {
  return (
    <Card>
      <Skeleton height={200} variant="rectangular" />
      <CardContent>
        <Skeleton variant="text" sx={{ width: "70%" }} />
        <Skeleton variant="text" sx={{ width: "40%" }} />
        <Skeleton height={36} sx={{ mt: 2 }} variant="rectangular" />
      </CardContent>
    </Card>
  );
};
