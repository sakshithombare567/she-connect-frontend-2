import React, { useState, useEffect } from 'react';

const Navbar = ({ onAuthClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'glass-strong shadow-lg shadow-black/5' : 'bg-transparent'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-18 items-center py-4">
                    <div className="flex-shrink-0 flex items-center">
                        <span className="text-2xl font-bold cursor-pointer" style={{
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            She Connect
                        </span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-8 items-center">
                        <a href="#home" className="font-medium transition-colors duration-300 hover:opacity-100 opacity-70" style={{ color: 'var(--color-text-primary)' }}>Home</a>
                        <a href="#about" className="font-medium transition-colors duration-300 hover:opacity-100 opacity-70" style={{ color: 'var(--color-text-primary)' }}>About Us</a>
                        <a href="#services" className="font-medium transition-colors duration-300 hover:opacity-100 opacity-70" style={{ color: 'var(--color-text-primary)' }}>Our Services</a>
                        <button
                            onClick={onAuthClick}
                            className="text-white px-6 py-2.5 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
                        >
                            Sign In
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-xl transition-colors duration-300"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden glass-strong absolute w-full left-0 rounded-b-2xl shadow-xl">
                    <div className="px-4 pt-3 pb-5 space-y-1 text-center">
                        <a href="#home" className="block px-3 py-3 rounded-xl text-base font-medium transition-all duration-300 hover:bg-white/50" style={{ color: 'var(--color-text-primary)' }} onClick={() => setIsOpen(false)}>Home</a>
                        <a href="#about" className="block px-3 py-3 rounded-xl text-base font-medium transition-all duration-300 hover:bg-white/50" style={{ color: 'var(--color-text-primary)' }} onClick={() => setIsOpen(false)}>About Us</a>
                        <a href="#services" className="block px-3 py-3 rounded-xl text-base font-medium transition-all duration-300 hover:bg-white/50" style={{ color: 'var(--color-text-primary)' }} onClick={() => setIsOpen(false)}>Our Services</a>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                onAuthClick();
                            }}
                            className="w-full mt-3 text-white px-5 py-3 rounded-full font-semibold transition-all duration-300 shadow-md"
                            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
