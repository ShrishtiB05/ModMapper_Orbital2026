import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ModuleSearch from './pages/ModuleSearch'
import TimetableBuilder from './pages/TimetableBuilder'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/modules" element={<ModuleSearch />} />
        <Route path="/timetable" element={<TimetableBuilder />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
