import React, { useState } from "react";

const AdminProductForm = ({ onProductAdded, onClose }) => {
  // 1. STATE MANAGEMENT
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState({
    name: "",
    price: "",
    category: "Men",
    images: ["", "", ""], // [0]: Front, [1]: Back, [2]: Side
    stock: "",
    description: "",
    sizes: [] 
  });

  // 2. IMAGE HANDLER (Converts File to Base64 for the Backend)
  const handleImageChange = (index, file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedImages = [...productData.images];
      updatedImages[index] = reader.result; // Base64 string
      setProductData({ ...productData, images: updatedImages });
    };
    reader.readAsDataURL(file);
  };

  const handleSizeToggle = (size) => {
    const newSizes = productData.sizes.includes(size)
      ? productData.sizes.filter(s => s !== size)
      : [...productData.sizes, size];
    setProductData({ ...productData, sizes: newSizes });
  };

  // 3. BACKEND INTEGRATION HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Filter out empty image slots and format data
    const validImages = productData.images.filter(img => img !== "");
    
    const productPayload = {
      name: productData.name,
      price: Number(productData.price),
      category: productData.category,
      stock: Number(productData.stock),
      description: productData.description,
      sizes: productData.sizes,
      image: validImages[0], // Sending the primary image as 'image'
      allImages: validImages // If your schema supports an array of images
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(productPayload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add product");
      }

      alert("Product added successfully to database!");
      
      // Refresh the product list in the parent component
      if (onProductAdded) onProductAdded();
      if (onClose) onClose();

    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card rounded-0 border-0 shadow-sm p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-black text-uppercase ls-2">Add New Product</h4>
        <button className="btn btn-dark btn-sm rounded-0 ls-1 px-3" onClick={onClose}>
          CLOSE FORM
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* MULTI-IMAGE UPLOADS */}
          <div className="col-12">
            <label className="extra-small fw-bold text-muted text-uppercase ls-1 d-block mb-3">
              Upload Product Views
            </label>
            <div className="row g-3">
              {["Front", "Back", "Side"].map((label, index) => (
                <div className="col-md-4" key={label}>
                  <label className="extra-small fw-bold text-uppercase mb-1">{label} View</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="form-control rounded-0 border-light bg-light shadow-none" 
                    onChange={(e) => handleImageChange(index, e.target.files[0])}
                    required={index === 0}
                  />
                  {productData.images[index] && (
                    <img src={productData.images[index]} alt="preview" className="mt-2 border" style={{ height: '60px' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="col-md-8">
            <label className="extra-small fw-bold text-muted text-uppercase ls-1 mb-1">Product Name</label>
            <input 
              type="text" 
              className="form-control rounded-0 border-light bg-light shadow-none" 
              value={productData.name} 
              onChange={(e) => setProductData({...productData, name: e.target.value})} 
              required 
            />
          </div>

          <div className="col-md-4">
            <label className="extra-small fw-bold text-muted text-uppercase ls-1 mb-1">Category</label>
            <select 
              className="form-select rounded-0 border-light bg-light shadow-none" 
              value={productData.category} 
              onChange={(e) => setProductData({...productData, category: e.target.value})}
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="extra-small fw-bold text-muted text-uppercase ls-1 mb-1">Price (₹)</label>
            <input 
              type="number" 
              className="form-control rounded-0 border-light bg-light shadow-none" 
              value={productData.price} 
              onChange={(e) => setProductData({...productData, price: e.target.value})} 
              required 
            />
          </div>

          <div className="col-md-6">
            <label className="extra-small fw-bold text-muted text-uppercase ls-1 mb-1">Stock Qty</label>
            <input 
              type="number" 
              className="form-control rounded-0 border-light bg-light shadow-none" 
              value={productData.stock} 
              onChange={(e) => setProductData({...productData, stock: e.target.value})} 
              required 
            />
          </div>

          <div className="col-12 mt-2">
            <label className="extra-small fw-bold text-muted text-uppercase ls-1 d-block mb-2">Available Sizes</label>
            <div className="d-flex gap-2">
              {["S", "M", "L", "XL", "XXL"].map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeToggle(size)}
                  className={`btn btn-sm rounded-0 border fw-bold ${productData.sizes.includes(size) ? 'btn-dark' : 'btn-outline-dark'}`}
                  style={{ width: '45px', height: '45px' }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="col-12 mt-4 d-flex gap-2">
            <button 
              type="submit" 
              className="btn btn-dark rounded-0 px-5 py-3 fw-bold ls-1"
              disabled={loading}
            >
              {loading ? "SAVING TO DATABASE..." : "SAVE PRODUCT"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;