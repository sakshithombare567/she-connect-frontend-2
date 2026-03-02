import React from 'react';

const About = () => {
    const features = [
        {
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            title: 'Community First',
            description: 'We believe in the power of community. Our platform connects you with like-minded women who share your goals and values.',
        },
        {
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            title: 'Empowerment',
            description: 'Providing tools and resources to help you take charge of your personal and professional growth.',
        },
    ];

    return (
        <section id="about" className="py-24" style={{ background: 'var(--color-surface)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:text-center mb-16">
                    <h2 className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--color-primary)' }}>Who We Are</h2>
                    <p className="mt-2 text-3xl leading-snug font-extrabold tracking-tight sm:text-4xl" style={{ color: 'var(--color-text-primary)' }}>
                        A Safe Space for Women
                    </p>
                    <p className="mt-4 max-w-2xl text-lg lg:mx-auto leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        She Connect is more than just a platform; it's a movement. We are dedicated to empowering women through connection, education, and mutual support.
                    </p>
                </div>

                <div className="mt-10">
                    <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                        {features.map((feature, index) => (
                            <div key={index} className="glass rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
                                <div className="flex items-start gap-5">
                                    <div
                                        className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110"
                                        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
                                    >
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <p className="text-lg leading-6 font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{feature.title}</p>
                                        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
