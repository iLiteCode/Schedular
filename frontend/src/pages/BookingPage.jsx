import { useState, useEffect } from "react";
import axios from "axios";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CalendarIcon, Clock, Building2, User, Download, Smartphone, X } from "lucide-react";
import { format } from "date-fns";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BookingPage = () => {
  const [candidateName, setCandidateName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState("30");
  const [loading, setLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Listen for beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  // Generate time slots (24 hours)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!candidateName || !companyName || !selectedTime) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const interviewData = {
        candidate_name: candidateName,
        company_name: companyName,
        interview_date: format(selectedDate, "yyyy-MM-dd"),
        interview_time: selectedTime,
        duration: parseInt(duration),
      };

      await axios.post(`${API}/interviews`, interviewData);
      
      toast.success("Interview scheduled successfully!");
      
      // Reset form
      setCandidateName("");
      setCompanyName("");
      setSelectedTime("");
      setDuration("30");
    } catch (error) {
      console.error("Error scheduling interview:", error);
      toast.error("Failed to schedule interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success("App installed successfully!");
    }
    
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Schedule Your Interview
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Book a convenient time slot for your interview. Available 24/7 to fit your schedule.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80" data-testid="calendar-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
                Select Date
              </CardTitle>
              <CardDescription>Choose your preferred interview date</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="rounded-md border"
                data-testid="booking-calendar"
              />
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80" data-testid="booking-form-card">
            <CardHeader>
              <CardTitle className="text-2xl">Interview Details</CardTitle>
              <CardDescription>Fill in your information below</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Candidate Name */}
                <div className="space-y-2">
                  <Label htmlFor="candidateName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Candidate Name
                  </Label>
                  <Input
                    id="candidateName"
                    data-testid="candidate-name-input"
                    placeholder="Enter your full name"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    required
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    data-testid="company-name-input"
                    placeholder="Enter company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>

                {/* Time Selection */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Interview Time
                  </Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime} required>
                    <SelectTrigger data-testid="time-select">
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {generateTimeSlots().map((time) => (
                        <SelectItem key={time} value={time} data-testid={`time-option-${time}`}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration Selection */}
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger data-testid="duration-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30" data-testid="duration-30">30 minutes</SelectItem>
                      <SelectItem value="60" data-testid="duration-60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Date Display */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">
                    Selected Date: {format(selectedDate, "MMMM dd, yyyy")}
                  </p>
                  {selectedTime && (
                    <p className="text-sm text-blue-700 mt-1">
                      Time: {selectedTime} ({duration} minutes)
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  disabled={loading}
                  data-testid="schedule-interview-btn"
                >
                  {loading ? "Scheduling..." : "Schedule Interview"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Admin Link */}
        <div className="text-center mt-8">
          <a
            href="/admin"
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            data-testid="admin-link"
          >
            Admin Dashboard →
          </a>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;