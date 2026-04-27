import React, { useRef, useState } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { checkImageBlur } from '../utils/imageQuality';
import { UploadCloud } from 'lucide-react';

export default function UploadsPanel() {
  const { addImage } = useCanvasStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [blurWarning, setBlurWarning] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    setIsProcessing(true);
    setBlurWarning(null);

    const isBlurry = await checkImageBlur(file);
    if (isBlurry) {
      setBlurWarning('Warning: The image you uploaded appears to be blurry or low quality. For best printing results, consider uploading a higher resolution or sharper image.');
    }

    const url = URL.createObjectURL(file);
    addImage(url);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6 mt-4">
      <p className="text-sm text-gray-500 leading-relaxed">
        Upload your own images to use in the design. High quality images are recommended.
      </p>

      <div 
        className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 hover:border-[#76D2F4] transition-all cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className="text-gray-400 mb-2" size={32} />
        <p className="text-sm font-semibold text-gray-700">Click to upload image</p>
        <p className="text-xs text-gray-400 mt-1">JPEG, PNG, SVG</p>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          accept="image/*" 
          className="hidden" 
        />
      </div>

      {isProcessing && (
        <div className="text-sm text-[#009ceb] font-medium text-center">
          Analyzing image quality...
        </div>
      )}

      {blurWarning && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {blurWarning}
        </div>
      )}
    </div>
  );
}
