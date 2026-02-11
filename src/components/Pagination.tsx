import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage?: number;
    totalItems: number;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage = 10,
    totalItems
}) => {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-between px-6 py-4 bg-[#2a2a2a] border-t border-[#3a3a3a] rounded-b-[32px]">
            <div className="flex items-center gap-2">
                <p className="text-sm text-[#a0a0a0]">
                    Showing <span className="font-bold text-[#e5e5e5]">{startItem}</span> to{' '}
                    <span className="font-bold text-[#e5e5e5]">{endItem}</span> of{' '}
                    <span className="font-bold text-[#e5e5e5]">{totalItems}</span> results
                </p>
            </div>

            <div className="flex items-center gap-2">
                
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-[#333333] text-[#e5e5e5] hover:bg-[#3a3a3a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="First page"
                >
                    <ChevronsLeft className="w-4 h-4" />
                </button>

                
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-[#333333] text-[#e5e5e5] hover:bg-[#3a3a3a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Previous page"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                
                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                            <span key={`ellipsis-${index}`} className="px-3 py-2 text-[#a0a0a0]">
                                ...
                            </span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => onPageChange(page as number)}
                                className={`min-w-[40px] px-3 py-2 rounded-lg font-bold text-sm transition-colors ${currentPage === page
                                        ? 'bg-[#b8935e] text-[#1a1a1a]'
                                        : 'bg-[#333333] text-[#e5e5e5] hover:bg-[#3a3a3a]'
                                    }`}
                            >
                                {page}
                            </button>
                        )
                    ))}
                </div>

                
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-[#333333] text-[#e5e5e5] hover:bg-[#3a3a3a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Next page"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>

                
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-[#333333] text-[#e5e5e5] hover:bg-[#3a3a3a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Last page"
                >
                    <ChevronsRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
