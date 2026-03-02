import React from 'react';

const Hero = () => {
    return (
        <section id="home" className="relative pt-20 pb-24 sm:pt-24 sm:pb-36 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
            {/* Background decoration blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob" style={{ background: 'var(--color-primary)' }}></div>
                <div className="absolute top-[-5%] right-[-10%] w-[250px] h-[250px] sm:w-[450px] sm:h-[450px] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob-delay-2" style={{ background: 'var(--color-accent)' }}></div>
                <div className="absolute bottom-[-15%] left-[25%] w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob-delay-4" style={{ background: 'var(--color-accent-alt)' }}></div>
            </div>

            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs sm:text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-primary)' }}></span>
                    Empowering 5,000+ Women Worldwide
                </div>

                <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                    Empowering Women to <br className="hidden sm:block" />
                    <span style={{
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>Connect & Thrive</span>
                </h1>
                <p className="text-base sm:text-xl max-w-2xl mx-auto leading-relaxed px-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Join a community of inspiring women. Network, learn, and grow together in a supportive environment designed for your success.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4 px-4 sm:px-0">
                    <button
                        className="px-6 sm:px-8 py-3.5 sm:py-4 text-white rounded-full font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
                    >
                        Get Started
                    </button>
                    <button
                        className="px-6 sm:px-8 py-3.5 sm:py-4 glass rounded-full font-semibold text-base sm:text-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        style={{ color: 'var(--color-primary)' }}
                    >
                        Learn More
                    </button>
                </div>
            </div>

            {/* Dashboard Preview — hidden on very small screens */}
            <div className="mt-10 sm:mt-16 w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl glass p-1.5 sm:p-2 animate-float hidden sm:block">
                <div className="aspect-[16/9] rounded-xl flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-surface-alt, #F5F0FA))' }}>
                    {/* Mock Dashboard UI Elements */}
                    <div className="absolute inset-0 p-4 sm:p-6 flex flex-col gap-3 opacity-60">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ background: 'var(--color-primary)' }}></div>
                            <div className="w-3 h-3 rounded-full" style={{ background: 'var(--color-accent-alt)' }}></div>
                            <div className="w-3 h-3 rounded-full" style={{ background: 'var(--color-accent)' }}></div>
                        </div>
                        <div className="h-4 w-1/3 rounded-full" style={{ background: 'var(--color-primary)', opacity: 0.3 }}></div>
                        <div className="flex gap-3 mt-2">
                            <div className="glass rounded-xl p-4 flex-1 h-16 sm:h-20"></div>
                            <div className="glass rounded-xl p-4 flex-1 h-16 sm:h-20"></div>
                            <div className="glass rounded-xl p-4 flex-1 h-16 sm:h-20"></div>
                        </div>
                        <div className="glass rounded-xl p-4 flex-1 mt-2"></div>
                    </div>
                    <span className="relative text-sm sm:text-lg font-semibold z-10" style={{ color: 'var(--color-text-secondary)' }}>Interactive Community Dashboard Preview</span>
                </div>
            </div>
        </section>
    );
};

export default Hero;
