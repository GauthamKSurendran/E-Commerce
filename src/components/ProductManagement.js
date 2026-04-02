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
  });

  // Size Inventory State
  const [sizeInventory, setSizeInventory] = useState({ S: 0, M: 0, L: 0, XL: 0, XXL: 0 });
  
  // Image Upload States
  const [images, setImages] = useState([]); // Stores base64 strings for instant UI previews
  const [newFiles, setNewFiles] = useState([]); // Stores actual File objects for the backend

  const handleInventoryChange = (e) => {
    const { name, value } = e.target;
    setSizeInventory(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  // --- MULTIPLE FILE HANDLING LOGIC ---
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (newFiles.length + files.length > 5) {
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

            // Update state once all files are processed
            if (previewsArray.length === files.length) {
                setImages(prev => [...prev, ...previewsArray]);
                setNewFiles(prev => [...prev, ...filesToStore]);
            }
        };
        reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setNewFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // BACKEND INTEGRATION LOGIC WITH FORMDATA
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newFiles.length === 0) {
      alert("Please upload at least one image for the product.");
      return;
    }

    setLoading(true);

    try {
      // 1. Prepare FormData for file uploads
      const formData = new FormData();
      
      formData.append('name', productData.name);
      formData.append('price', productData.price);
      formData.append('category', productData.category);
      
      // Convert inventory matrix to backend array format
      const inventoryArray = Object.entries(sizeInventory).map(([size, countInStock]) => ({ size, countInStock }));
      formData.append('sizes', JSON.stringify(inventoryArray));

      // Append actual binary files for images
      newFiles.forEach(file => formData.append('images', file));

      // 2. Send to Backend
      const token = localStorage.getItem("token"); // Retrieve JWT
      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          // CRITICAL: We DO NOT set 'Content-Type: application/json' here. 
          // The browser automatically sets it to 'multipart/form-data' when using FormData.
          "Authorization": `Bearer ${token}` 
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        // Update context with the real object returned from MongoDB
        if (setProducts) {
            setProducts(prev => [data, ...prev]); 
        }
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
    <div className="card border-0 shadow-sm p-4 rounded-0 bg-white mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h2 className="fw-black mb-0">Product Management</h2>
        <button className="btn btn-outline-dark fw-bold rounded-0 px-4" onClick={onClose}>CLOSE FORM</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          
          {/* PRODUCT NAME */}
          <div className="col-md-8">
            <label className="extra-small fw-bold text-muted uppercase ls-1 mb-2">Product Name <span className="text-danger">*</span></label>
            <input type="text" className="form-control rounded-0" placeholder="e.g. Tailored Wool Overcoat" required 
              value={productData.name} onChange={e => setProductData({...productData, name: e.target.value})} />
          </div>

          {/* CATEGORY */}
          <div className="col-md-4">
            <label className="extra-small fw-bold text-muted uppercase ls-1 mb-2">Category</label>
            <select className="form-select rounded-0" value={productData.category} onChange={e => setProductData({...productData, category: e.target.value})}>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
            </select>
          </div>

          {/* PRICE */}
          <div className="col-md-3">
            <label className="extra-small fw-bold text-muted uppercase ls-1 mb-2">Price (₹) <span className="text-danger">*</span></label>
            <input type="number" className="form-control rounded-0" required 
              value={productData.price} onChange={e => setProductData({...productData, price: e.target.value})} />
          </div>

          {/* MULTIPLE PHOTO UPLOAD */}
          <div className="col-md-9">
            <label className="extra-small fw-bold text-muted uppercase ls-1 mb-2">
              Photos (Maximum 5) <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <input 
                type="file" 
                id="productPhotos"
                className="form-control rounded-0 shadow-none" 
                multiple="multiple" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
              <label className="input-group-text btn btn-outline-dark rounded-0 px-3 small fw-bold uppercase" htmlFor="productPhotos">
                  <i className="bi bi-images me-2"></i> Choose File(s)
              </label>
            </div>
          </div>

          {/* LIVE PHOTO PREVIEWS */}
          {images.length > 0 && (
            <div className="col-12 mt-3 p-3 bg-light border border-dashed text-center rounded-0">
                <p className='extra-small fw-bold text-muted mb-3 uppercase'>PHOTO PREVIEWS</p>
                <div className="d-flex flex-wrap gap-3 justify-content-center">
                    {images.map((src, index) => (
                        <div key={index} className="position-relative border border-dark border-2 p-1 bg-white" style={{ width: '80px', aspectRatio: '3/4', overflow: 'hidden' }}>
                            <img src={src} className="w-100 h-100" style={{ objectFit: "cover" }} alt={`Preview ${index + 1}`} />
                            <button 
                                type="button" 
                                className="btn btn-danger btn-sm rounded-0 position-absolute top-0 end-0 p-0 d-flex justify-content-center align-items-center shadow" 
                                style={{ width: '22px', height: '22px', border: '1px solid white' }}
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

          {/* SIZE INVENTORY MATRIX */}
          <div className="col-12 mt-4">
            <h6 className="fw-black uppercase text-secondary small mb-3 ls-1">Inventory by Size (Set 0 if out of stock)</h6>
            <div className="row g-3" style={{maxWidth: '500px'}}>
              {Object.keys(sizeInventory).map(size => (
                <div key={size} className="col">
                    <div className="card text-center rounded-0 border-dark border-2 shadow-sm bg-white">
                        <div className="card-header bg-dark text-white fw-black ls-1 p-2 small">{size}</div>
                        <div className="card-body p-2">
                            <input 
                              type="number" 
                              name={size} 
                              className="form-control form-control-sm rounded-0 text-center fw-bold text-danger border-danger border-2 shadow-none" 
                              value={sizeInventory[size]} 
                              onChange={handleInventoryChange} 
                              min="0" 
                            />
                        </div>
                    </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="col-12 mt-5 border-top pt-4">
            <button type="submit" className="btn btn-dark rounded-0 px-5 py-2 fw-bold ls-1 uppercase" disabled={loading}>
              {loading ? "SAVING..." : "SAVE PRODUCT"}
            </button>
            <button type="button" className="btn btn-outline-secondary rounded-0 px-4 py-2 ms-3 fw-bold uppercase" onClick={onClose}>
              CANCEL
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}