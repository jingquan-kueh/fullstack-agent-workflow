import { AppBar, Container, Toolbar, Typography } from '@mui/material';
import { HomePage } from './pages/HomePage';

export const App = () => (
  <>
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" component="h1">
          App
        </Typography>
      </Toolbar>
    </AppBar>
    <Container component="main" sx={{ py: 3 }}>
      <HomePage />
    </Container>
  </>
);
