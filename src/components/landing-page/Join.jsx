import React from 'react';

const Join = ({ onAuthClick }) => {
    return (
        <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
            {/* Decorative circles */}
            <div className="absolute top-[-50%] right-[-10%] w-96 h-96 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute bottom-[-40%] left-[-5%] w-80 h-80 rounded-full bg-white/10 blur-2xl"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                    <span className="block">Ready to join the movement?</span>
                    <span className="block mt-2 text-white/70">Start your journey with She Connect today.</span>
                </h2>
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={onAuthClick}
                        className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        style={{ background: 'white', color: 'var(--color-primary)' }}
                    >
                        Sign Up Now
                    </button>
                    <a
                        href="#"
                        className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-full text-white border-2 border-white/30 transition-all duration-300 hover:bg-white/15 hover:border-white/50"
                    >
                        Contact Us
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Join;
