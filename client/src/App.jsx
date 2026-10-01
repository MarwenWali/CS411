import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import StudentBooking from './pages/StudentBooking'
import MyBookings from './pages/MyBookings'
import ManagementResources from './pages/ManagementResources'
import ManagementBookings from './pages/ManagementBookings'
import InstructorMachines from './pages/InstructorMachines'
import InstructorAvailability from './pages/InstructorAvailability'
import InstructorBookings from './pages/InstructorBookings'

export default function App() {
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route element={<ProtectedRoute />}><Route element={<Layout />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/book" element={<StudentBooking />} />
        <Route path="/bookings" element={<MyBookings />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['management']} />}>
        <Route path="/management/components" element={<ManagementResources type="components" />} />
        <Route path="/management/machines" element={<ManagementResources type="machines" />} />
        <Route path="/management/bookings" element={<ManagementBookings />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['instructor']} />}>
        <Route path="/instructor/machines" element={<InstructorMachines />} />
        <Route path="/instructor/availability" element={<InstructorAvailability />} />
        <Route path="/instructor/bookings" element={<InstructorBookings />} />
      </Route>
    </Route></Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
}
