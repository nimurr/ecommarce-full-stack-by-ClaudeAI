import { useState, useRef } from 'react';
import { FiUpload, FiX, FiImage, FiTrash2 } from 'react-icons/fi';

const ImageUpload = ({ 
  images = [], 
  onChange, 
  multiple = true, 
  label = 'Upload Images',
  preview = true 
}) => {
  const [previews, setPreviews] = useState(images.map(img => ({
    url: img.url || img,
    file: null,
    isNew: false
  })));
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    
    // Validate files
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert(`${file.name} is larger than 2MB`);
        return false;
      }
      return true;
    });

    // Create previews
    const newPreviews = validFiles.map(file => ({
      url: URL.createObjectURL(file),
      file,
      isNew: true
    }));

    const updatedPreviews = multiple ? [...previews, ...newPreviews] : newPreviews;
    setPreviews(updatedPreviews);
    
    // Notify parent component
    if (onChange) {
      onChange(multiple ? updatedPreviews : updatedPreviews[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (index) => {
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setPreviews(updatedPreviews);
    
    if (onChange) {
      onChange(updatedPreviews);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
        
        <FiUpload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-1">
          Drag and drop images here, or click to select
        </p>
        <p className="text-xs text-gray-500">
          Supported formats: JPG, PNG, WebP (Max 2MB)
        </p>
        
        <button
          type="button"
          onClick={onButtonClick}
          className="mt-3 btn-primary text-sm"
        >
          Select Files
        </button>
      </div>

      {/* Previews */}
      {preview && previews.length > 0 && (
        <div className={`grid gap-4 ${
          multiple ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'
        }`}>
          {previews.map((preview, index) => (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
              <img
                src={preview.url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Remove button */}
              {preview.isNew && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              )}
              
              {/* Image info */}
              {preview.file && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="truncate">{preview.file.name}</p>
                  <p>{(preview.file.size / 1024).toFixed(0)} KB</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No images message */}
      {!preview && previews.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FiImage className="w-16 h-16 mx-auto mb-2 opacity-20" />
          <p>No images uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
