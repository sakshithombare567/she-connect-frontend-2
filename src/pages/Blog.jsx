import React, { useState, useEffect } from 'react';
import { User, Calendar, Plus, X, ArrowLeft, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';

const Blog = () => {
    const [blogs, setBlogs] = useState([
        {
            id: 1,
            title: "My First Solo Trip",
            content: "It was an amazing experience traveling alone for the first time. I visited Jaipur and it was magical.",
            author: "Sakshi",
            date: "2024-03-15"
        },
        {
            id: 2,
            title: "Safety Tips for Women Travelers",
            content: "Always share your live location with trusted contacts. Keep emergency numbers handy.",
            author: "Admin",
            date: "2024-03-10"
        }
    ]);
    const [showForm, setShowForm] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
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
            date: new Date().toISOString().split('T')[0]
        };

        setBlogs([blog, ...blogs]);
        setNewBlog({ title: '', content: '' });
        setShowForm(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8 relative">
                    <h1 className="text-3xl font-bold text-gray-800">Community Blogs</h1>
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            <MoreVertical size={24} className="text-gray-600" />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                                <button
                                    onClick={() => {
                                        setShowForm(!showForm);
                                        setShowMenu(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 flex items-center space-x-2"
                                >
                                    {showForm ? <X size={18} /> : <Plus size={18} />}
                                    <span>{showForm ? 'Cancel Writing' : 'Write a Blog'}</span>
                                </button>
                                <Link
                                    to="/dashboard"
                                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 flex items-center space-x-2"
                                >
                                    <ArrowLeft size={18} />
                                    <span>Back to Dashboard</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {showForm && (
                    <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-pink-100">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Share your experience</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={newBlog.title}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                    placeholder="Give your blog a catchy title..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                <textarea
                                    name="content"
                                    value={newBlog.content}
                                    onChange={handleInputChange}
                                    rows="6"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                    placeholder="Write about your journey..."
                                    required
                                ></textarea>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors font-medium shadow-sm"
                                >
                                    Publish
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="space-y-6">
                    {blogs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No blogs yet. Be the first to write one!
                        </div>
                    ) : (
                        blogs.map(blog => (
                            <div key={blog.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">{blog.title}</h2>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                                    <div className="flex items-center space-x-1">
                                        <User size={16} className="text-pink-500" />
                                        <span>{blog.author}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Calendar size={16} className="text-pink-500" />
                                        <span>{blog.date}</span>
                                    </div>
                                </div>
                                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {blog.content}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Blog;
