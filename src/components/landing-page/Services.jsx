import React from 'react';

const Services = () => {
    const services = [
        {
            title: 'Mentorship Programs',
            description: 'Connect with experienced mentors who can guide you through your career and personal life.',
            icon: '🌱'
        },
        {
            title: 'Networking Events',
            description: 'Join exclusive events, workshops, and meetups designed to expand your professional circle.',
            icon: '🤝'
        },
        {
            title: 'Skill Workshops',
            description: 'Learn new skills from industry experts in our interactive online and offline workshops.',
            icon: '📚'
        },
        {
            title: 'Wellness Support',
            description: 'Access resources and support groups focused on mental and physical well-being.',
            icon: '🧘‍♀️'
        }
    ];

    return (
        <section id="services" className="py-24" style={{ background: 'var(--color-surface-alt, #F5F0FA)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--color-primary)' }}>Our Services</h2>
                    <p className="mt-2 text-3xl leading-snug font-extrabold tracking-tight sm:text-4xl" style={{ color: 'var(--color-text-primary)' }}>
                        What We Offer
                    </p>
                    <p className="mt-4 max-w-2xl text-lg lg:mx-auto leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        Tailored services designed to help you succeed in every aspect of your life.
                    </p>
                </div>

                <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="glass rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 p-6 flex flex-col items-center text-center group relative"
                        >
                            {/* Bottom accent bar */}
                            <div
                                className="absolute bottom-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}
                            ></div>

                            <div
                                className="text-4xl mb-5 p-4 rounded-2xl w-20 h-20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                                style={{ background: 'var(--color-primary-light)' }}
                            >
                                {service.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{service.title}</h3>
                            <p className="leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{service.description}</p>
                            <button
                                className="mt-auto pt-5 font-semibold transition-colors duration-300"
                                style={{ color: 'var(--color-primary)' }}
                                onMouseEnter={e => e.target.style.color = 'var(--color-primary-dark)'}
                                onMouseLeave={e => e.target.style.color = 'var(--color-primary)'}
                            >
                                Learn more &rarr;
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
