import { useState } from "react";
import { ArrowLeft, Calendar, Clock, User, CheckCircle, Phone, Video, MapPin, Laptop } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  counselor: string;
  type: 'video' | 'phone';
}

interface BookingData {
  date: string;
  time: string;
  counselor: string;
  type: 'video' | 'phone';
  mode: 'online' | 'in_person';
}

const timeSlots: TimeSlot[] = [
  { id: '1', time: '09:00 AM', available: true, counselor: 'Dr. Sarah Chen', type: 'video' },
  { id: '2', time: '10:00 AM', available: false, counselor: 'Dr. Mike Rodriguez', type: 'phone' },
  { id: '3', time: '11:00 AM', available: true, counselor: 'Dr. Priya Sharma', type: 'video' },
  { id: '4', time: '02:00 PM', available: true, counselor: 'Dr. Sarah Chen', type: 'video' },
  { id: '5', time: '03:00 PM', available: true, counselor: 'Dr. James Wilson', type: 'phone' },
  { id: '6', time: '04:00 PM', available: false, counselor: 'Dr. Priya Sharma', type: 'video' },
  { id: '7', time: '05:00 PM', available: true, counselor: 'Dr. Mike Rodriguez', type: 'video' },
];

const Booking = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [sessionMode, setSessionMode] = useState<'online' | 'in_person'>('online');

  const handleBookSlot = () => {
    if (selectedSlot) {
      const booking: BookingData = {
        date: selectedDate,
        time: selectedSlot.time,
        counselor: selectedSlot.counselor,
        type: selectedSlot.type,
        mode: sessionMode
      };
      
      setBookingData(booking);
      setBookingConfirmed(true);
      
      // Store booking in localStorage for admin dashboard
      const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      existingBookings.push({
        ...booking,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        status: 'confirmed'
      });
      localStorage.setItem('bookings', JSON.stringify(existingBookings));
    }
  };

  if (bookingConfirmed && bookingData) {
    return (
      <div className="min-h-screen bg-gradient-background p-6">
        <div className="max-w-2xl mx-auto pt-12">
          <Card className="p-8 text-center shadow-card border-0">
            <div className="w-16 h-16 bg-wellness-safe/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-wellness-safe" />
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-6">
              Your counseling session has been successfully scheduled.
            </p>

            <div className="bg-muted/30 rounded-lg p-6 space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{new Date(bookingData.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">{bookingData.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Counselor:</span>
                <span className="font-medium">{bookingData.counselor}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Session Type:</span>
                <div className="flex items-center gap-2">
                  {bookingData.type === 'video' ? (
                    <Video className="w-4 h-4 text-primary" />
                  ) : (
                    <Phone className="w-4 h-4 text-primary" />
                  )}
                  <span className="font-medium capitalize">{bookingData.type} Call</span>
                </div>
              </div>
            </div>

            <div className="text-left bg-primary-light rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-primary mb-2">Before Your Session:</h4>
              <ul className="text-sm text-primary space-y-1">
                <li>• You'll receive a reminder email 24 hours before</li>
                <li>• Join link will be sent 30 minutes prior</li>
                <li>• Please test your camera/microphone beforehand</li>
                <li>• Find a quiet, private space for the session</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="wellness" className="flex-1">
                <Link to="/resources">Explore Resources</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/">Return Home</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background p-6">
      <div className="max-w-4xl mx-auto pt-12">
        <Link to="/chat" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Chat
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Book a Counseling Session</h1>
          <p className="text-muted-foreground">
            Connect with a professional counselor for personalized support and guidance.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Date Selection */}
          <Card className="p-6 shadow-soft border-0">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Select Date
            </h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border-2 border-border rounded-xl focus:border-primary focus:outline-none"
            />
            <div className="mt-6">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Session Mode
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`p-3 rounded-lg border-2 text-sm ${sessionMode === 'online' ? 'border-primary bg-primary-light' : 'border-border hover:border-primary'}`}
                  onClick={() => setSessionMode('online')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Laptop className="w-4 h-4" /> Online
                  </div>
                </button>
                <button
                  className={`p-3 rounded-lg border-2 text-sm ${sessionMode === 'in_person' ? 'border-primary bg-primary-light' : 'border-border hover:border-primary'}`}
                  onClick={() => setSessionMode('in_person')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4" /> In-person
                  </div>
                </button>
              </div>
            </div>
          </Card>

          {/* Time Slots */}
          <Card className="lg:col-span-2 p-6 shadow-soft border-0">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Available Time Slots
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {timeSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    !slot.available
                      ? 'border-red-200 bg-red-50 cursor-not-allowed opacity-70'
                      : selectedSlot?.id === slot.id
                      ? 'border-primary bg-primary-light'
                      : 'border-green-200 bg-green-50 hover:border-primary'
                  }`}
                  onClick={() => slot.available && setSelectedSlot(slot)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{slot.time}</span>
                    <div className="flex items-center gap-1">
                      {slot.type === 'video' ? (
                        <Video className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Phone className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{slot.counselor}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant={slot.available ? "secondary" : "outline"} className={`text-xs ${slot.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {slot.available ? 'Available' : 'Booked'}
                    </Badge>
                    <span className="text-xs text-muted-foreground capitalize">
                      {slot.type} session
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full bg-green-400"></span> Open</div>
              <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full bg-red-400"></span> Booked</div>
            </div>

            {selectedSlot && (
              <div className="mt-6 p-4 bg-primary-light rounded-lg">
                <h4 className="font-semibold text-primary mb-2">Session Details:</h4>
                <div className="space-y-1 text-sm text-primary">
                  <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {selectedSlot.time}</p>
                  <p><strong>Counselor:</strong> {selectedSlot.counselor}</p>
                  <p><strong>Type:</strong> {selectedSlot.type === 'video' ? 'Video' : 'Phone'} Session</p>
                  <p><strong>Mode:</strong> {sessionMode === 'online' ? 'Online' : 'In-person'}</p>
                </div>
                
                <Button 
                  onClick={handleBookSlot}
                  className="w-full mt-4"
                  variant="wellness"
                >
                  Confirm Booking
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Info Section */}
        <Card className="mt-8 p-6 shadow-soft border-0 bg-secondary-light">
          <h3 className="font-semibold mb-4 text-secondary">What to Expect</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-secondary">
            <div>
              <h4 className="font-medium mb-2">Session Length</h4>
              <p>Each session is 50 minutes long with a professional licensed counselor.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Confidentiality</h4>
              <p>All sessions are completely confidential and follow strict privacy guidelines.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Preparation</h4>
              <p>No special preparation needed. Come as you are and share what feels comfortable.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Follow-up</h4>
              <p>You can book follow-up sessions and access additional resources as needed.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Booking;