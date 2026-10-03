import { Alert, Card, CardContent, Chip, Skeleton, Stack, Typography } from '@mui/material';
import { useHealth } from '../api/useHealth';

// Placeholder screen: proves frontend → API → Postgres works end to end. Replace it with the
// first real screen.
export const HomePage = () => {
  const health = useHealth();

  return (
    <Stack spacing={2}>
      <Typography variant="h5" component="h2">
        System status
      </Typography>
      {health.status === 'loading' && <Skeleton variant="rounded" height={96} />}
      {health.status === 'error' && (
        <Alert severity="error">The API could not be reached. Is the backend running?</Alert>
      )}
      {health.status === 'success' && (
        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="body1">API</Typography>
              <Chip label="up" color="success" size="small" />
              <Typography variant="body1">Database</Typography>
              <Chip
                label={health.data.database}
                color={health.data.database === 'up' ? 'success' : 'error'}
                size="small"
              />
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
};
