import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  File, 
  X, 
  Check,
  AlertCircle,
  Cloud,
  FolderOpen
} from "lucide-react";

interface FileUploadProps {
  onUpload: (files: File[], category: string, description: string, isPublic: boolean) => void;
  isUploading: boolean;
}

const FILE_CATEGORIES = [
  { value: 'ebooks', label: 'E-Books' },
  { value: 'music', label: 'Music' },
  { value: 'videos', label: 'Videos' },
  { value: 'docs', label: 'Documents' },
  { value: 'images', label: 'Images' },
  { value: 'other', label: 'Other' },
];

export function FileUpload({ onUpload, isUploading }: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [category, setCategory] = useState('other');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 50 * 1024 * 1024 * 1024, // 50GB
  });

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      onUpload(selectedFiles, category, description, isPublic);
      
      // Reset form after upload
      setTimeout(() => {
        setSelectedFiles([]);
        setDescription('');
        setUploadProgress(0);
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-[hsl(151,100%,50%)] bg-[hsl(151,100%,50%)]/10' 
            : 'border-[hsl(151,100%,50%)]/50 hover:border-[hsl(151,100%,50%)]'
        }`}
      >
        <input {...getInputProps()} />
        <Cloud className="h-16 w-16 text-[hsl(151,100%,50%)] mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Drop Files Here</h3>
        <p className="text-gray-300 mb-4">Or click to browse - supports up to 50GB per file</p>
        <Button 
          type="button"
          className="bg-gradient-to-r from-[hsl(151,100%,50%)] to-[hsl(217,91%,60%)] hover:scale-105 transition-transform"
        >
          <FolderOpen className="mr-2 h-5 w-5" />
          Choose Files
        </Button>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Card className="glass-effect bg-transparent border-white/20">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <File className="h-5 w-5 text-[hsl(151,100%,50%)]" />
              Selected Files ({selectedFiles.length})
            </h4>
            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-[hsl(240,50%,7%)] rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-[hsl(151,100%,50%)] to-[hsl(217,91%,60%)] rounded-lg flex items-center justify-center">
                    <File className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Options */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="category" className="text-base font-medium">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-[hsl(240,29%,11%)] border-gray-600 focus:border-[hsl(151,100%,50%)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="public" className="text-base font-medium">
              Make Public
            </Label>
          </div>
        </div>

        <div>
          <Label htmlFor="description" className="text-base font-medium">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your file(s)..."
            className="bg-[hsl(240,29%,11%)] border-gray-600 focus:border-[hsl(151,100%,50%)] resize-none"
            rows={4}
          />
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && uploadProgress > 0 && (
        <Card className="glass-effect bg-transparent border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Upload className="h-5 w-5 text-[hsl(151,100%,50%)]" />
              <span className="font-medium">Uploading files...</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-sm text-gray-400 mt-2">{uploadProgress}% complete</p>
          </CardContent>
        </Card>
      )}

      {/* Upload Button */}
      <div className="text-center">
        <Button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || isUploading}
          className="bg-gradient-to-r from-[hsl(151,100%,50%)] to-[hsl(217,91%,60%)] px-8 py-3 text-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          size="lg"
        >
          {isUploading ? (
            <>
              <Upload className="mr-2 h-5 w-5 animate-pulse" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              Upload {selectedFiles.length > 0 ? `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}` : 'Files'}
            </>
          )}
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4" />
          <span>Supported formats: All file types up to 50GB each</span>
        </div>
        <p>Public files will be visible in the community gallery</p>
      </div>
    </div>
  );
}
