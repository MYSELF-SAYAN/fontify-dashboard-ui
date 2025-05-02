
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Upload, X, Eye } from 'lucide-react';
import { orderService, uploadService } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [uploadingFont, setUploadingFont] = useState(false);
  const { isAdmin } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [fontFile, setFontFile] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  const handleRemoveFont = async (orderId: string) => {
    try {
      await orderService.updateOrderStatus(orderId, 'processing', '');
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: 'processing', fontFileUrl: null } 
            : order
        )
      );
      
      toast.success('Font removed successfully!');
    } catch (error: any) {
      console.error('Error removing font:', error);
      toast.error(error.response?.data?.message || 'Failed to remove font');
    }
  };

  const openUploadDialog = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const openImageDialog = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageDialogOpen(true);
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      const order = orders.find(o => o._id === orderId);
      
      if (!order) return;
      
      await orderService.updateOrderStatus(
        orderId, 
        status, 
        order.fontFileUrl || undefined
      );
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: status as Order['status'] } 
            : order
        )
      );
      
      toast.success(`Status updated to ${status}`);
    } catch (error: any) {
      console.error('Status update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
        </div>
        
        <Card className="shadow-sm">
          <CardContent className="p-6">
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Handwriting</TableHead>
                      <TableHead>Font</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>
                          <div className="font-medium">#{order._id.substring(0, 8)}</div>
                        </TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusChange(order._id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="done">Done</SelectItem>
                              <SelectItem value="cancel">Cancel</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openImageDialog(order.imageUrl)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" /> View
                          </Button>
                        </TableCell>
                        <TableCell>
                          {order.fontFileUrl ? (
                            <div className="flex flex-col gap-2">
                              <a 
                                href={order.fontFileUrl} 
                                download
                                className="flex items-center text-fontify-primary hover:text-fontify-accent"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </a>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleRemoveFont(order._id)}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openUploadDialog(order)}
                              className="flex items-center gap-1"
                            >
                              <Upload className="w-4 h-4" />
                              Upload Font
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          {order.fontFileUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openUploadDialog(order)}
                              className="flex items-center gap-1"
                            >
                              <Upload className="w-4 h-4" />
                              Re-upload
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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

      {/* Image Preview Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Handwriting Sample</DialogTitle>
          </DialogHeader>
          <div className="p-2">
            {selectedImage && (
              <img 
                src={selectedImage} 
                alt="Handwriting sample" 
                className="max-h-[70vh] object-contain mx-auto"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminDashboard;
