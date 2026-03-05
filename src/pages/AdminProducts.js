import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const availableSizes = ["S", "M", "L", "XL", "XXL"];

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Men",
    subCategory: "None",
    stock: "",
    image: "",
    imagePreview: "",
    description: "",
    sizes: [],
  });

  // 1. Initial Load of Products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products");
      if (!res.ok) throw new Error("Could not fetch products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "category" && value !== "Kids") {
        setFormData((prev) => ({ ...prev, [name]: value, subCategory: "None" }));
    } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Base64 limit check (2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("Image is too large. Please use a file under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: reader.result,
          imagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSize = (size) => {
    const newSizes = formData.sizes.includes(size)
      ? formData.sizes.filter((s) => s !== size)
      : [...formData.sizes, size];
    setFormData((prev) => ({ ...prev, sizes: newSizes }));
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: "",
      price: "",
      category: "Men",
      subCategory: "None",
      stock: "",
      image: "",
      imagePreview: "",
      description: "",
      sizes: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 2. TOKEN SECURITY - Retrieve from storage
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Session expired or token missing. Please logout and login again.");
      setLoading(false);
      return;
    }

    const productPayload = {
      name: formData.name,
      price: Number(formData.price), // Force Number
      category: formData.category,
      subCategory: formData.category === 'Kids' ? formData.subCategory : 'None',
      stock: Number(formData.stock), // Force Number
      image: formData.image,
      sizes: formData.sizes,
      description: formData.description || ""
    };

    const url = editingId
      ? `http://localhost:5000/api/products/${editingId}`
      : "http://localhost:5000/api/products";

    try {
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token.trim()}`, 
        },
        body: JSON.stringify(productPayload),
      });

      const data = await res.json();

      if (res.ok) {
        alert(editingId ? "Product Updated!" : "Product Saved!");
        await fetchProducts();
        handleCancel();
      } else {
        // Detailed error from backend middleware
        alert(`Server Error: ${data.message || "Failed to process request"}`);
      }
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Connection Failed: Ensure your backend server is running on Port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this product?")) return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Not authorized. Please log in as an Admin.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: { 
          // CRITICAL FIX: Added the mandatory space after Bearer
          "Authorization": `Bearer ${token.trim()}` 
        },
      });
      if (res.ok) {
        fetchProducts();
      } else {
        const data = await res.json();
        alert(data.message || "Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="container mt-5 pt-4 mb-5">
      <div className="mb-3">
        <Link to="/admin/dashboard" className="text-decoration-none text-dark small fw-bold">
          ← BACK TO DASHBOARD
        </Link>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Product Management</h2>
        <button
          className={`btn ${showForm ? "btn-outline-dark" : "btn-dark"} rounded-0 px-4 fw-bold`}
          onClick={() => (showForm ? handleCancel() : setShowForm(true))}
        >
          {showForm ? "CLOSE FORM" : "+ ADD NEW PRODUCT"}
        </button>
      </div>

      <>
        {showForm && (
          <div className="card shadow-sm border-0 p-4 mb-5 bg-light rounded-0 border-top border-4 border-dark">
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="small fw-bold text-muted mb-1 text-uppercase">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control rounded-0 border-dark border-opacity-25"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="col-md-3">
                  <label className="small fw-bold text-muted mb-1 text-uppercase">Category</label>
                  <select
                    name="category"
                    className="form-select rounded-0 border-dark border-opacity-25"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>

                {formData.category === "Kids" ? (
                    <div className="col-md-3 animate-in">
                      <label className="small fw-bold text-primary mb-1 text-uppercase">Kids Section</label>
                      <select name="subCategory" className="form-select rounded-0 border-primary border-opacity-50" value={formData.subCategory} onChange={handleChange} required>
                        <option value="None" disabled>Select Gender</option>
                        <option value="Boys">Boys</option>
                        <option value="Girls">Girls</option>
                        <option value="Unisex">Unisex</option>
                      </select>
                    </div>
                ) : (
                    <div className="col-md-3">
                    </div>
                )}

                <div className="col-md-3">
                  <label className="small fw-bold text-muted mb-1 text-uppercase">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    className="form-control rounded-0 border-dark border-opacity-25"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="small fw-bold text-muted mb-1 text-uppercase">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    className="form-control rounded-0 border-dark border-opacity-25"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="small fw-bold text-muted mb-1 text-uppercase">Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control rounded-0 border-dark border-opacity-25"
                    onChange={handleImageChange}
                  />
                  {formData.imagePreview && (
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="mt-2 border p-1"
                      style={{ height: "80px", width: "60px", objectFit: "cover" }}
                    />
                  )}
                </div>
                <div className="col-12">
                  <label className="small fw-bold d-block mb-2 text-muted">AVAILABLE SIZES</label>
                  <div className="d-flex gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        className={`btn btn-sm rounded-0 border fw-bold ${
                          formData.sizes.includes(size) ? "btn-dark" : "btn-outline-dark"
                        }`}
                        style={{ width: "45px", height: "45px" }}
                        onClick={() => toggleSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-12 mt-4 pt-3 border-top">
                  <button type="submit" className="btn btn-dark rounded-0 px-5 py-2 fw-bold me-2" disabled={loading}>
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>SAVING...</>
                    ) : (
                      "SAVE PRODUCT"
                    )}
                  </button>
                  <button type="button" className="btn btn-outline-secondary rounded-0 px-5 py-2 fw-bold" onClick={handleCancel}>
                    CANCEL
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="card border-0 shadow-sm rounded-0">
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover border">
              <thead className="table-dark text-uppercase small">
                <tr>
                  <th className="ps-4 py-3">Product Info</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Price</th>
                  <th className="py-3">Stock</th>
                  <th className="py-3">Sizes</th>
                  <th className="text-end pe-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-5 text-muted italic">Catalog is empty.</td></tr>
                ) : (
                  products.map((p) => (
                    <tr key={p._id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={p.image || "https://via.placeholder.com/40x50"}
                            alt=""
                            className="border bg-light"
                            style={{ width: "40px", height: "50px", objectFit: "cover" }}
                          />
                          <span className="fw-bold text-dark">{p.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border-0 rounded-pill px-3">
                          {p.category} {p.category === 'Kids' && p.subCategory && p.subCategory !== 'None' ? `(${p.subCategory})` : ''}
                        </span>
                      </td>
                      <td className="fw-bold">₹{p.price?.toLocaleString()}</td>
                      <td className={p.stock < 5 ? "text-danger fw-bold" : "text-dark"}>{p.stock}</td>
                      <td>
                        {p.sizes?.map((s) => (
                          <span key={s} className="badge bg-light text-muted border me-1 rounded-0 fw-normal">{s}</span>
                        ))}
                      </td>
                      <td className="text-end pe-4">
                        <button
                          className="btn btn-sm btn-outline-dark me-2 rounded-0 px-3 fw-bold border-0"
                          onClick={() => {
                            setEditingId(p._id);
                            setFormData({ ...p, imagePreview: p.image });
                            setShowForm(true);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          EDIT
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger rounded-0 px-3 fw-bold border-0"
                          onClick={() => handleDelete(p._id)}
                        >
                          DELETE
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    </div>
  );
}

export default AdminProducts;