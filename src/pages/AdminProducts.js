import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. STATE MANAGEMENT (Updated for Size-Specific Stock)
  const defaultSizes = [
    { size: "S", countInStock: 0 },
    { size: "M", countInStock: 0 },
    { size: "L", countInStock: 0 },
    { size: "XL", countInStock: 0 },
    { size: "XXL", countInStock: 0 },
  ];

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Men",
    subCategory: "None",
    description: "",
    sizes: JSON.parse(JSON.stringify(defaultSizes)),
  });

  // NEW: State to manage multiple photos
  const [existingImages, setExistingImages] = useState([]); // URLs to keep from DB
  const [images, setImages] = useState([]); // Base64 strings for UI previews
  const [newFiles, setNewFiles] = useState([]); // Actual File objects for backend upload

  // 2. Fetch Products
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

  // 3. Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "category" && value !== "Kids") {
        setFormData((prev) => ({ ...prev, [name]: value, subCategory: "None" }));
    } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // NEW: Multiple Image Handler
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (existingImages.length + newFiles.length + files.length > 5) {
        alert("Maximum of 5 photos allowed per product.");
        return;
    }

    const previewsArray = [];
    const filesToStore = [];

    files.forEach(file => {
        if (!file.type.startsWith('image/')) {
            alert(`File ${file.name} is not an image.`);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            previewsArray.push(reader.result);
            filesToStore.push(file);

            if (previewsArray.length === files.length) {
                setImages(prev => [...prev, ...previewsArray]);
                setNewFiles(prev => [...prev, ...filesToStore]);
            }
        };
        reader.readAsDataURL(file);
    });
  };

  // NEW: Remove Image Handler
  const handleRemoveImage = (indexToRemove) => {
    const isExisting = indexToRemove < existingImages.length;

    if (isExisting) {
        setExistingImages(prev => prev.filter((_, index) => index !== indexToRemove));
    } else {
        const newFilesIndex = indexToRemove - existingImages.length;
        setNewFiles(prev => prev.filter((_, index) => index !== newFilesIndex));
    }

    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSizeStockChange = (index, value) => {
    const updatedSizes = [...formData.sizes];
    updatedSizes[index].countInStock = Number(value);
    setFormData((prev) => ({ ...prev, sizes: updatedSizes }));
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: "",
      price: "",
      category: "Men",
      subCategory: "None",
      description: "",
      sizes: JSON.parse(JSON.stringify(defaultSizes)),
    });
    setExistingImages([]);
    setImages([]);
    setNewFiles([]);
  };

  // 4. Submit Integration with FormData
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (existingImages.length === 0 && newFiles.length === 0) {
      alert("Please upload at least one image for the product.");
      return;
    }

    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Session expired or token missing. Please logout and login again.");
      setLoading(false);
      return;
    }

    try {
      // Create FormData to handle mixed text/file payloads
      const payload = new FormData();
      
      payload.append('name', formData.name);
      payload.append('price', Number(formData.price));
      payload.append('category', formData.category);
      payload.append('subCategory', formData.category === 'Kids' ? formData.subCategory : 'None');
      payload.append('description', formData.description || "");
      payload.append('sizes', JSON.stringify(formData.sizes));

      // Append existing images we want to keep
      if (editingId && existingImages.length > 0) {
        existingImages.forEach(imageUrl => payload.append('existingImages', imageUrl));
      }

      // Append actual binary files for new images
      if (newFiles.length > 0) {
        newFiles.forEach(file => payload.append('images', file));
      }

      const url = editingId
        ? `http://localhost:5000/api/products/${editingId}`
        : "http://localhost:5000/api/products";

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          // CRITICAL: We DO NOT set 'Content-Type: application/json' here. 
          // The browser automatically sets it to 'multipart/form-data' when using FormData.
          "Authorization": `Bearer ${token.trim()}`, 
        },
        body: payload,
      });

      const data = await res.json();

      if (res.ok) {
        alert(editingId ? "Product Updated!" : "Product Saved!");
        await fetchProducts();
        handleCancel();
      } else {
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
                    <div className="col-md-3"></div>
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
                
                {/* MULTIPLE PHOTO UPLOAD */}
                <div className="col-md-9">
                  <label className="small fw-bold text-muted mb-1 text-uppercase">Photos (Maximum 5)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple="multiple"
                    className="form-control rounded-0 border-dark border-opacity-25 bg-white"
                    onChange={handleImageChange}
                  />
                </div>

                {/* LIVE PHOTO PREVIEWS */}
                {images.length > 0 && (
                  <div className="col-12 mt-2 bg-white border border-dark border-opacity-25 p-3">
                    <p className='small fw-bold text-muted mb-2 text-uppercase'>Image Previews</p>
                    <div className="d-flex flex-wrap gap-3">
                      {images.map((src, index) => (
                        <div key={index} className="position-relative border border-dark p-1 bg-light" style={{ width: '70px', height: '85px' }}>
                          <img src={src} className="w-100 h-100" style={{ objectFit: "cover" }} alt={`Preview ${index + 1}`} />
                          <button 
                              type="button" 
                              className="btn btn-danger btn-sm rounded-0 position-absolute top-0 end-0 p-0 d-flex justify-content-center align-items-center shadow" 
                              style={{ width: '20px', height: '20px', border: '1px solid white' }}
                              onClick={() => handleRemoveImage(index)}
                              title="Remove this photo"
                          >
                              <i className="bi bi-x small" style={{ fontSize: '0.65rem', fontWeight: 'bold' }}></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="col-12 mt-4 pt-3 border-top">
                  <label className="small fw-bold text-muted mb-3 text-uppercase d-block">Inventory by Size (Set 0 if out of stock)</label>
                  <div className="d-flex flex-wrap gap-3">
                    {formData.sizes.map((sizeObj, index) => (
                      <div key={sizeObj.size} className="d-flex flex-column align-items-center">
                        <span className="badge bg-dark rounded-0 mb-1 px-4 py-2 fw-bold text-uppercase">
                          {sizeObj.size}
                        </span>
                        <input
                          type="number"
                          min="0"
                          className="form-control rounded-0 border-dark border-opacity-25 text-center fw-bold"
                          style={{ width: "80px" }}
                          value={sizeObj.countInStock}
                          onChange={(e) => handleSizeStockChange(index, e.target.value)}
                          required
                        />
                      </div>
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
                  <th className="py-3">Total Stock</th>
                  <th className="py-3">Sizes Available</th>
                  <th className="text-end pe-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-5 text-muted italic">Catalog is empty.</td></tr>
                ) : (
                  products.map((p) => {
                    const totalStock = p.sizes && typeof p.sizes[0] === 'object'
                      ? p.sizes.reduce((acc, curr) => acc + (curr.countInStock || 0), 0)
                      : p.stock || 0; 

                    return (
                      <tr key={p._id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              // Shows the primary image (first element in images array) or fallback
                              src={p.images && p.images.length > 0 ? p.images[0] : (p.image || "https://via.placeholder.com/40x50")}
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
                        <td className={totalStock < 5 ? "text-danger fw-bold" : "text-dark"}>
                          {totalStock}
                        </td>
                        <td>
                          {p.sizes?.map((s, idx) => {
                            if (typeof s === 'object') {
                              return s.countInStock > 0 ? (
                                <span key={idx} className="badge bg-light text-muted border me-1 rounded-0 fw-normal">
                                  {s.size}: {s.countInStock}
                                </span>
                              ) : null;
                            }
                            return <span key={idx} className="badge bg-light text-muted border me-1 rounded-0 fw-normal">{s}</span>;
                          })}
                        </td>
                        <td className="text-end pe-4">
                          <button
                            className="btn btn-sm btn-outline-dark me-2 rounded-0 px-3 fw-bold border-0"
                            onClick={() => {
                              const mappedSizes = JSON.parse(JSON.stringify(defaultSizes));
                              if (p.sizes && typeof p.sizes[0] === 'object') {
                                p.sizes.forEach(existingSizeObj => {
                                  const targetIdx = mappedSizes.findIndex(ds => ds.size === existingSizeObj.size);
                                  if (targetIdx !== -1) mappedSizes[targetIdx].countInStock = existingSizeObj.countInStock;
                                });
                              }

                              // Safely extract existing images from DB
                              const loadedImages = p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);

                              setEditingId(p._id);
                              setFormData({
                                ...p,
                                sizes: mappedSizes,
                                subCategory: p.subCategory || "None"
                              });
                              
                              // Load existing photos into state
                              setExistingImages(loadedImages);
                              setImages(loadedImages);
                              setNewFiles([]);

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
                    );
                  })
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