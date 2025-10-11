import { useState, useEffect } from "react";
import axios from "axios";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Calendar as CalendarIcon, LogOut, User, Building2, Clock } from "lucide-react";
import { format } from "date-fns";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage
    const savedToken = localStorage.getItem("adminToken");
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchInterviews();
    }
  }, [selectedDate, isLoggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/admin/login`, {
        username,
        password,
      });

      const { token } = response.data;
      setToken(token);
      localStorage.setItem("adminToken", token);
      setIsLoggedIn(true);
      toast.success("Login successful!");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    setIsLoggedIn(false);
    localStorage.removeItem("adminToken");
    setUsername("");
    setPassword("");
    toast.success("Logged out successfully");
  };

  const fetchInterviews = async () => {
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const response = await axios.get(`${API}/interviews/date/${dateStr}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setInterviews(response.data);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      if (error.response?.status === 401) {
        handleLogout();
        toast.error("Session expired. Please login again.");
      }
    }
  };

  // Login View
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-xl border-none backdrop-blur-sm bg-white/90" data-testid="admin-login-card">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  data-testid="admin-username-input"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  data-testid="admin-password-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                disabled={loading}
                data-testid="admin-login-btn"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <a
                href="/"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                data-testid="back-to-booking-link"
              >
                ← Back to Booking
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin Dashboard View
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-lg text-gray-600">Manage and view scheduled interviews</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
            data-testid="logout-btn"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80" data-testid="admin-calendar-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-600" />
                Select Date
              </CardTitle>
              <CardDescription>View interviews by date</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                data-testid="admin-calendar"
              />
            </CardContent>
          </Card>

          {/* Interviews List */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80" data-testid="interviews-list-card">
              <CardHeader>
                <CardTitle>Interviews on {format(selectedDate, "MMMM dd, yyyy")}</CardTitle>
                <CardDescription>
                  {interviews.length} interview{interviews.length !== 1 ? 's' : ''} scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                {interviews.length === 0 ? (
                  <div className="text-center py-12" data-testid="no-interviews-message">
                    <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No interviews scheduled for this date</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {interviews
                      .sort((a, b) => a.interview_time.localeCompare(b.interview_time))
                      .map((interview) => (
                        <Card
                          key={interview.id}
                          className="border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow"
                          data-testid={`interview-${interview.id}`}
                        >
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-2">
                                  <User className="w-5 h-5 text-gray-500" />
                                  <div>
                                    <p className="text-sm text-gray-500">Candidate</p>
                                    <p className="font-semibold text-lg" data-testid="interview-candidate-name">
                                      {interview.candidate_name}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-5 h-5 text-gray-500" />
                                  <div>
                                    <p className="text-sm text-gray-500">Company</p>
                                    <p className="font-medium" data-testid="interview-company-name">
                                      {interview.company_name}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-5 h-5 text-gray-500" />
                                  <div>
                                    <p className="text-sm text-gray-500">Time & Duration</p>
                                    <p className="font-medium" data-testid="interview-time-duration">
                                      {interview.interview_time} ({interview.duration} min)
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium">
                                {interview.duration} min
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back to Booking Link */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            data-testid="back-to-booking-from-dashboard"
          >
            ← Back to Booking Page
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;