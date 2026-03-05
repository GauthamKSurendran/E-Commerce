import React, { useState, useEffect } from 'react';

const AdminNewsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. FETCH SUBSCRIBERS FROM BACKEND
  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/admin/newsletter", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setSubscribers(data);
      } else {
        console.error("Error fetching subscribers:", data.message);
      }
    } catch (err) {
      console.error("Network error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. CLEAR LIST ON BACKEND
  const clearList = async () => {
    if (!window.confirm("Are you sure you want to permanently clear the subscriber list?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/admin/newsletter", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        setSubscribers([]);
        alert("Subscriber list cleared successfully.");
      } else {
        const data = await res.json();
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="container mt-5 pt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
           <h2 className="fw-black text-uppercase ls-1 m-0">Newsletter Database</h2>
           <p className="text-muted small">Manage your marketing mailing list</p>
        </div>
        <button 
          className="btn btn-outline-danger btn-sm rounded-0 fw-bold px-3" 
          onClick={clearList}
          disabled={subscribers.length === 0}
        >
          CLEAR ALL RECORDS
        </button>
      </div>
      
      <div className="card shadow-sm border-0 rounded-0">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th className="extra-small fw-bold text-uppercase p-3 ls-1">#</th>
                <th className="extra-small fw-bold text-uppercase p-3 ls-1">Email Address</th>
                <th className="extra-small fw-bold text-uppercase p-3 ls-1 text-end pe-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" className="text-center p-5"><div className="spinner-border spinner-border-sm"></div></td></tr>
              ) : subscribers.length > 0 ? (
                subscribers.map((sub, index) => (
                  <tr key={sub._id || index}>
                    <td className="p-3 small text-muted">{index + 1}</td>
                    <td className="p-3 fw-bold">{sub.email}</td>
                    <td className="p-3 text-end pe-4">
                      <span className="badge bg-light text-success rounded-0 border border-success">ACTIVE</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center p-5 text-muted">
                    <i className="bi bi-envelope-x d-block fs-2 mb-2 opacity-25"></i>
                    No subscribers found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminNewsletter;