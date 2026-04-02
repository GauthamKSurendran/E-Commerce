import React, { useState, useEffect, useContext } from "react";
import { OrderContext } from "../context/OrderProvider";
import { AuthContext } from "../context/AuthContext";

/**
 * Integrated Professional Profile Page
 * Redesigned for a clean, SaaS-inspired experience.
 */
function Profile({ user }) {
  const orderData = useContext(OrderContext);
  const orders = orderData?.orders || [];
  const { login } = useContext(AuthContext) || {};

  const [editing, setEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    addresses: [],
  });

  const [newAddress, setNewAddress] = useState({
    name: "", street: "", city: "", state: "", zip: "",
  });

  const myOrders = orders.filter(
    (order) => order?.userEmail?.toLowerCase() === profile?.email?.toLowerCase()
  );

  useEffect(() => {
    const fetchFreshProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`http://localhost:5000/api/users/profile`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const freshData = await res.json();
          setProfile({
            name: freshData.name,
            email: freshData.email,
            phone: freshData.phone || "",
            addresses: freshData.addresses || [],
            createdAt: freshData.createdAt // Added for the UI
          });
          localStorage.setItem("user", JSON.stringify(freshData));
        }
      } catch (err) {
        console.error("Error fetching fresh profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchFreshProfile();
    else setIsLoading(false);
  }, [user]);

  const handleAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (updatedProfileData) => {
    const dataToSend = updatedProfileData || profile;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setProfile({
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone || "",
          addresses: updatedUser.addresses || []
        });
        localStorage.setItem("user", JSON.stringify(updatedUser));
        if (login) login(updatedUser, token);
        setEditing(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Update failed:", err);
      return false;
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const updatedAddresses = [...profile.addresses, { ...newAddress }];
    const updatedProfile = { ...profile, addresses: updatedAddresses };
    setNewAddress({ name: "", street: "", city: "", state: "", zip: "" });
    const success = await handleSaveProfile(updatedProfile);
    if (!success) alert("Failed to save address.");
  };

  const deleteAddress = async (id) => {
    if (window.confirm("Delete this address?")) {
      const updatedAddresses = profile.addresses.filter((a) => a._id !== id && a.id !== id);
      const updatedProfile = { ...profile, addresses: updatedAddresses };
      await handleSaveProfile(updatedProfile);
    }
  };

  if (!user) {
    return (
      <div className="container mt-5 pt-5 text-center min-vh-100 d-flex align-items-center justify-content-center">
        <h4 className="fw-black ls-1">PLEASE LOGIN TO VIEW PROFILE</h4>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mt-5 pt-5 text-center min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-dark" role="status"></div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 pb-5" style={{ paddingTop: '80px' }}>
      <div className="container animate-in">
        
        {/* HEADER SECTION */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 pb-3 border-bottom border-dark border-opacity-10">
          <div>
            <h2 className="fw-black text-uppercase ls-1 mb-1">Account Dashboard</h2>
            <p className="text-muted small fw-bold mb-0">Manage your identity and shipping preferences</p>
          </div>
          {!editing && (
            <button className="btn btn-dark fw-bold px-4 rounded-3 shadow-sm text-uppercase ls-1 mt-3 mt-md-0" style={{ fontSize: '0.75rem' }} onClick={() => setEditing(true)}>
              <i className="bi bi-pencil-square me-2"></i> Edit Profile
            </button>
          )}
        </div>

        <div className="row g-4">
          {/* LEFT COLUMN: IDENTITY */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4 p-xl-5 text-center">
                <div className="bg-dark text-white rounded-circle d-flex justify-content-center align-items-center mx-auto mb-4 shadow-lg" style={{ width: '90px', height: '90px', fontSize: '2.5rem' }}>
                  {profile.name?.charAt(0).toUpperCase()}
                </div>
                
                {!editing ? (
                  <div className="animate-in">
                    <h5 className="fw-black text-uppercase ls-1 mb-1">{profile.name}</h5>
                    <p className="text-muted extra-small fw-bold mb-4">{profile.email}</p>
                    
                    <div className="text-start bg-light p-3 rounded-3 border border-dark border-opacity-10">
                      <div className="mb-3">
                        <label className="extra-small fw-bold text-uppercase text-muted ls-1 d-block mb-1">Phone</label>
                        <p className="small fw-bold mb-0 text-dark">{profile.phone || 'Not Provided'}</p>
                      </div>
                      <div className="mb-0">
                        <label className="extra-small fw-bold text-uppercase text-muted ls-1 d-block mb-1">Member Since</label>
                        <p className="small fw-bold mb-0 text-dark">
                          {new Date(profile.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-start animate-in">
                    <div className="mb-3">
                      <label className="extra-small fw-bold text-muted mb-1 ls-1">FULL NAME</label>
                      <input type="text" className="form-control rounded-3 border-dark border-opacity-25 py-2" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                    </div>
                    <div className="mb-4">
                      <label className="extra-small fw-bold text-muted mb-1 ls-1">PHONE NUMBER</label>
                      <input type="tel" className="form-control rounded-3 border-dark border-opacity-25 py-2" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-dark w-100 rounded-3 fw-bold py-2 ls-1" onClick={() => handleSaveProfile()}>SAVE</button>
                      <button className="btn btn-outline-dark w-100 rounded-3 fw-bold py-2 ls-1" onClick={() => setEditing(false)}>CANCEL</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ADDRESSES */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-header bg-white p-4 border-0">
                <h6 className="fw-black text-uppercase ls-1 mb-0">Shipping Directory</h6>
              </div>
              <div className="card-body p-4 pt-0">
                
                {/* NEW ADDRESS FORM */}
                <form onSubmit={handleAddAddress} className="row g-3 mb-5 p-4 bg-light rounded-4 border border-dark border-opacity-10">
                  <div className="col-12"><p className="extra-small fw-black text-uppercase text-muted ls-1 mb-0">Add New Address</p></div>
                  <div className="col-md-6">
                    <input type="text" name="name" className="form-control rounded-3 border-0 py-2 shadow-sm" placeholder="Label (e.g. Home)" value={newAddress.name} onChange={handleAddressChange} required />
                  </div>
                  <div className="col-md-6">
                    <input type="text" name="street" className="form-control rounded-3 border-0 py-2 shadow-sm" placeholder="Street Address" value={newAddress.street} onChange={handleAddressChange} required />
                  </div>
                  <div className="col-md-4">
                    <input type="text" name="city" className="form-control rounded-3 border-0 py-2 shadow-sm" placeholder="City" value={newAddress.city} onChange={handleAddressChange} required />
                  </div>
                  <div className="col-md-4">
                    <input type="text" name="state" className="form-control rounded-3 border-0 py-2 shadow-sm" placeholder="State" value={newAddress.state} onChange={handleAddressChange} required />
                  </div>
                  <div className="col-md-4">
                    <input type="text" name="zip" className="form-control rounded-3 border-0 py-2 shadow-sm" placeholder="ZIP" value={newAddress.zip} onChange={handleAddressChange} required />
                  </div>
                  <div className="col-12 text-end">
                    <button type="submit" className="btn btn-dark px-4 py-2 rounded-3 fw-bold ls-1 extra-small">REGISTER ADDRESS</button>
                  </div>
                </form>

                {/* ADDRESS CARDS */}
                <div className="row g-3">
                  {profile.addresses.length === 0 && <p className="text-center text-muted py-4 small fw-bold">No saved addresses found.</p>}
                  {profile.addresses.map((addr) => (
                    <div key={addr._id || addr.id || addr.street} className="col-md-6">
                      <div className="p-3 border rounded-4 bg-white shadow-hover-sm transition-all h-100 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="badge bg-dark rounded-pill extra-small fw-bold px-3 py-2 text-uppercase ls-1">{addr.name}</span>
                          <button className="btn btn-link text-danger p-0" onClick={() => deleteAddress(addr._id || addr.id)}>
                            <i className="bi bi-trash3-fill"></i>
                          </button>
                        </div>
                        <p className="small fw-black text-uppercase mb-1">{profile.name}</p>
                        <p className="extra-small text-muted mb-0 flex-grow-1 lh-base">
                          {addr.street}<br />
                          {addr.city}, {addr.state} {addr.zip}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FULL WIDTH: ORDER HISTORY */}
          <div className="col-12 mt-4">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-header bg-white p-4 border-bottom border-light">
                <h5 className="fw-black text-uppercase ls-1 mb-0">Transaction Log</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-muted small text-uppercase">
                      <tr>
                        <th className="ps-4 py-3 fw-bold border-0">Reference</th>
                        <th className="py-3 fw-bold border-0">Date</th>
                        <th className="py-3 fw-bold border-0">Amount</th>
                        <th className="py-3 pe-4 fw-bold border-0 text-end">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myOrders.length === 0 ? (
                        <tr><td colSpan="4" className="text-center py-5 text-muted small fw-bold">No order history available.</td></tr>
                      ) : (
                        myOrders.map((o) => (
                          <tr key={o._id}>
                            <td className="ps-4 py-3">
                              <span className="fw-bold text-primary font-monospace" style={{ fontSize: '0.85rem' }}>
                                #{o._id.substring(o._id.length - 8).toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 text-muted extra-small fw-bold">{new Date(o.createdAt).toLocaleDateString()}</td>
                            <td className="py-3 fw-black text-dark">₹{o.amount.toLocaleString()}</td>
                            <td className="py-3 pe-4 text-end">
                              <span className={`badge px-3 py-2 rounded-pill fw-bold text-uppercase extra-small ls-1 ${
                                o.status === 'Delivered' ? 'bg-success' : 
                                o.status === 'Cancelled' ? 'bg-danger' : 
                                o.status === 'Refunded' ? 'bg-secondary' : 'bg-warning text-dark'
                              }`}>
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;