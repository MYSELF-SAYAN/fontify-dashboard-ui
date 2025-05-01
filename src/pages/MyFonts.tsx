
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { orderService } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type Order = {
  _id: string;
  userId: {
    _id: string;
    email: string;
    name: string;
  };
  imageUrl: string;
  fontFileUrl: string | null;
  status: 'pending' | 'processing' | 'done' | 'cancel';
  createdAt: string;
  updatedAt?: string;
};

const MyFonts = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await orderService.getUserOrders(user.id);
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load your fonts');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'done':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Done
          </span>
        );
      case 'pending':
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Processing
          </span>
        );
      case 'cancel':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">My Fonts</h2>
        </div>
        
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="w-8 h-8 border-4 border-fontify-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">You haven't created any fonts yet.</p>
                <Button 
                  className="mt-4 bg-fontify-primary hover:bg-fontify-accent"
                  onClick={() => window.location.href = '/upload'}
                >
                  Upload Handwriting
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            Font #{order._id.substring(0, 8)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {order.updatedAt ? formatDate(order.updatedAt) : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusLabel(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.status === 'done' && order.fontFileUrl ? (
                            <a 
                              href={order.fontFileUrl} 
                              download
                              className="inline-flex items-center text-sm font-medium text-fontify-primary hover:text-fontify-accent"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </a>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MyFonts;
