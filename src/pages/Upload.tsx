
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DashboardLayout from '@/components/DashboardLayout';
import { Upload as UploadIcon, FileDown, X } from 'lucide-react';
import { uploadService, orderService } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (!selectedFile.type.includes('image')) {
        toast.error('Please upload an image file');
        return;
      }
      
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  const handleDownloadSheet = () => {
    const link = document.createElement('a');
    link.href = 'https://res.cloudinary.com/dih3lmqfv/image/upload/v1746081975/images/Screenshot%20%288%29.png.png';
    link.download = 'handwriting_template.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select an image to upload');
      return;
    }

    if (!user || !user.id) {
      toast.error('User not authenticated properly');
      return;
    }
    
    try {
      setUploading(true);
      // Upload image to get URL
      const uploadResponse = await uploadService.uploadImage(file);
      
      // Create order with the uploaded image URL and userId
      if (uploadResponse && uploadResponse.url) {
        await orderService.createOrder(user.id, uploadResponse.url);
        toast.success('Handwriting sample uploaded successfully!');
        handleRemoveFile();
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Upload Handwriting Sample</h2>
          <Button 
            onClick={handleDownloadSheet}
            className="flex items-center gap-2 bg-fontify-primary hover:bg-fontify-accent text-white px-4 py-2 rounded-md transition-colors"
          >
            <FileDown className="h-5 w-5" />
            Download Sheet
          </Button>
        </div>
        
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-8">
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Upload a clear scan or photo of your handwriting sample. 
                    For best results, use the downloadable template and follow the guidelines.
                  </p>
                  
                  {!previewUrl ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 relative">
                      <div className="flex flex-col items-center justify-center text-center">
                        <UploadIcon className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-xl font-medium text-gray-700">Drop your image here</p>
                        <p className="text-sm text-gray-500 mt-2">or click to browse</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          style={{ pointerEvents: 'auto' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <img 
                        src={previewUrl} 
                        alt="Handwriting preview" 
                        className="w-full h-auto max-h-96 object-contain rounded-lg border border-gray-200" 
                      />
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                      >
                        <X className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!file || uploading}
                  className="bg-fontify-primary hover:bg-fontify-accent"
                >
                  {uploading ? 'Uploading...' : 'Submit'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Upload;
