
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Upload } from 'lucide-react';
import { orderService, uploadService } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

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

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [uploadingFont, setUploadingFont] = useState(false);
  const { isAdmin } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [fontFile, setFontFile] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.getAllOrders();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAdmin]);

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

  const handleFontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFontFile(e.target.files[0]);
    }
  };

  const handleUploadFont = async (orderId: string) => {
    if (!fontFile) {
      toast.error('Please select a font file');
      return;
    }

    try {
      setUploadingFont(true);
      // Upload font file
      const uploadResponse = await uploadService.uploadFont(fontFile);
      
      if (uploadResponse && uploadResponse.url) {
        // Update order status with the uploaded font URL
        await orderService.updateOrderStatus(orderId, 'done', uploadResponse.url);
        
        // Update local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: 'done', fontFileUrl: uploadResponse.url } 
              : order
          )
        );
        
        toast.success('Font uploaded successfully!');
        setDialogOpen(false);
        setFontFile(null);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload font');
    } finally {
      setUploadingFont(false);
    }
  };

  const openUploadDialog = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
        </div>
        
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="w-8 h-8 border-4 border-fontify-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No orders found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{order._id.substring(0, 8)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.userId.name}</div>
                          <div className="text-sm text-gray-500">{order.userId.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusLabel(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-3">
                            <a 
                              href={order.imageUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:text-blue-800"
                            >
                              View Image
                            </a>
                            
                            {order.status === 'done' && order.fontFileUrl ? (
                              <a 
                                href={order.fontFileUrl} 
                                download
                                className="flex items-center text-fontify-primary hover:text-fontify-accent"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </a>
                            ) : (
                              <button
                                onClick={() => openUploadDialog(order)}
                                className="flex items-center text-fontify-primary hover:text-fontify-accent disabled:text-gray-400"
                                disabled={processingId === order._id}
                              >
                                <Upload className="w-4 h-4 mr-1" />
                                Upload Font
                              </button>
                            )}
                          </div>
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
      
      {/* Font Upload Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Font File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fontFile">Select TTF File</Label>
              <input
                id="fontFile"
                type="file"
                accept=".ttf"
                onChange={handleFontFileChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-fontify-primary hover:bg-fontify-accent"
                disabled={!fontFile || uploadingFont}
                onClick={() => selectedOrder && handleUploadFont(selectedOrder._id)}
              >
                {uploadingFont ? 'Uploading...' : 'Upload Font'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminDashboard;
