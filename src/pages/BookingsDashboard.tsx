
import React from 'react';
import { useBookings } from '@/hooks/bookings/useBookings';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Loader2, Search, RefreshCw } from 'lucide-react';

const BookingsDashboard: React.FC = () => {
  const { 
    bookings, 
    isLoading, 
    error, 
    refetch 
  } = useBookings();

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Your Bookings</h1>
          <p className="text-gray-500">Manage all your scheduled services</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading your bookings...</span>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-500 mb-2">Error loading bookings</p>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : bookings?.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <h3 className="text-xl font-medium mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-4">You haven't made any service bookings yet.</p>
            <Link to="/services">
              <Button>Browse Services</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Booking History</CardTitle>
            <CardDescription>All your scheduled and completed services</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings?.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.service?.name || 'Unknown Service'}</TableCell>
                    <TableCell>{format(new Date(booking.booking_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{booking.time_slot}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : booking.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>${booking.payment_amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Link to={`/bookings/${booking.id}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BookingsDashboard;
