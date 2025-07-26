import React from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

const About = () => {
  const navigate = useNavigate();

  const handleSellerRedirect = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/seller");
    } else {
      toast.error("Sign-up before mode switching", {
        position: "top-center",
      });
    }
  };

  return (
    <div style={{ backgroundColor: "#ffedd9", minHeight: "100vh", color: "#ffffff" }}>
      <ToastContainer position="top-center" autoClose={5000} />
      <div className="container py-5">
        {/* Header Section */}
        <section className="text-center mb-5" data-aos="fade-down" data-aos-duration="800">
          <h1 className="display-3 fw-bold mb-3" style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)" }}>
            About <span style={{ color: "#FF8C00" }}>DesignDev</span>
          </h1>
          <p className="lead" style={{ color: "#827f7f", fontStyle: "italic" }}>
            Empowering Creativity with Premium UI/UX Solutions
          </p>
          <div className="mt-4">
            <div style={{
              width: "80px",
              height: "4px",
              background: "linear-gradient(to right, #FF8C00, #FF4500)",
              margin: "0 auto",
              borderRadius: "2px"
            }} />
          </div>
        </section>

        {/* Introduction Section */}
        <section className="row justify-content-center mb-5" data-aos="fade-up" data-aos-duration="1000">
          <div className="col-lg-10">
            <p className="fs-4 text-center" style={{ lineHeight: "1.8", color: "#615347" }}>
              DesignDev is a vibrant platform where creativity meets functionality. We specialize in providing premium UI/UX templates and web designs crafted by talented sellers and made available for buyers to purchase and access their source code. Whether you're a designer looking to showcase and sell your work or a developer seeking high-quality templates to bring your projects to life, DesignDev is your go-to marketplace.
            </p>
          </div>
        </section>

        {/* Seller and Buyer Modes Section */}
        <section className="row mb-5">
          <div className="col-md-6 mb-4" data-aos="fade-right" data-aos-duration="1200">
            <div className="card h-100 shadow-lg border-0" style={{ background: "#2F2D51", backdropFilter: "blur(10px)", borderRadius: "15px" }}>
              <div className="card-body text-center p-5">
                <div className="mb-4">
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7v10l10 5 10-5V7l-10-5zm0 2.83l6.54 3.27v6.9L12 18.17l-6.54-3.26V8.1L12 4.83zm0 12.34l-4.5-2.25V9.75l4.5 2.25v5.17zm6-2.25l-4.5 2.25v-5.17l4.5-2.25v5.17z" fill="#FF8C00"/>
                  </svg>
                </div>
                <h3 className="h4 fw-bold" style={{ color: "#FF8C00" }}>Seller Mode</h3>
                <p className="text-light" style={{ lineHeight: "1.6"}}>
                  Are you a designer with a knack for creating stunning web templates? Switch to Seller Mode on DesignDev to upload your premium UI/UX designs, reach a global audience, and monetize your creativity. Our platform makes it easy to showcase your work and connect with buyers who value quality.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-4" data-aos="fade-left" data-aos-duration="1200">
            <div className="card h-100 shadow-lg border-0" style={{ background: "#2F2D51", backdropFilter: "blur(10px)", borderRadius: "15px" }}>
              <div className="card-body text-center p-5" >
                <div className="mb-4">
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="#FF8C00"/>
                  </svg>
                </div>
                <h3 className="h4 fw-bold" style={{ color: "#FF8C00" }}>Buyer Mode</h3>
                <p className="text-light" style={{ lineHeight: "1.6",color: "#867769" }}>
                  Looking for top-notch web designs to elevate your projects? In Buyer Mode, you can explore over 10,000 premium templates uploaded by talented sellers. Purchase your favorite designs, download their source code, and bring your ideas to life with ease.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="text-center mb-5" data-aos="zoom-in" data-aos-duration="1000">
          <h2 className="h3 fw-bold mb-4" style={{ color: "#FFD700" }}>Our Mission</h2>
          <p className="fs-5 text-dark mx-auto" style={{ maxWidth: "800px", lineHeight: "1.8" }}>
            At DesignDev, our mission is to bridge the gap between designers and developers by providing a seamless platform for buying and selling premium web designs. We aim to foster a community where creativity thrives, and high-quality UI/UX solutions are accessible to everyone.
          </p>
        </section>

        {/* Call to Action */}
        <section className="text-center" data-aos="fade-up" data-aos-duration="800">
          <button
            onClick={handleSellerRedirect}
            className="btn btn-lg btn-warning shadow-lg"
            style={{
              background: "linear-gradient(to right, #FF8C00, #FF4500)",
              border: "none",
              padding: "12px 30px",
              borderRadius: "25px",
              color: "#fff",
              fontWeight: "bold"
            }}
          >
            Join as a Seller Today!
          </button>
        </section>
      </div>
      <div className="shape shape-bottom shape-fluid-x svg-shim" style={{ color: "#6E5D61" }}>
        <svg viewBox="0 0 1920 230" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="currentColor"
            d="M0,229l1920,0V-0.4c0,25.8-19.6,47.3-45.2,49.8L54.8,223.8C25.4,226.6,0,203.5,0,174V229z"
          />
        </svg>
      </div>
    </div>
  );
};

export default About;