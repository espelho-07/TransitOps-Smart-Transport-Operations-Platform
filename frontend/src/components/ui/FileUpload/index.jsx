import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, Check } from 'lucide-react';
import Button from '../Button';
import Progress from '../Progress';

/**
 * Reusable Drag-and-Drop File Upload Zone.
 * @param {Object} props
 * @param {function} props.onFileSelect - Triggers when files are drop-selected
 * @param {string} props.accept - Accept file types (default '*')
 * @param {boolean} props.multiple - Supports picking multiple files
 */
const FileUpload = ({
  onFileSelect,
  accept = '*',
  multiple = false,
  maxSizeMB = 5,
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFiles = (files) => {
    const list = Array.from(files);
    
    // Check file size limits
    const validFiles = list.filter(f => f.size / (1024 * 1024) <= maxSizeMB);
    if (validFiles.length < list.length) {
      alert(`Some files exceed the ${maxSizeMB}MB limit.`);
    }

    const nextFiles = validFiles.map(f => ({
      file: f,
      name: f.name,
      size: (f.size / 1024).toFixed(1) + ' KB',
      progress: 100, // Mock complete immediately for UI state
      uploaded: true
    }));

    const updated = multiple ? [...selectedFiles, ...nextFiles] : nextFiles;
    setSelectedFiles(updated);
    onFileSelect && onFileSelect(multiple ? updated.map(x => x.file) : updated[0]?.file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const handleRemove = (idx, e) => {
    e.stopPropagation();
    const updated = selectedFiles.filter((_, i) => i !== idx);
    setSelectedFiles(updated);
    onFileSelect && onFileSelect(multiple ? updated.map(x => x.file) : null);
  };

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* Dropzone field */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all bg-card/40
          ${dragActive ? 'border-info bg-info/5 scale-[0.99]' : 'border-border hover:border-hover'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="p-3 bg-hover rounded-full text-text-secondary/70 mb-3.5">
          <UploadCloud size={24} strokeWidth={1.5} />
        </div>
        
        <h4 className="text-xs sm:text-sm font-bold text-text-main">
          Drag & drop files here, or <span className="text-info hover:underline">browse</span>
        </h4>
        <p className="text-[11px] text-text-secondary mt-1 font-semibold uppercase tracking-wider">
          Formats allowed: {accept} (Max {maxSizeMB}MB)
        </p>
      </div>

      {/* Uploaded Files list */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {selectedFiles.map((fileObj, idx) => (
            <div
              key={fileObj.name + idx}
              className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg"
            >
              <File size={16} className="text-text-secondary/70" />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <p className="text-text-main truncate pr-2">{fileObj.name}</p>
                  <p className="text-text-secondary flex-shrink-0">{fileObj.size}</p>
                </div>
                {fileObj.progress < 100 ? (
                  <Progress value={fileObj.progress} size="sm" />
                ) : (
                  <div className="flex items-center gap-1 text-[10px] text-success font-bold uppercase tracking-wider">
                    <Check size={12} />
                    <span>Upload complete</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => handleRemove(idx, e)}
                className="text-text-secondary hover:text-danger p-1 rounded-md hover:bg-hover transition-colors focus:outline-none"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
export { FileUpload };
