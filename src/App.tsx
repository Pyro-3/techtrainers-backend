import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import pages - Fixed paths
import LandingPage from '../client/src/pages/LandingPage';
import LoginPage from '../client/src/pages/LoginPage';
import RegisterPage from '../client/src/pages/RegisterPage';
import DashboardPage from '../client/src/pages/DashboardPage';

// Import components for workout generator
import Layout from './components/Layout';
import WorkoutGenerator from './components/WorkoutGenerator';
import ExerciseSelector from './components/ExerciseSelector';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        {/* Protected routes with layout */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <DashboardPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/workout-generator"
                            element={
                                <ProtectedRoute>
                                    <Layout title="Create New Workout">
                                        <WorkoutGenerator />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/workout-generator/exercises"
                            element={
                                <ProtectedRoute>
                                    <Layout title="Add Exercises">
                                        <ExerciseSelector />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;