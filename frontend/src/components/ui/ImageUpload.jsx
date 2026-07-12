import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, RotateCw, AlertTriangle } from 'lucide-react';
import Button from './Button';
import { showToast } from './Toast';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_SIZE_MB = 5;

/**
 * Reusable Drag and Drop Image Upload component with validation
 */
const ImageUpload = ({
  currentUrl,
  onUpload,
  onRemove,
  aspectRatioLabel = "Recommended: Square (1:1), max 5MB",
  className = ""
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const validateAndProcess = (file) => {
    if (!file) return;

    // Type Validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast.error("Format rejected! Please upload a PNG, JPEG, or WEBP image.");
      return;
    }

    // Size Validation
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > MAX_SIZE_MB) {
      showToast.error(`File too large! Max allowed size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    // Process and convert to blob URL for simulation
    const localUrl = URL.createObjectURL(file);
    onUpload(localUrl);
    showToast.success("Image uploaded successfully (simulated)");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    validateAndProcess(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndProcess(file);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-3.5 text-left ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      {currentUrl ? (
        // Preview State
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-border rounded-xl bg-hover/10 w-full sm:w-max">
          <img
            src={currentUrl}
            alt="Upload Preview"
            className="h-28 w-28 object-cover rounded-lg border border-border/80 shadow-xs"
          />
          <div className="space-y-2 text-left">
            <span className="block text-xs font-bold text-text-main">Uploaded Photo Preview</span>
            <span className="block text-[10px] text-text-secondary font-semibold leading-none">{aspectRatioLabel}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleBrowseClick}
                leftIcon={RotateCw}
                className="text-xs py-1.5 px-3 select-none"
              >
                Replace
              </Button>
              <Button
                variant="danger"
                size="sm"
                type="button"
                onClick={onRemove}
                leftIcon={Trash2}
                className="text-xs py-1.5 px-3 select-none"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Dropzone Area
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center bg-hover/5 hover:bg-hover/10 cursor-pointer transition-all duration-200
            ${isDragging ? 'border-info bg-info/5 scale-[0.99]' : 'border-border hover:border-info/40'}
          `}
        >
          <UploadCloud
            size={36}
            className={`mx-auto mb-3 transition-colors ${isDragging ? 'text-info' : 'text-text-secondary/60'}`}
          />
          <div className="space-y-1.5">
            <span className="block text-xs font-bold text-text-main">
              {isDragging ? "Drop your image file here" : "Drag & drop your image file here, or click to browse"}
            </span>
            <span className="block text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
              Supports PNG, JPEG, WEBP up to 5MB
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
