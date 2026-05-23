import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Learn = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVideo, setNewVideo] = useState({
    title: '',
    expert: '',
    category: 'Batting',
    videoId: ''
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const url = selectedCategory === 'All'
        ? `${API_URL}/videos`
        : `${API_URL}/videos?category=${selectedCategory}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setVideos(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [selectedCategory]);

  const sortedVideos = [...videos].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-center sm:text-left">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Learn from Experts
          </h1>
          <p className="mt-3 max-w-2xl text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
            Improve your game with coaching masterclasses from cricket legends.
          </p>
        </div>
        {user?.userType === 'coach' && (
          <button
            className="btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            + Add Video
          </button>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/90 transition-opacity" aria-hidden="true" onClick={() => setShowAddModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-dark rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white" id="modal-title">
                      Add New Masterclass Video
                    </h3>
                  </div>
                </div>
              </div>
              <div className="px-4 py-5 sm:p-6 space-y-4">
                {addError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                    {addError}
                  </div>
                )}
                <div>
                  <label className="label-base">Video Title</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Master the Cover Drive"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label-base">Expert / Coach Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Sachin Tendulkar"
                    value={newVideo.expert}
                    onChange={(e) => setNewVideo({ ...newVideo, expert: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label-base">Category</label>
                  <select
                    className="input-field"
                    value={newVideo.category}
                    onChange={(e) => setNewVideo({ ...newVideo, category: e.target.value })}
                  >
                    <option value="Batting">Batting</option>
                    <option value="Bowling">Bowling</option>
                    <option value="Fielding">Fielding</option>
                  </select>
                </div>
                <div>
                  <label className="label-base">YouTube Video ID</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. uH3YvVd9mBw"
                    value={newVideo.videoId}
                    onChange={(e) => setNewVideo({ ...newVideo, videoId: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Only the 11-character ID from the YouTube URL (e.g., from v=<strong>uH3YvVd9mBw</strong>)
                  </p>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 dark:bg-dark-light sm:px-6 sm:flex sm:flex-row-reverse rounded-b-xl border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  disabled={addLoading}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-cricket text-base font-medium text-white hover:bg-cricket-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cricket sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  onClick={async () => {
                    if (!newVideo.title || !newVideo.expert || !newVideo.category || !newVideo.videoId) {
                      setAddError("All fields are required.");
                      return;
                    }
                    try {
                      setAddLoading(true);
                      setAddError(null);
                      await axios.post(`${API_URL}/videos`, newVideo, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                      });
                      setShowAddModal(false);
                      setNewVideo({ title: '', expert: '', category: 'Batting', videoId: '' });
                      fetchVideos();
                    } catch (err) {
                      setAddError(err.response?.data?.error || "Failed to add video.");
                    } finally {
                      setAddLoading(false);
                    }
                  }}
                >
                  {addLoading ? 'Saving...' : 'Add Video'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cricket sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-col sm:flex-row gap-4 bg-white dark:bg-dark-light p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-cricket focus:border-cricket block p-2.5"
          >
            <option value="All">All Categories</option>
            <option value="Batting">Batting</option>
            <option value="Bowling">Bowling</option>
            <option value="Fielding">Fielding</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort by Date</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full sm:w-auto bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-cricket focus:border-cricket block p-2.5"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cricket"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl text-center">
          {error}
        </div>
      ) : sortedVideos.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-dark-light rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="text-4xl mb-4">🏏</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No videos found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or check back later for new content.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sortedVideos.map((video) => (
            <div key={video._id} className="bg-white dark:bg-dark-light rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-800">
              <div className="aspect-w-16 aspect-h-9 w-full relative pt-[56.25%]">
                <iframe
                  className="absolute top-0 left-0 w-full h-full border-0"
                  src={`https://www.youtube.com/embed/${video.videoId}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cricket-light/20 text-cricket dark:text-cricket-light">
                  {video.category}
                </span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {video.expert}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                {video.title}
              </h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Learn;
