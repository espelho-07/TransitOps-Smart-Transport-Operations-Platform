import React, { useState, useRef } from 'react';
import { Camera, X, ImageIcon } from 'lucide-react';
import Avatar from '../Avatar';

/**
 * Reusable Image Upload Selector with Preview.
 * @param {Object} props
 * @param {string} props.initialImage - Fallback image preview URL
 * @param {function} props.onImageSelect - Image file selected callback
 * @param {boolean} props.isAvatar - Configures layouts to match rounded profile Avatars
 */
const ImageUpload = ({
  initialImage,
  onImageSelect,
  isAvatar = false,
  className = ''
}) => {
  const [previewUrl, setPreviewUrl] = useState(initialImage || '');
  const inputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('File picked is not a valid image format.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      onImageSelect && onImageSelect(file);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setPreviewUrl('');
    onImageSelect && onImageSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={`flex flex-col items-center gap-3.5 ${className}`}>
      {/* Input element */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      {isAvatar ? (
        /* Avatar View Picker */
        <div
          onClick={() => inputRef.current?.click()}
          className="relative group cursor-pointer"
        >
          <Avatar src={previewUrl} initials="AJ" size="lg" className="ring-2 ring-border" />
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white" size={16} />
          </div>
          {previewUrl && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute -top-1 -right-1 p-1 bg-danger hover:bg-opacity-90 text-white rounded-full shadow border border-card"
            >
              <X size={10} />
            </button>
          )}
        </div>
      ) : (
        /* Standard Rectangular Image Picker */
        <div
          onClick={() => inputRef.current?.click()}
          className="relative w-full h-40 border border-border border-dashed hover:border-hover bg-card/30 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden"
        >
          {previewUrl ? (
            <>
              <img src={previewUrl} alt="Preview" className="h-full w-full object-cover animate-fadeIn" />
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-lg transition-colors border border-border/20 z-10"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 select-none">
              <div className="p-3 bg-hover rounded-full text-text-secondary/70">
                <ImageIcon size={20} strokeWidth={1.5} />
              </div>
              <span className="text-xs font-semibold text-text-secondary">Click to upload vehicle photo</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
export { ImageUpload };
