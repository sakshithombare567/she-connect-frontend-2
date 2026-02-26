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
        <div className="flex h-screen bg-[#f8fafc] font-sans text-gray-900">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 overflow-y-auto relative">
                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-md z-40 px-6 py-4 flex justify-between items-center border-b border-gray-50">
                    <h1 className="text-xl font-black tracking-tighter">She<span className="text-pink-600">Connect</span></h1>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-50 rounded-xl text-gray-600">
                        <Menu size={24} />
                    </button>
                </header>

                <div className="max-w-5xl mx-auto p-6 md:p-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                        <div>
                            <p className="text-pink-600 font-bold uppercase tracking-widest text-xs mb-2">Community Voices</p>
                            <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
                                Travel <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">Stories</span> 📖
                            </h2>
                        </div>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-gray-900 text-white px-8 py-4 rounded-2xl hover:shadow-2xl hover:shadow-pink-100 transition-all font-bold flex items-center justify-center gap-2 group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <span className="relative flex items-center gap-2">
                                {showForm ? <X size={20} /> : <Plus size={20} />}
                                {showForm ? 'Cancel Writing' : 'Write a Story'}
                            </span>
                        </button>
                    </div>

                    {showForm && (
                        <div className="bg-white p-8 rounded-[32px] shadow-2xl shadow-pink-50/50 mb-10 border border-pink-100/50 animate-in slide-in-from-top-4 duration-300">
                            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                <span className="bg-pink-100 text-pink-600 p-2 rounded-xl"><Plus size={20} /></span>
                                Share your experience
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider text-[10px]">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={newBlog.title}
                                        onChange={handleInputChange}
                                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all font-semibold"
                                        placeholder="Give your blog a catchy title..."
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider text-[10px]">Content</label>
                                    <textarea
                                        name="content"
                                        value={newBlog.content}
                                        onChange={handleInputChange}
                                        rows="6"
                                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all font-medium leading-relaxed"
                                        placeholder="Write about your journey, safety tips, or recommendations..."
                                        required
                                    ></textarea>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="bg-pink-600 text-white px-10 py-4 rounded-2xl hover:bg-pink-700 hover:shadow-xl hover:shadow-pink-200 transition-all font-black text-sm uppercase tracking-widest"
                                    >
                                        Publish Story
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="space-y-8">
                        {blogs.length === 0 ? (
                            <div className="bg-white p-16 rounded-[40px] border border-dashed border-gray-200 text-center">
                                <p className="text-gray-400 font-bold text-lg">No blogs yet. Be the first to share your journey! ✨</p>
                            </div>
                        ) : (
                            blogs.map(blog => (
                                <div key={blog.id} className="bg-white p-8 md:p-10 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-white hover:border-pink-100 hover:shadow-pink-100/20 transition-all group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity"></div>

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            {blog.tags && blog.tags.map(tag => (
                                                <span key={tag} className="text-[10px] font-black text-pink-600 uppercase tracking-widest bg-pink-100/50 px-3 py-1 rounded-full border border-pink-100">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                        <h2 className="text-3xl font-black text-gray-900 mb-4 group-hover:text-pink-600 transition-colors leading-tight">
                                            {blog.title}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 font-bold mb-8">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
                                                    <User size={16} />
                                                </div>
                                                <span>{blog.author}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={18} className="text-rose-400" />
                                                <span>{blog.date}</span>
                                            </div>
                                            <div className="flex items-center gap-2 ml-auto">
                                                <Heart size={18} className="text-pink-500 fill-pink-500" />
                                                <span className="text-pink-600">{blog.likes || 0}</span>
                                            </div>
                                        </div>
                                        <div className="text-gray-700 leading-[1.8] font-medium text-lg whitespace-pre-wrap">
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
