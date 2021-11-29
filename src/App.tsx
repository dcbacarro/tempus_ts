import { GlobalStyle } from './styles/GlobalStyle';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import SnackbarProvider from 'react-simple-snackbar';
import Tracker from './pages/Tracker';
import Login from './pages/Login';

export function App() {
  return (
    <>
      <GlobalStyle />
      <main>
        <SnackbarProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/tracker" element={<Tracker />} />
            </Routes>
          </Router>
        </SnackbarProvider>
      </main>
    </>
  )
}