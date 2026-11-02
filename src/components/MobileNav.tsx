import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface NavGroup { label: string; links: { title: string; url: string }[] }

export default function MobileNav({ groups = [] }: { groups?: NavGroup[] }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const close = () => setIsMenuOpen(false);

  // Close on Escape and lock body scroll while the menu is open
  useEffect(() => {
    if (!isMenuOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isMenuOpen]);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsMenuOpen((v) => !v)}
        className="text-gray-600 relative z-50"
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMenuOpen}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMenuOpen && (
        <>
          {/* Backdrop — tap outside to close */}
          <div
            className="fixed inset-0 top-16 bg-black/40 z-40"
            onClick={close}
            aria-hidden="true"
          />

          {/* Panel — anchored under the sticky 4rem header, scrolls if tall */}
          <div className="fixed top-16 inset-x-0 z-50 bg-white border-b border-gray-200 py-4 px-6 shadow-md max-h-[calc(100vh-4rem)] overflow-y-auto overscroll-contain">
            <nav className="flex flex-col space-y-4">
              <a href="/" onClick={close} className="text-left text-lg font-semibold py-2">Home</a>
              <a href="/best-of/" onClick={close} className="text-left text-lg font-semibold py-2">Best of 2026</a>
              {groups.map((group) => (
                <div key={group.label} className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">{group.label}</p>
                  <div className="flex flex-col space-y-2">
                    {group.links.map((link) => (
                      <a key={link.url} href={link.url} onClick={close} className="text-base text-gray-700 py-1">{link.title}</a>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
