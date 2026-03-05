import React, { useState, useContext } from "react";
import { ProductContext } from "../context/ProductProvider";

export default function ProductManagement({ onClose }) {
  // Pulling setProducts to update local state after successful DB save
  const { setProducts } = useContext(ProductContext);
  
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState({
    name: "",
    category: "Men",
    price: "",
    stock: "",
    images: [], 
    sizes: ["S", "M", "L", "XL"] // Default sizes for the inventory
  });

  const [imageUrl, setImageUrl] = useState("");

  const handleAddImage = () => {
    if (imageUrl) {
      setProductData({ ...productData, images: [...productData.images, imageUrl] });
      setImageUrl(""); 
    }
  };

  // BACKEND INTEGRATION LOGIC
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (productData.images.length === 0) {
      alert("Please add at least one image for the gallery.");
      return;
    }

    setLoading(true);

    const payload = {
      ...productData,
      price: Number(productData.price),
      stock: Number(productData.stock),
      image: productData.images[0] // Primary display image
    };

    try {
      const token = localStorage.getItem("token"); // Retrieve JWT
      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Protect route
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        // RS10: Update context with the real object returned from MongoDB
        setProducts(prev => [data, ...prev]); 
        alert("Product successfully saved to Database!");
        onClose();
      } else {
        alert(data.message || "Error saving product");
      }
    } catch (err) {
      console.error("Connection error:", err);
      alert("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm p-4 rounded-0 bg-white">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-black mb-0">Product Management</h2>
        <button className="btn btn-dark rounded-0 px-4" onClick={onClose}>CLOSE FORM</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-8">
            <label className="extra-small fw-bold text-muted uppercase ls-1">Product Name</label>
            <input type="text" className="form-control rounded-0" placeholder="e.g. Tailored Wool Overcoat" required 
              onChange={e => setProductData({...productData, name: e.target.value})} />
          </div>
          <div className="col-md-4">
            <label className="extra-small fw-bold text-muted uppercase ls-1">Category</label>
            <select className="form-select rounded-0" value={productData.category} onChange={e => setProductData({...productData, category: e.target.value})}>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="extra-small fw-bold text-muted uppercase ls-1">Price (₹)</label>
            <input type="number" className="form-control rounded-0" required 
              onChange={e => setProductData({...productData, price: e.target.value})} />
          </div>
          <div className="col-md-6">
            <label className="extra-small fw-bold text-muted uppercase ls-1">Stock Qty</label>
            <input type="number" className="form-control rounded-0" required 
              onChange={e => setProductData({...productData, stock: e.target.value})} />
          </div>

          <div className="col-12">
            <label className="extra-small fw-bold text-muted uppercase ls-1">Product Gallery URL</label>
            <div className="d-flex gap-2 mb-2">
              <input type="text" className="form-control rounded-0" placeholder="Paste image URL"
                value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
              <button type="button" className="btn btn-outline-dark rounded-0 px-4" onClick={handleAddImage}>ADD</button>
            </div>
            
            <div className="d-flex gap-2 flex-wrap">
              {productData.images.map((url, i) => (
                <div key={i} className="position-relative border p-1" style={{width: '70px', height: '85px'}}>
                  <img src={url} alt="preview" className="w-100 h-100" style={{objectFit: 'cover'}} />
                  <button type="button" className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0" 
                    style={{width: '18px', height: '18px', fontSize: '10px'}}
                    onClick={() => setProductData({...productData, images: productData.images.filter((_, idx) => idx !== i)})}>✕</button>
                </div>
              ))}
            </div>
          </div>

          <div className="col-12 mt-4">
            <button type="submit" className="btn btn-dark rounded-0 px-5 fw-bold ls-1" disabled={loading}>
              {loading ? "SAVING..." : "SAVE PRODUCT"}
            </button>
            <button type="button" className="btn btn-outline-secondary rounded-0 ms-2" onClick={onClose}>CANCEL</button>
          </div>
        </div>
      </form>
    </div>
  );
}