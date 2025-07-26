import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Fuse from "fuse.js";
import Input from "./Input";
import API_CONFIG from '../config/api';

const TemplateList = ({ searchTerm, setSearchTerm }) => {
  const [templates, setTemplates] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const getSellers = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/get`);
      setTemplates(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching sellers:", error);
      return null;
    }
  };

  useEffect(() => {
    getSellers();
  }, []);

  useEffect(() => {
    setIsSearching(searchTerm.trim() !== "");
    if (searchTerm.trim() !== "") {
      setTimeout(() => {
        const container = document.getElementById("templates-container");
        if (container) {
          const yOffset = -100;
          const y = container.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 3000);
    }
  }, [searchTerm]);

  // Fuzzy search with Fuse.js
  const fuse = new Fuse(templates, {
    keys: [
      "templateName",
      "shortDescription",
      "category",
      "tags"
    ],
    threshold: 0.4, // Adjust for fuzziness
    ignoreLocation: true,
    minMatchCharLength: 2
  });

  const filteredTemplates = searchTerm.trim()
    ? fuse.search(searchTerm).map(result => result.item)
    : templates;

  // Pass templates and navigate to Input
  return (
    <div>
      {/* Removed <Input ... /> from here so search bar only appears in Navbar */}
      <section className="pt-5 pb-9 py-md-11 bg-white"> 
        <div className="container">
          <div className="text-center mb-5 mb-md-8" data-aos="fade-up" data-aos-duration="800">
            <h1 className="mb-1">
              {isSearching ? "Search Results" : "My Templates"}
            </h1>
            <p className="font-size-lg text-capitalize">
              {isSearching 
                ? `Found ${filteredTemplates.length} matching templates` 
                : "Discover your perfect Template on our website."}
            </p>
          </div>

          <div 
            id="templates-container"
            className="row row-cols-1 row-cols-md-3 g-4 justify-content-center"
          >
            {filteredTemplates.map((template, index) => (
              <div key={index} className="col" data-aos="fade-up" data-aos-duration="800" data-aos-delay={index * 100}>
                <div className="card border rounded-xl shadow p-2 lift sk-fade h-100">
                  <div className="card-zoom position-relative">
                    <Link 
                      to={`/template/${template._id}`} 
                      className="card-img sk-thumbnail d-block"
                    >
                      <img
                        className="rounded shadow-light-lg img-fluid"
                        src={`https://designdev-final.onrender.com/${template.demoImages[0]}`}
                        alt={template.templateName}
                      />
                    </Link>
                  </div>

                  <div className="card-footer px-2 pb-2 mb-1 pt-4 position-relative">
                    <div className="avatar avatar-xl sk-fade-right badge-float position-absolute top-0 end-0 mt-n6 me-5 rounded-circle shadow border border-white border-w-lg">
                      <img
                        src={`https://designdev-final.onrender.com/${template.ProfileImage}`}
                        alt="Avatar"
                        className="avatar-img rounded-circle"
                      />
                    </div>

                    <span className="mb-1 d-inline-block text-gray-800">
                      {template.shortDescription}
                    </span>

                    <h4 className="line-clamp-2 h-md-48 h-lg-58 mb-2">
                      {template.templateName}
                    </h4>

                    <div className="row mx-n2 align-items-end">
                      <div className="col-auto px-2 text-right">
                        <ins className="h4 mb-0 d-block mb-lg-n1">
                          <span style={{ color: "green" }}>PKR</span> {template.price}
                        </ins>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredTemplates.length === 0 && isSearching && (
              <p className="text-center mt-4">No templates found matching "{searchTerm}".</p>
            )}
            {filteredTemplates.length === 0 && !isSearching && (
              <p className="text-center mt-4">No templates available.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TemplateList;
