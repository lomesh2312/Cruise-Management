import React from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    isDeleting?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Delete Item',
    message = 'Are you sure you want to delete this item? This action cannot be undone.',
    isDeleting = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#b8935e]/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-[#2a2a2a] bg-[#2a2a2a] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-red-100 bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                        <Trash2 className="w-8 h-8 text-red-600 text-red-500" />
                    </div>

                    <div>
                        <h3 className="text-xl font-black text-[#e5e5e5] text-[#e5e5e5] mb-2">{title}</h3>
                        <p className="text-[#a0a0a0] text-[#a0a0a0] text-sm">{message}</p>
                    </div>

                    <div className="flex gap-3 justify-center pt-2">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="px-6 py-2.5 rounded-xl font-bold text-[#a0a0a0] hover:bg-[#333333] text-[#a0a0a0] hover:bg-[#333333] transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
