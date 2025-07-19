import React from 'react';
import { X } from 'lucide-react';

interface ExerciseModalProps {
  isOpen: boolean;
  title: string;
  videoUrl: string;
  onClose: () => void;
}

const ExerciseModal: React.FC<ExerciseModalProps> = ({ 
  isOpen, 
  title, 
  videoUrl, 
  onClose 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-stone-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors duration-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="aspect-video">
          <iframe
            src={videoUrl}
            title={title}
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            className="rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default ExerciseModal;