import React, { useState, useEffect } from 'react';
import { User, Calendar, Plus, X, Menu, Heart } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { mockBlogs } from '../data/mockData';

const Blog = () => {
    const [blogs, setBlogs] = useState(mockBlogs);
    const [showForm, setShowForm] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [newBlog, setNewBlog] = useState({ title: '', content: '' });

    useEffect(() => {
        const storedBlogs = localStorage.getItem('sheconnect_blogs');
        if (storedBlogs) {
            setBlogs(JSON.parse(storedBlogs));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('sheconnect_blogs', JSON.stringify(blogs));
    }, [blogs]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewBlog({ ...newBlog, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newBlog.title || !newBlog.content) return;

        const blog = {
            id: Date.now(),
            title: newBlog.title,
            content: newBlog.content,
            author: "You",
            date: new Date().toISOString().split('T')[0],
            likes: 0
        };

        setBlogs([blog, ...blogs]);
        setNewBlog({ title: '', content: '' });
        setShowForm(false);
    };

    return (
        <div className="flex h-screen" style={{ background: 'var(--color-surface-alt, #F5F0FA)', color: 'var(--color-text-primary)' }}>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 glass-strong z-40 px-4 py-3 flex justify-between items-center">
                    <h1 className="text-lg font-black tracking-tighter" style={{ color: 'var(--color-text-primary)' }}>She<span style={{ color: 'var(--color-primary)' }}>Connect</span></h1>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-xl" style={{ background: 'var(--color-primary-light)', color: 'var(--color-text-secondary)' }}>
                        <Menu size={22} />
                    </button>
                </header>

                <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-10 gap-4 sm:gap-6">
                        <div>
                            <p className="font-bold uppercase tracking-widest text-xs mb-2" style={{ color: 'var(--color-primary)' }}>Community Voices</p>
                            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                                Travel <span style={{
                                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>Stories</span> 📖
                            </h2>
                        </div>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl hover:shadow-2xl transition-all font-bold flex items-center justify-center gap-2 group overflow-hidden relative text-sm sm:text-base"
                            style={{ background: 'var(--color-text-primary)' }}
                        >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}></div>
                            <span className="relative flex items-center gap-2">
                                {showForm ? <X size={20} /> : <Plus size={20} />}
                                {showForm ? 'Cancel Writing' : 'Write a Story'}
                            </span>
                        </button>
                    </div>

                    {showForm && (
                        <div className="glass-strong p-8 rounded-[32px] shadow-2xl mb-10">
                            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                <span className="p-2 rounded-xl" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}><Plus size={20} /></span>
                                Share your experience
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1">
                                    <label className="block font-bold ml-1 uppercase tracking-wider text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={newBlog.title}
                                        onChange={handleInputChange}
                                        className="w-full p-4 rounded-2xl outline-none transition-all font-semibold glass"
                                        style={{ color: 'var(--color-text-primary)' }}
                                        placeholder="Give your blog a catchy title..."
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-bold ml-1 uppercase tracking-wider text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Content</label>
                                    <textarea
                                        name="content"
                                        value={newBlog.content}
                                        onChange={handleInputChange}
                                        rows="6"
                                        className="w-full p-4 rounded-2xl outline-none transition-all font-medium leading-relaxed glass"
                                        style={{ color: 'var(--color-text-primary)' }}
                                        placeholder="Write about your journey, safety tips, or recommendations..."
                                        required
                                    ></textarea>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="text-white px-10 py-4 rounded-2xl hover:shadow-xl transition-all font-black text-sm uppercase tracking-widest"
                                        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
                                    >
                                        Publish Story
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="space-y-8">
                        {blogs.length === 0 ? (
                            <div className="glass p-16 rounded-[40px] border border-dashed text-center" style={{ borderColor: 'var(--color-text-secondary)' }}>
                                <p className="font-bold text-lg" style={{ color: 'var(--color-text-secondary)' }}>No blogs yet. Be the first to share your journey! ✨</p>
                            </div>
                        ) : (
                            blogs.map(blog => (
                                <div key={blog.id} className="glass p-8 md:p-10 rounded-[40px] shadow-lg hover:shadow-xl transition-all group overflow-hidden relative hover:-translate-y-0.5">
                                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity" style={{ background: 'var(--color-primary-light)' }}></div>

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            {blog.tags && blog.tags.map(tag => (
                                                <span key={tag} className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-light)' }}>
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                        <h2 className="text-3xl font-black mb-4 transition-colors leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                                            {blog.title}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-6 text-sm font-bold mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                                                    <User size={16} />
                                                </div>
                                                <span>{blog.author}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={18} style={{ color: 'var(--color-accent)' }} />
                                                <span>{blog.date}</span>
                                            </div>
                                            <div className="flex items-center gap-2 ml-auto">
                                                <Heart size={18} style={{ color: 'var(--color-primary)', fill: 'var(--color-primary)' }} />
                                                <span style={{ color: 'var(--color-primary)' }}>{blog.likes || 0}</span>
                                            </div>
                                        </div>
                                        <div className="leading-[1.8] font-medium text-lg whitespace-pre-wrap" style={{ color: 'var(--color-text-secondary)' }}>
                                            {blog.content}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Blog;
