import React, { useState, useEffect, useContext } from "react";
import { OrderContext } from "../context/OrderProvider";
import { AuthContext } from "../context/AuthContext";

/**
 * Integrated Profile Page
 * Handles live Order History from MongoDB and User Profile state
 */
function Profile({ user }) {
  const orderData = useContext(OrderContext);
  const orders = orderData?.orders || [];
  
  const { login } = useContext(AuthContext) || {}; 

  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || "User Name",
    email: user?.email || "",
    phone: user?.phone || "",
    addresses: user?.addresses || [],
  });

  const [newAddress, setNewAddress] = useState({
    name: "", street: "", city: "", state: "", zip: "",
  });

  const myOrders = orders.filter(
    (order) => order?.userEmail?.toLowerCase() === user?.email?.toLowerCase()
  );

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        addresses: user.addresses || [],
      });
    }
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
        
        // --- CRITICAL FIX: HARD LOCAL STORAGE SYNC ---
        // This ensures the Checkout page has immediate access to the new address
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        if (login) {
           login(updatedUser, token); 
        }
        
        setEditing(false);
        return true; 
      } else {
        console.error("Backend rejected the profile update.");
        return false; 
      }
    } catch (err) {
      console.error("Update failed:", err);
      return false;
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    
    // Require all fields to be filled before attempting to save
    if (!newAddress.name || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zip) {
        alert("Please fill in all address fields.");
        return;
    }
    
    // Create new address array WITHOUT a fake frontend ID
    const updatedAddresses = [...profile.addresses, { ...newAddress }];
    const updatedProfile = { ...profile, addresses: updatedAddresses };
    
    // 1. Update Local State for instant UI feedback
    setProfile(updatedProfile);
    setNewAddress({ name: "", street: "", city: "", state: "", zip: "" });

    // 2. Immediately sync with Database
    const success = await handleSaveProfile(updatedProfile);
    if (success) {
        alert("Address saved successfully!");
    } else {
        alert("Failed to save address to database. Please try again.");
    }
  };

  const deleteAddress = async (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
        const updatedAddresses = profile.addresses.filter((a) => a._id !== id && a.id !== id);
        const updatedProfile = { ...profile, addresses: updatedAddresses };
        
        setProfile(updatedProfile);
        await handleSaveProfile(updatedProfile);
    }
  };

  if (!user) {
    return (
      <div className="container mt-5 pt-5 text-center">
        <h4 className="fw-bold">PLEASE LOGIN TO VIEW PROFILE</h4>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5 pt-5">
      <div className="row g-4">
        {/* Left Column - Profile Info */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 p-4 rounded-0 bg-light">
            <div className="text-center mb-4">
               <div className="bg-dark text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                {profile.name?.charAt(0).toUpperCase()}
              </div>
              <h5 className="fw-bold mb-0 text-uppercase ls-1">Account Info</h5>
            </div>

            {!editing ? (
              <>
                <div className="mb-3 border-bottom pb-2">
                  <p className="extra-small fw-bold text-muted mb-0">NAME</p>
                  <p className="mb-0 fw-bold">{profile.name}</p>
                </div>
                <div className="mb-3 border-bottom pb-2">
                  <p className="extra-small fw-bold text-muted mb-0">EMAIL</p>
                  <p className="mb-0">{profile.email}</p>
                </div>
                <div className="mb-4 border-bottom pb-2">
                  <p className="extra-small fw-bold text-muted mb-0">PHONE</p>
                  <p className="mb-0">{profile.phone || "Not provided"}</p>
                </div>
                <button className="btn btn-dark w-100 rounded-0 fw-bold py-2 ls-1" onClick={() => setEditing(true)}>
                  EDIT PROFILE
                </button>
              </>
            ) : (
              <>
                <div className="mb-3">
                  <label className="extra-small fw-bold text-muted">NAME</label>
                  <input type="text" className="form-control rounded-0 shadow-none" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="extra-small fw-bold text-muted">PHONE</label>
                  <input type="tel" className="form-control rounded-0 shadow-none" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </div>
                <button className="btn btn-success w-100 rounded-0 fw-bold py-2 ls-1" onClick={() => handleSaveProfile()}>
                  SAVE CHANGES
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Column - Addresses & Order History */}
        <div className="col-md-8">
          
          {/* SAVED ADDRESSES SECTION */}
          <div className="card shadow-sm border-0 p-4 mb-4 rounded-0">
            <h5 className="fw-bold mb-4 text-uppercase ls-1">Shipping Addresses</h5>
            
            <form onSubmit={handleAddAddress} className="row g-2 mb-4 p-3 bg-light border">
              <div className="col-md-6">
                <input type="text" name="name" className="form-control form-control-sm rounded-0 shadow-none" placeholder="Address Label (Home/Office)" 
                  value={newAddress.name} onChange={handleAddressChange} required />
              </div>
              <div className="col-md-6">
                <input type="text" name="street" className="form-control form-control-sm rounded-0 shadow-none" placeholder="Street Address" 
                  value={newAddress.street} onChange={handleAddressChange} required />
              </div>
              <div className="col-md-4">
                <input type="text" name="city" className="form-control form-control-sm rounded-0 shadow-none" placeholder="City" 
                  value={newAddress.city} onChange={handleAddressChange} required />
              </div>
              <div className="col-md-4">
                <input type="text" name="state" className="form-control form-control-sm rounded-0 shadow-none" placeholder="State" 
                  value={newAddress.state} onChange={handleAddressChange} required />
              </div>
              <div className="col-md-4">
                <input type="text" name="zip" className="form-control form-control-sm rounded-0 shadow-none" placeholder="ZIP" 
                  value={newAddress.zip} onChange={handleAddressChange} required />
              </div>
              <div className="col-12 mt-2">
                <button type="submit" className="btn btn-dark btn-sm rounded-0 px-4 fw-bold">ADD ADDRESS</button>
              </div>
            </form>
            
            <div className="row g-3">
              {profile.addresses.map((address) => (
                <div key={address._id || address.id || address.street} className="col-md-6">
                  <div className="border p-3 rounded-0 h-100 position-relative hover-shadow transition-all">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold mb-0 text-uppercase small">{address.name}</h6>
                      <button className="btn btn-sm text-danger p-0 border-0" onClick={() => deleteAddress(address._id || address.id)}>
                        <small className="fw-bold">DELETE</small>
                      </button>
                    </div>
                    <p className="mb-1 small text-secondary">{address.street}</p>
                    <p className="mb-0 small text-muted">{address.city}, {address.state} {address.zip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ORDER HISTORY SECTION */}
          <div className="card shadow-sm border-0 p-4 rounded-0">
            <h5 className="fw-bold mb-4 text-uppercase ls-1">Order History</h5>
            {myOrders.length === 0 ? (
              <div className="text-center py-5 border">
                <p className="text-muted mb-0">No orders found in your account history.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="table-light extra-small fw-bold ls-1">
                    <tr>
                      <th>ORDER ID</th>
                      <th>DATE</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="font-monospace small text-primary fw-bold">
                          #{order._id.substring(0, 10).toUpperCase()}
                        </td>
                        <td className="small">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="fw-bold">₹{order.amount.toLocaleString()}</td>
                        <td>
                          <span className={`badge rounded-0 extra-small px-2 py-1 ${order.status === 'Delivered' ? 'bg-success' : 'bg-dark'}`}>
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;