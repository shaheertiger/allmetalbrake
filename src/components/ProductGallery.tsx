import { useState } from 'react';

interface ProductGalleryProps {
    images: string[];
    productName: string;
    badge?: string;
}

export default function ProductGallery({ images, productName, badge }: ProductGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!images || images.length === 0) return null;

    return (
        <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] bg-white">
                {badge && (
                    <div className="absolute top-4 left-4 z-10">
                        <span className="bg-[#1E90FF] text-white px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest shadow-sm">
                            {badge}
                        </span>
                    </div>
                )}
                <img
                    src={images[activeIndex]}
                    alt={`${productName} view ${activeIndex + 1}`}
                    className="w-full h-full object-contain p-4"
                    loading="lazy"
                    decoding="async"
                />
            </div>

            {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`relative rounded-lg overflow-hidden border-2 transition-all ${activeIndex === idx
                                ? 'border-[#1E90FF] ring-2 ring-[#1E90FF]/30 opacity-100'
                                : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'
                                }`}
                        >
                            <img
                                src={img}
                                alt={`${productName} thumbnail ${idx + 1}`}
                                className="w-full h-16 object-cover"
                                loading="lazy"
                                decoding="async"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
