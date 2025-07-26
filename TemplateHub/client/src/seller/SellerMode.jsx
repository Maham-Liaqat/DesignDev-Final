import { useState, useEffect } from "react";
import "./sellerMode.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import API_CONFIG from '../config/api';

const SellerMode = () => {
  const [formData, setFormData] = useState({
    sellerName: "",
    email: "",
    templateName: "",
    category: "",
    Intro: "",
    techStack: "",
    shortDescription: "",
    longDescription: "",
    sourceCode: null,
    ProfileImage: null,
    demoURL: "",
    demoImages: [],
    license: "free",
    price: "",
    tags: [],
  });

  const [previews, setPreviews] = useState({
    ProfileImage: null,
    sourceCode: null,
    demoImages: [],
  });

  const [data, setData] = useState("");
  const [fileError, setFileError] = useState("");
  const [tagInput, setTagInput] = useState("");
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTagKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;

    if (files.length > 0) {
      if (name === "sourceCode") {
        const file = files[0];
        const validExtensions = [".zip"];
        const fileExtension = file.name.split(".").pop().toLowerCase();

        if (!validExtensions.includes(`.${fileExtension}`)) {
          setFileError("Only .zip files are allowed.");
          return;
        } else {
          setFileError("");
          setFormData((prev) => ({ ...prev, [name]: file }));
          setPreviews((prev) => ({ ...prev, sourceCode: file.name }));
        }
      } else if (name === "ProfileImage") {
        const file = files[0];
        const previewUrl = URL.createObjectURL(file);
        setFormData((prev) => ({ ...prev, [name]: file }));
        setPreviews((prev) => ({ ...prev, ProfileImage: previewUrl }));
      } else if (name === "demoImages") {
        const imageFiles = Array.from(files);
        const imagePreviews = imageFiles.map((file) => URL.createObjectURL(file));
        setFormData((prev) => ({ ...prev, [name]: imageFiles }));
        setPreviews((prev) => ({ ...prev, demoImages: imagePreviews }));
      }
    }
  };

  // Function to clear a specific file and its preview
  const clearFile = (field) => {
    if (field === "ProfileImage") {
      setFormData((prev) => ({ ...prev, ProfileImage: null }));
      setPreviews((prev) => ({ ...prev, ProfileImage: null }));
    } else if (field === "sourceCode") {
      setFormData((prev) => ({ ...prev, sourceCode: null }));
      setPreviews((prev) => ({ ...prev, sourceCode: null }));
      setFileError("");
    } else if (field === "demoImages") {
      setFormData((prev) => ({ ...prev, demoImages: [] }));
      setPreviews((prev) => ({ ...prev, demoImages: [] }));
    }
  };

  useEffect(() => {
    return () => {
      if (previews.ProfileImage) {
        URL.revokeObjectURL(previews.ProfileImage);
      }
      previews.demoImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews.ProfileImage, previews.demoImages]);

  const JwtToken = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "tags") {
        formDataToSend.append(key, formData[key].join(","));
      } else if (key === "demoImages" && Array.isArray(formData[key])) {
        formData[key].forEach((file) => formDataToSend.append("demoImages", file));
      } else if (key === "ProfileImage" && formData[key]) {
        formDataToSend.append("ProfileImage", formData[key]);
      } else if (key === "sourceCode" && formData[key]) {
        formDataToSend.append("sourceCode", formData[key]);
      } else if (formData[key]) {
        formDataToSend.append(key, formData[key]);
      }
    });
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${JwtToken}`,
          "Content-Type": "multipart/form-data",
        },
      };
      console.log("Uploading to: " + API_CONFIG.BASE_URL + "/create");
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0]+ ': ' + pair[1]);
      }
      const res = await axios.post(
        `${API_CONFIG.BASE_URL}/create`,
        formDataToSend,
        config
      );
      setData(res.data);
      setFormData({
        sellerName: "",
        email: "",
        templateName: "",
        category: "",
        Intro: "",
        techStack: "",
        shortDescription: "",
        longDescription: "",
        sourceCode: null,
        ProfileImage: null,
        demoURL: "",
        demoImages: [],
        license: "free",
        price: "",
        tags: [],
      });
      setPreviews({
        ProfileImage: null,
        sourceCode: null,
        demoImages: [],
      });
      setUploading(false);
      navigate("/");
    } catch (error) {
      setUploading(false);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Submission failed!";
      console.error("Submission Error:", errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="cyber-seller-portal">
      <div className="holographic-card">
        <div className="cyber-header">
          <div className="header-navigation">
            <button 
              type="button" 
              className="back-home-btn"
              onClick={() => navigate("/")}
            >
              ← Back to Home
            </button>
          </div>
          <h2 className="neon-title glitch" data-text="💎 PREMIUM SELLER PORTAL">
            💎 PREMIUM SELLER PORTAL
          </h2>
          <div className="cyber-divider">
            <span className="divider-line"></span>
            <span className="divider-icon">⚡</span>
            <span className="divider-line"></span>
          </div>
          <p className="cyber-subtitle">
            Upload your premium templates and join our elite marketplace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="quantum-form">
          {/* Profile Image Upload */}
          <div className="cyber-upload-group">
            <label htmlFor="profileImageUpload" className="neon-upload-label">
              {previews.ProfileImage ? (
                <div className="preview-wrapper">
                  <img
                    src={previews.ProfileImage}
                    alt="Avatar Preview"
                    className="preview-image-integrated"
                  />
                  <button
                    type="button"
                    className="change-file-btn"
                    onClick={() => clearFile("ProfileImage")}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="upload-fx">
                  <div className="pulse-ring"></div>
                  <svg className="upload-icon" viewBox="0 0 24 24">
                    <path
                      d="M5,16L19,16M12,6L12,18"
                      stroke="#0ff"
                      strokeWidth="2"
                    />
                  </svg>
                  <span>Upload Your Avatar</span>
                </div>
              )}
              <input
                type="file"
                id="profileImageUpload"
                name="ProfileImage"
                accept="image/*"
                required
                className="hidden-upload"
                onChange={handleFileChange}
                style={{ display: previews.ProfileImage ? "none" : "block" }}
              />
            </label>
            <p className="cyber-hint">
              High-quality professional image recommended
            </p>
          </div>

          {/* Seller Information */}
          <div className="cyber-form-grid">
            <div className="cyber-input-group">
              <label className="cyber-label">Seller Name</label>
              <input
                type="text"
                name="sellerName"
                placeholder="Your brand/studio name"
                required
                className="neon-input"
                value={formData.sellerName}
                onChange={handleChange}
              />
            </div>

            <div className="cyber-input-group">
              <label className="cyber-label">Contact Email</label>
              <input
                type="email"
                name="email"
                placeholder="your@business.com"
                required
                className="neon-input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="cyber-input-group">
            <label className="cyber-label">Professional Introduction</label>
            <input
              type="text"
              name="Intro"
              placeholder="Brief introduction about you/your studio"
              required
              className="neon-input"
              value={formData.Intro}
              onChange={handleChange}
            />
          </div>

          {/* Template Information */}
          <div className="cyber-section-title">
            <span className="section-glow"></span>
            <h3>Template Details</h3>
          </div>

          <div className="cyber-form-grid">
            <div className="cyber-input-group">
              <label className="cyber-label">Template Name</label>
              <input
                type="text"
                name="templateName"
                placeholder="Creative, unique name"
                required
                className="neon-input"
                value={formData.templateName}
                onChange={handleChange}
              />
            </div>

            <div className="cyber-select-group">
              <label className="cyber-label">Category</label>
              <select
                name="category"
                required
                className="neon-select"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                <option value="ui-design">UI Design</option>
                <option value="portfolio">Portfolio</option>
                <option value="ecommerce">E-Commerce</option>
                <option value="dashboard">Admin Dashboard</option>
                <option value="mobile">Mobile App</option>
              </select>
            </div>
          </div>

          <div className="cyber-input-group">
            <label className="cyber-label">Technology Stack</label>
            <input
              type="text"
              name="techStack"
              placeholder="React, Vue, Tailwind, etc."
              required
              className="neon-input"
              value={formData.techStack}
              onChange={handleChange}
            />
            <p className="cyber-hint">Separate technologies with commas</p>
          </div>

          {/* Descriptions */}
          <div className="cyber-input-group">
            <label className="cyber-label">Short Description</label>
            <textarea
              name="shortDescription"
              placeholder="Brief description that appears in listings (max 150 chars)"
              maxLength="150"
              required
              className="neon-textarea"
              value={formData.shortDescription}
              onChange={handleChange}
            />
          </div>

          <div className="cyber-input-group">
            <label className="cyber-label">Detailed Description</label>
            <textarea
              name="longDescription"
              placeholder="Full features list, technical details, requirements..."
              className="neon-textarea"
              rows="5"
              value={formData.longDescription}
              onChange={handleChange}
            />
          </div>

          {/* Pricing */}
          <div className="cyber-section-title">
            <span className="section-glow"></span>
            <h3>Pricing</h3>
          </div>

          <div className="cyber-form-grid">
            <div className="cyber-input-group">
              <label className="cyber-label">Price (PKR)</label>
              <div className="price-input-container">
                <input
                  type="number"
                  name="price"
                  placeholder="29.99"
                  min="5"
                  step="0.01"
                  required
                  className="neon-input"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Files */}
          <div className="cyber-section-title">
            <span className="section-glow"></span>
            <h3>Files & Media</h3>
          </div>

          <div className="cyber-form-grid">
            <div className="cyber-upload-group">
              <label htmlFor="sourceCode" className="neon-upload-label">
                {previews.sourceCode ? (
                  <div className="preview-wrapper">
                    <div className="file-preview">
                      <svg className="code-icon" viewBox="0 0 24 24">
                        <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
                      </svg>
                      <span>{previews.sourceCode}</span>
                    </div>
                    <button
                      type="button"
                      className="change-file-btn"
                      onClick={() => clearFile("sourceCode")}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="upload-fx">
                    <div className="hexagon-bg"></div>
                    <svg className="code-icon" viewBox="0 0 24 24">
                      <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
                    </svg>
                    <span>Source Code</span>
                  </div>
                )}
                <input
                  type="file"
                  id="sourceCode"
                  name="sourceCode"
                  required
                  className="hidden-upload"
                  accept=".zip"
                  onChange={handleFileChange}
                  style={{ display: previews.sourceCode ? "none" : "block" }}
                />
              </label>
              <p className="cyber-hint">Zipped project files only</p>
              {fileError && <p className="error-message">{fileError}</p>}
            </div>

            <div className="cyber-upload-group">
              <label htmlFor="demoImages" className="neon-upload-label">
                {previews.demoImages.length > 0 ? (
                  <div className="preview-wrapper">
                    <div className="demo-images-preview">
                      {previews.demoImages.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Demo Preview ${index + 1}`}
                          className="preview-image-integrated"
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      className="change-file-btn"
                      onClick={() => clearFile("demoImages")}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="upload-fx">
                    <div className="hexagon-bg"></div>
                    <svg className="image-icon" viewBox="0 0 24 24">
                      <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
                    </svg>
                    <span>Preview Images</span>
                  </div>
                )}
                <input
                  type="file"
                  id="demoImages"
                  name="demoImages"
                  multiple
                  required
                  className="hidden-upload"
                  accept=".jpg,.png,.jpeg"
                  onChange={handleFileChange}
                  style={{ display: previews.demoImages.length > 0 ? "none" : "block" }}
                />
              </label>
              <p className="cyber-hint">High-quality screenshots</p>
            </div>
          </div>

          <div className="cyber-input-group">
            <label className="cyber-label">Live Demo URL</label>
            <input
              type="url"
              name="demoURL"
              placeholder="https://your-demo-site.com"
              className="neon-input"
              value={formData.demoURL}
              onChange={handleChange}
            />
          </div>

          {/* Tags */}
          <div className="cyber-tag-group">
            <label className="cyber-label">Language</label>
            <div className="tag-container">
              {formData.tags.map((tag, index) => (
                <span key={index} className="neon-tag">
                  {tag}
                  <button
                    type="button"
                    className="tag-close"
                    onClick={() => handleTagRemove(tag)}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              name="tags"
              placeholder="React, Html, css..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className="neon-input"
            />
            <p className="cyber-hint">Press Enter to add tags</p>
          </div>

          {/* Submit Button */}
          <div className="cyber-submit-container">
            <button type="submit" className="quantum-submit-btn" disabled={uploading}>
              {uploading ? "Uploading..." : "SUBMIT PREMIUM TEMPLATE"}
            </button>
            <p className="cyber-note">
              All submissions are reviewed by our team within 48 hours
            </p>
          </div>
        </form>
      </div>

      <div className="cyber-corner tl"></div>
      <div className="cyber-corner tr"></div>
      <div className="cyber-corner bl"></div>
      <div className="cyber-corner br"></div>
      <div className="cyber-grid-overlay"></div>
      <div className="cyber-scanline"></div>

      <ToastContainer position="top-center" autoClose={5000} />
    </div>
  );
};

export default SellerMode;