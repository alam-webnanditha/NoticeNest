
import { useEffect, useState } from 'react';
import './App.css';

// Backend API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to check if notice date has passed
const isDateExpired = (dateValue) => {
  if (!dateValue) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const noticeDate = new Date(dateValue);
  const noticeDay = new Date(
    noticeDate.getFullYear(),
    noticeDate.getMonth(),
    noticeDate.getDate()
  );
  return noticeDay < today;
};

// Helper to format date cleanly
const formatNoticeDate = (dateValue) => {
  if (!dateValue) return 'No date provided';
  try {
    return new Date(dateValue).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return String(dateValue);
  }
};

function App() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  // Fetch notices from the backend
  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/notices`);

      if (!response.ok) {
        throw new Error('Failed to fetch notices');
      }

      const data = await response.json();
      setNotices(data.notices || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to load notices. Please check whether the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    fetch(`${API_BASE_URL}/api/notices`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch notices');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setNotices(data.notices || []);
          setError('');
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error(err);
          setError('Unable to load notices. Please check whether the backend is running.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute Dashboard Statistics
  const totalCount = notices.length;
  const verifiedCount = notices.filter((n) => n.verified).length;
  const urgentCount = notices.filter((n) => n.urgent).length;
  const archivedCount = notices.filter((n) => isDateExpired(n.date)).length;

  // Filter notices based on search query and category
  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title?.toLowerCase().includes(search.toLowerCase()) ||
      notice.publisher?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || notice.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Automatically separate into Active and Archived (Expired) Notices
  const activeNotices = filteredNotices.filter((n) => !isDateExpired(n.date));
  const archivedNotices = filteredNotices.filter((n) => isDateExpired(n.date));

  // Handle new notice submission
  const handleAddNotice = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const newNotice = {
      title: formData.get('title'),
      category: formData.get('category'),
      date: formData.get('date'),
      publisher: formData.get('publisher'),
      urgent: formData.get('urgent') === 'on'
    };

    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/api/notices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newNotice)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add notice');
      }

      setFeedback({
        message: 'Notice posted successfully! It is unverified by default.',
        type: 'success'
      });
      form.reset();

      // Refresh notices to display the new unverified notice
      if (data.notice) {
        setNotices((prev) => [data.notice, ...prev]);
      } else {
        fetchNotices();
      }

      setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
    } catch (err) {
      setFeedback({
        message: err.message || 'Error adding notice',
        type: 'error'
      });
      setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle verification status
  const handleToggleVerify = async (id, currentVerified) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notices/${id}/verify`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verified: !currentVerified })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update verification status');
      }

      setNotices((prev) =>
        prev.map((n) => (n._id === id ? { ...n, verified: !currentVerified } : n))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // Render a Notice Card component
  const renderNoticeCard = (notice, isArchived = false) => (
    <div className={`notice-card ${isArchived ? 'archived-card' : ''}`} key={notice._id || notice.title}>
      <div className="card-top-row">
        <div className="card-tags">
          {notice.urgent && <span className="urgent">🔴 URGENT</span>}
          <span className="category">{notice.category}</span>
          {isArchived && <span className="archived-pill">📦 Expired</span>}
        </div>

        {/* Verification Status Badge */}
        {notice.verified ? (
          <span className="verification-label verified">✓ Verified</span>
        ) : (
          <span className="verification-label unverified">⏳ Unverified</span>
        )}
      </div>

      <h3>{notice.title}</h3>

      <div className="card-details">
        <p className="date-info">
          📅 {formatNoticeDate(notice.date)}
          {isArchived && <span className="expired-text"> (Date passed)</span>}
        </p>
        <p className="publisher-info">🏫 {notice.publisher}</p>
      </div>

      <div className="card-footer">
        {notice.verified ? (
          <span className="verified-status-text">✓ Verified Publisher</span>
        ) : (
          <span className="unverified-status-text">⚠️ Pending Verification</span>
        )}

        {notice._id && (
          <button
            type="button"
            className="verify-toggle-btn"
            onClick={() => handleToggleVerify(notice._id, notice.verified)}
            title="Click to toggle verification status"
          >
            {notice.verified ? 'Mark Unverified' : 'Approve & Verify'}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="app">
      <header className="navbar">
        <h2>📢 NoticeNest</h2>
        <span>Verified Campus Noticeboard</span>
      </header>

      <main className="container">
        {/* Welcome & Search Section */}
        <section className="welcome">
          <p className="tagline">YOUR CAMPUS. ONE PLACE.</p>
          <h1>
            Stay updated with <span>NoticeNest.</span>
          </h1>
          <p>
            Never miss an important campus announcement again. Find all your
            college updates in one place.
          </p>

          <div className="search-filter-bar">
            <input
              type="text"
              placeholder="🔍 Search notices by title or publisher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Examination">Examination</option>
              <option value="Events">Events</option>
              <option value="Placement">Placement</option>
              <option value="General">General</option>
            </select>
          </div>
        </section>

        {/* 1. Dashboard Overview */}
        <section className="dashboard-section">
          <div className="dashboard-header">
            <h2>📊 Campus Noticeboard Dashboard</h2>
            <span className="dashboard-subtitle">Real-time statistics & verification status</span>
          </div>

          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <span className="stat-label">Total Notices</span>
                <h3 className="stat-number">{totalCount}</h3>
              </div>
            </div>

            <div className="stat-card verified">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <span className="stat-label">Verified Notices</span>
                <h3 className="stat-number">{verifiedCount}</h3>
              </div>
            </div>

            <div className="stat-card urgent">
              <div className="stat-icon">🔴</div>
              <div className="stat-content">
                <span className="stat-label">Urgent Notices</span>
                <h3 className="stat-number">{urgentCount}</h3>
              </div>
            </div>

            <div className="stat-card archived">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <span className="stat-label">Archived Notices</span>
                <h3 className="stat-number">{archivedCount}</h3>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Add Notice Section */}
        <section className="add-notice-section">
          <div className="form-header">
            <h2>➕ Add a New Notice</h2>
            <p className="form-note">
              Newly submitted notices remain <strong>unverified</strong> by default until approved.
            </p>
          </div>

          {feedback.message && (
            <div className={`feedback-alert ${feedback.type}`}>
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleAddNotice}>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Notice Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. End Semester Exam Timetable"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select name="category" required defaultValue="">
                  <option value="" disabled>Select Category</option>
                  <option value="Examination">Examination</option>
                  <option value="Events">Events</option>
                  <option value="Placement">Placement</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notice Date</label>
                <input type="date" name="date" required />
              </div>

              <div className="form-group">
                <label>Publisher</label>
                <input
                  type="text"
                  name="publisher"
                  placeholder="e.g. Examination Cell"
                  required
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="urgent" />
                  <span>Mark as Urgent Notice</span>
                </label>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Submitting Notice...' : '📢 Publish Notice'}
            </button>
          </form>
        </section>

        {/* Status Feedback (Loading / Error) */}
        {loading && (
          <div className="state-message">
            <p>⏳ Loading campus notices...</p>
          </div>
        )}

        {error && (
          <div className="state-message error">
            <p>❌ {error}</p>
            <button onClick={fetchNotices} className="retry-btn">
              🔄 Retry Connection
            </button>
          </div>
        )}

        {/* 3. Active / Latest Notices Section */}
        {!loading && !error && (
          <section className="notice-section">
            <div className="section-title-row">
              <h2>📌 Latest Active Notices</h2>
              <span className="count-badge">{activeNotices.length} active</span>
            </div>

            {activeNotices.length > 0 ? (
              <div className="notice-grid">
                {activeNotices.map((notice) => renderNoticeCard(notice, false))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No active notices found matching your search or filter.</p>
              </div>
            )}
          </section>
        )}

        {/* 4. Automatic Notice Expiry: Archived Notices Section */}
        {!loading && !error && (
          <section className="notice-section archive-section">
            <div className="section-title-row">
              <div>
                <h2>📦 Archived Notices</h2>
                <p className="archive-subtitle">
                  These notices have passed their scheduled date and are automatically moved here for reference. They remain safely stored in MongoDB.
                </p>
              </div>
              <span className="count-badge archive-badge">
                {archivedNotices.length} archived
              </span>
            </div>

            {archivedNotices.length > 0 ? (
              <div className="notice-grid">
                {archivedNotices.map((notice) => renderNoticeCard(notice, true))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No archived notices yet. Notices whose dates have passed will automatically appear here.</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
