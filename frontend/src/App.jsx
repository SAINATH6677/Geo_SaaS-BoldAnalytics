import {
  Routes,
  Route,
  Navigate
} from 'react-router-dom'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Analytics from './pages/Analytics'
import Logs from './pages/Logs'
import NotFound from './pages/NotFound'
import GeoSearch from "./pages/GeoSearch"

function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Navigate to="/login" />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/users"
        element={<Users />}
      />

      <Route
        path="/analytics"
        element={<Analytics />}
      />

      <Route
        path="/logs"
        element={<Logs />}
      />
      <Route path="/geo-search" element={<GeoSearch />} />

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  )
}

export default App