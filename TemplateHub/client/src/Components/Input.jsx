// Input.jsx
import React from 'react';

const Input = ({ searchTerm, setSearchTerm, templates, navigate }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Find exact match (case-insensitive)
      const match = templates.find(
        t => t.templateName && t.templateName.toLowerCase() === searchTerm.trim().toLowerCase()
      );
      if (match) {
        navigate(`/template/${match._id}`);
      }
    }
  };

  return (
    <form className="mb-6 me-xl-9" data-aos="fade-up" data-aos-duration="200">
      <div className="input-group">
        <div className="input-group-prepend">
          <span className="input-group-text border-right-0 text-primary icon-xs rounded-left-xl">
            {/* Icon SVG */}
          </span>
        </div>
        <input
          type="search"
          className="form-control ps-2 border-left-0 rounded-right-xl border-0"
          placeholder="Search for a Template"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </form>
  );
};

export default Input;
