import React from 'react';

const Footer = () => {
    return (
        <footer className="py-14" style={{ background: 'var(--color-text-primary)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">

                {/* Brand */}
                <div>
                    <span className="text-2xl font-bold" style={{
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        She Connect
                    </span>
                    <p className="mt-4 text-gray-400 leading-relaxed">
                        Empowering women globally. Join us to connect, learn, and grow.
                    </p>
                </div>

                {/* Links */}
                <div className="flex flex-col space-y-3">
                    <h3 className="text-lg font-semibold text-white mb-2">Quick Links</h3>
                    <a href="#home" className="text-gray-400 hover:text-white transition-colors duration-300">Home</a>
                    <a href="#about" className="text-gray-400 hover:text-white transition-colors duration-300">About Us</a>
                    <a href="#services" className="text-gray-400 hover:text-white transition-colors duration-300">Services</a>
                </div>

                {/* Socials */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Connect With Us</h3>
                    <div className="flex justify-center md:justify-start space-x-4">
                        {['🐦', '📸', '💼'].map((emoji, i) => (
                            <a
                                key={i}
                                href="#"
                                className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                                style={{ background: 'rgba(255,255,255,0.08)' }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, var(--color-primary), var(--color-accent))';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                }}
                            >
                                <span className="text-lg">{emoji}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-10 border-t pt-8 text-center text-gray-500 max-w-7xl mx-auto px-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <p>&copy; {new Date().getFullYear()} She Connect. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
