import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import axios from "axios";
import Input from "./Input";
import './Navbar.css';
import API_CONFIG from '../config/api';

const Navbar = ({ searchTerm, setSearchTerm }) => {
  const navigate = useNavigate();
  const [showSeller, setShowSeller] = useState(false);

  useEffect(() => {
    const parallaxInstance = new Parallax(
      document.querySelector(".cs-parallax"),
      {
        relativeInput: true,
      }
    );

    return () => {
      parallaxInstance.destroy();
    };
  }, []);

  const token = localStorage.getItem("token");

  const SellerRedirect = () => toast.error("Sign-up before mode switching", {
    position: "top-center"
  });

  const handleShift = () => {
    if (token) {
      navigate("/seller");
    } else {
      SellerRedirect();
    }
  };



  const [formData, setFormData] = useState({
    username: "",
    email: "",
    identifier: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [logout, setLogout] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  
  // Password validation states
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (token && username) {
      setLogout(true);
    } else {
      setLogout(false);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Password validation for signup form
    if (e.target.name === 'password') {
      const password = e.target.value;
      setPasswordStrength({
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      });
    }
  };

  // Password validation function
  const validatePassword = (password) => {
    const validations = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    return Object.values(validations).every(Boolean);
  };

  // Signup handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password before submission
    if (!validatePassword(formData.password)) {
      toast.error("Please ensure your password meets all requirements", { 
        position: "top-center", 
        autoClose: 4000 
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/signup`, {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      if (response.status === 201 || response.status === 200) {
        // Signup success, now log in
        const res = await axios.post(`${API_CONFIG.BASE_URL}/login`, {
          identifier: formData.email, // login expects identifier
          password: formData.password
        });
        if (res.status === 200) {
          const { username, token, userId } = res.data;
        
          localStorage.setItem("username", username);
          localStorage.setItem("token", token);
          localStorage.setItem("userId", userId);
          setFormData({ username: "", email: "", identifier: "", password: "" });
          setLogout(true);
                window.location.href = '/';
        } else {
          toast.error("Login after signup failed.", { position: "top-center", autoClose: 4000 });
        }
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        toast.error("User already exists. Please log in.", { position: "top-center", autoClose: 4000 });
      } else {
        toast.error("Signup Failed!", { position: "top-center", autoClose: 4000 });
      }
    } finally {
      setLoading(false);
    }
  };
  // Login handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/login`, {
        identifier: formData.identifier,
        password: formData.password
      });
      if (response.status === 200) {
        const { username, token, userId } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        localStorage.setItem("userId", userId);
      
        setFormData({ username: "", email: "", identifier: "", password: "" });
        setLogout(true);
              window.location.href = '/';
      }
    } catch (err) {

    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/forgot-password`, { email: forgotPasswordEmail });
      if (response.data.success) {
        toast.success("Password reset link sent! Check your email.", { position: "top-center", autoClose: 5000 });
        setForgotPasswordEmail("");
      } else {
        toast.error(response.data.error || "Failed to send reset link.", { position: "top-center", autoClose: 5000 });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send reset link.", { position: "top-center", autoClose: 5000 });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Google OAuth handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/google`, {
        credential: credentialResponse.credential
      });

      if (response.data.success) {
        const { token, user } = response.data;
        
        localStorage.setItem("token", token);
        localStorage.setItem("username", user.username);
        localStorage.setItem("userId", user.userId);
        if (user.profileImage) {
          localStorage.setItem("profileImage", user.profileImage);
        }
        
        setLogout(true);
        toast.success(response.data.message, { position: "top-center", autoClose: 3000 });
        
        // Close modal and redirect
        const modal = document.getElementById('accountModal');
        if (modal) {
          const bootstrapModal = bootstrap.Modal.getInstance(modal);
          if (bootstrapModal) {
            bootstrapModal.hide();
          }
        }
        
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error.response?.data?.error || "Google login failed", { position: "top-center", autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login failed. Please try again.", { position: "top-center", autoClose: 5000 });
  };

  setInterval(() => {
    localStorage.clear();
    console.log("localStorage cleared");
  }, 1000 * 60 * 60);

  const handleLogout = () => {
    setLogout(false);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  };

  return (
    <div>
      {/* MODALS */}
      <div
        className="modal fade"
        id="modalExample"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="modalExampleTitle"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-body">
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
              <h2 className="fw-bold text-center mb-1" id="modalExampleTitle">
                Schedule a demo with us
              </h2>
              <p className="font-size-lg text-center text-muted mb-6 mb-md-8">
                We can help you solve company communication.
              </p>
              <form>
                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="form-label-group">
                      <input
                        type="text"
                        className="form-control form-control-flush"
                        id="registrationFirstNameModal"
                        placeholder="First name"
                      />
                      <label htmlFor="registrationFirstNameModal">
                        First name
                      </label>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="form-label-group">
                      <input
                        type="text"
                        className="form-control form-control-flush"
                        id="registrationLastNameModal"
                        placeholder="Last name"
                      />
                      <label htmlFor="registrationLastNameModal">
                        Last name
                      </label>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="form-label-group">
                      <input
                        type="email"
                        className="form-control form-control-flush"
                        id="registrationEmailModal"
                        placeholder="Email"
                      />
                      <label htmlFor="registrationEmailModal">Email</label>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="form-label-group">
                      <input
                        type="password"
                        className="form-control form-control-flush"
                        id="registrationPasswordModal"
                        placeholder="Password"
                      />
                      <label htmlFor="registrationPasswordModal">
                        Password
                      </label>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <button className="btn btn-block btn-primary mt-3 lift">
                      Request a demo
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="modal modal-sidebar left fade-left fade" id="accountModal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="collapse show" id="collapseSignin" data-bs-parent="#accountModal">
              <div className="modal-header">
                <h5 className="modal-title">Log In to Your DesignDev Account!</h5>
                <button type="button" className="close text-primary" data-bs-dismiss="modal" aria-label="Close">
                  <svg width="16" height="17" viewBox="0 0 16 17" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.142135 2.00015L1.55635 0.585938L15.6985 14.7281L14.2843 16.1423L0.142135 2.00015Z" fill="currentColor"></path>
                    <path d="M14.1421 1.0001L15.5563 2.41431L1.41421 16.5564L0 15.1422L14.1421 1.0001Z" fill="currentColor"></path>
                  </svg>
                </button>
              </div>
              <div className="modal-body">
                <form className="mb-5" onSubmit={handleLoginSubmit}>
                  <div className="form-group mb-5">
                    <label htmlFor="modalSigninIdentifier">Username or Email</label>
                    <input
                      name="identifier"
                      value={formData.identifier}
                      onChange={handleChange}
                      type="text"
                      className="form-control"
                      id="modalSigninIdentifier"
                      placeholder="Username or Email"
                    />
                  </div>
                  <div className="form-group mb-5">
                    <label htmlFor="modalSigninPassword">Password</label>
                    <div className="position-relative">
                      <input
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        id="modalSigninPassword"
                        placeholder="**********"
                      />
                      <button
                        type="button"
                        className="btn btn-sm position-absolute"
                        style={{ right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none" }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                      </button>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-5 font-size-sm">
                    <div className="form-check">
                      <input className="form-check-input text-gray-800" type="checkbox" id="autoSizingCheck" />
                      <label className="form-check-label text-gray-800" htmlFor="autoSizingCheck">
                        Remember me
                      </label>
                    </div>
                    <div className="ms-auto">
                      <a className="text-gray-800" data-bs-toggle="collapse" href="#collapseForgotPassword" role="button" aria-expanded="false" aria-controls="collapseForgotPassword">
                        Forgot Password
                      </a>
                    </div>
                  </div>
                  <button className="btn btn-block btn-primary" type="submit">
                    {loading ? "LOGIN IN.." : "LOGIN"}
                  </button>
                </form>
                
                {/* Google Login Button */}
                <div className="text-center mb-3">
                  <div className="divider">
                    <span>or</span>
                  </div>
                  <div className="google-login-container">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap
                      theme="outline"
                      size="large"
                      text="continue_with"
                      shape="rectangular"
                      locale="en"
                    />
                  </div>
                </div>
                
                <p className="mb-0 font-size-sm text-center">
                  Don't have an account?{" "}
                  <a className="text-underline" data-bs-toggle="collapse" href="#collapseSignup" role="button" aria-expanded="false" aria-controls="collapseSignup">
                    Sign up
                  </a>
                </p>
              </div>
            </div>
            <div className="collapse" id="collapseSignup" data-bs-parent="#accountModal">
              <div className="modal-header">
                <h5 className="modal-title">Sign Up and Start Learning!</h5>
                <button type="button" className="close text-primary" data-bs-dismiss="modal" aria-label="Close">
                  <svg width="16" height="17" viewBox="0 0 16 17" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.142135 2.00015L1.55635 0.585938L15.6985 14.7281L14.2843 16.1423L0.142135 2.00015Z" fill="currentColor"></path>
                    <path d="M14.1421 1.0001L15.5563 2.41431L1.41421 16.5564L0 15.1422L14.1421 1.0001Z" fill="currentColor"></path>
                  </svg>
                </button>
              </div>
              <div className="modal-body">
                <form className="mb-5" onSubmit={handleSubmit}>
                  <div className="form-group mb-5">
                    <label htmlFor="modalSignupUsername">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      id="modalSignupUsername"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="form-group mb-5">
                    <label htmlFor="modalSignupEmail">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="modalSignupEmail"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="johndoe@example.com"
                      required
                    />
                  </div>
                  <div className="form-group mb-5">
                    <label htmlFor="modalSignupPassword">Password</label>
                    <div className="position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        id="modalSignupPassword"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="**********"
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-sm position-absolute"
                        style={{ right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none" }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-3">
                        <div className="d-flex align-items-center mb-2">
                          <small className="text-muted me-2">Password Strength:</small>
                          <div className="progress flex-grow-1" style={{ height: "4px" }}>
                            <div 
                              className={`progress-bar ${validatePassword(formData.password) ? 'bg-success' : 'bg-warning'}`}
                              style={{ width: `${Object.values(passwordStrength).filter(Boolean).length * 20}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Password Requirements */}
                        <div className="small text-muted">
                          <div className={`d-flex align-items-center mb-1 ${passwordStrength.length ? 'text-success' : 'text-muted'}`}>
                            <i className={`fas fa-${passwordStrength.length ? 'check-circle' : 'circle'} me-2`}></i>
                            At least 8 characters
                          </div>
                          <div className={`d-flex align-items-center mb-1 ${passwordStrength.uppercase ? 'text-success' : 'text-muted'}`}>
                            <i className={`fas fa-${passwordStrength.uppercase ? 'check-circle' : 'circle'} me-2`}></i>
                            One uppercase letter
                          </div>
                          <div className={`d-flex align-items-center mb-1 ${passwordStrength.lowercase ? 'text-success' : 'text-muted'}`}>
                            <i className={`fas fa-${passwordStrength.lowercase ? 'check-circle' : 'circle'} me-2`}></i>
                            One lowercase letter
                          </div>
                          <div className={`d-flex align-items-center mb-1 ${passwordStrength.number ? 'text-success' : 'text-muted'}`}>
                            <i className={`fas fa-${passwordStrength.number ? 'check-circle' : 'circle'} me-2`}></i>
                            One number
                          </div>
                          <div className={`d-flex align-items-center mb-1 ${passwordStrength.special ? 'text-success' : 'text-muted'}`}>
                            <i className={`fas fa-${passwordStrength.special ? 'check-circle' : 'circle'} me-2`}></i>
                            One special character
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <button className="btn btn-block btn-primary" type="submit" disabled={loading}>
                    {loading ? "Signing Up..." : "SIGN UP"}
                  </button>
                </form>
                
                {/* Google Signup Button */}
                <div className="text-center mb-3">
                  <div className="divider">
                    <span>or</span>
                  </div>
                  <div className="google-login-container">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap
                      theme="outline"
                      size="large"
                      text="signup_with"
                      shape="rectangular"
                      locale="en"
                    />
                  </div>
                </div>
              </div>
              <p className="mb-0 font-size-sm text-center">
                Already have an account?{" "}
                <a className="text-underline" data-bs-toggle="collapse" href="#collapseSignin" role="button" aria-expanded="true" aria-controls="collapseSignin">
                  Log In
                </a>
              </p>
            </div>
            <div className="collapse" id="collapseForgotPassword" data-bs-parent="#accountModal">
              <div className="modal-header">
                <h5 className="modal-title">Recover password!</h5>
                <button type="button" className="close text-primary" data-bs-dismiss="modal" aria-label="Close">
                  <svg width="16" height="17" viewBox="0 0 16 17" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.142135 2.00015L1.55635 0.585938L15.6985 14.7281L14.2843 16.1423L0.142135 2.00015Z" fill="currentColor"></path>
                    <path d="M14.1421 1.0001L15.5563 2.41431L1.41421 16.5564L0 15.1422L14.1421 1.0001Z" fill="currentColor"></path>
                  </svg>
                </button>
              </div>
              <div className="modal-body">
                <form className="mb-5" onSubmit={handleForgotPasswordSubmit}>
                  <div className="form-group">
                    <label htmlFor="modalForgotpasswordEmail">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="modalForgotpasswordEmail"
                      placeholder="johndoe@creativelayers.com"
                      value={forgotPasswordEmail}
                      onChange={e => setForgotPasswordEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button className="btn btn-block btn-primary" type="submit" disabled={forgotPasswordLoading}>
                    {forgotPasswordLoading ? "Sending..." : "RECOVER PASSWORD"}
                  </button>
                </form>
                <p className="mb-0 font-size-sm text-center">
                  Remember your password?{" "}
                  <a className="text-underline" data-bs-toggle="collapse" href="#collapseSignin" role="button" aria-expanded="false" aria-controls="collapseSignin">
                    Log In
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NAVBAR */}
      <div className="container d-none d-xl-block">
        <div className="d-flex align-items-center border-bottom border-white-20 pt-2 pb-4">
          <ul className="nav mx-n3">
            <li className="nav-item px-3">
              <span className="font-size-sm text-white">(+92) 123 456 789</span>
            </li>
            <li className="nav-item px-3">
              <span className="font-size-sm text-white">hello@designDev.com</span>
            </li>
          </ul>
          <ul className="nav ms-auto me-n3 font-size-sm">
            <li className="nav-item px-3">
              <a href="#" className="nav-link p-0 text-white">
                <i className="fab fa-facebook-f"></i>
              </a>
            </li>
            <li className="nav-item px-3">
              <a href="#" className="nav-link p-0 text-white">
                <i className="fab fa-twitter"></i>
              </a>
            </li>
            <li className="nav-item px-3">
              <a href="#" className="nav-link p-0 text-white">
                <i className="fab fa-instagram"></i>
              </a>
            </li>
            <li className="nav-item px-3">
              <a href="#" className="nav-link p-0 text-white">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <header className="navbar navbar-expand-xl navbar-dark custom-navbar">
        <div className="container">
          <a className="navbar-brand" href="/">
            <img
              src="https://icon-library.com/images/website-design-icon-png/website-design-icon-png-8.jpg"
              className="navbar-brand-img"
              alt="..."
            />
          </a>
          {/* Become Button with Toggle Dropdown */}
          <div className="dropdown ms-0" style={{ position: 'relative' }}>
            <button
              className="btn btn-theme"
              type="button"
              id="becomeDropdown"
              aria-expanded={showSeller ? "true" : "false"}
              onClick={() => setShowSeller((prev) => !prev)}
            >
              Become a buyer
            </button>
            {showSeller && (
              <ul className="dropdown-menu show" aria-labelledby="becomeDropdown" style={{ display: 'block', minWidth: '110px', marginTop: 2 }}>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => { setShowSeller(false); navigate('/seller'); }}
                  >
                    Become a seller
                  </button>
                </li>
              </ul>
            )}
          </div>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavDropdown"
            aria-controls="navbarNavDropdown"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            {/* Mobile close icon */}
            <button type="button" className="mobile-close d-xl-none" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-label="Close menu">
              &times;
            </button>
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link" href="/">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#about-section">About</a>
              </li>
              {logout && (
                <>
                  <li className="nav-item">
                    <Link to={`/profile/${localStorage.getItem('username') || localStorage.getItem('userId')}`} className="nav-link">Profile</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/inbox" className="nav-link">Messages</Link>
                  </li>
                </>
              )}
              <li className="nav-item">
                {logout ? (
                  <span className="nav-link" style={{cursor: 'pointer'}} onClick={handleLogout}>Logout</span>
                ) : (
                  <a className="nav-link" data-bs-toggle="modal" data-bs-target="#accountModal">Login / Register</a>
                )}
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-15 pt-xl-14 mt-n14 pb-lg-15 bg-dark bg-cover position-relative">
        <div className="position-absolute right-0 left-0 top-0 bottom-0">
          <div className="cs-parallax">
            <div className="cs-parallax-layer" data-depth="0.1">
              <img className="img-fluid" src="/assets/img/parallax/layer-01.svg" alt="Layer" />
            </div>
            <div className="cs-parallax-layer" data-depth="0.3">
              <img className="img-fluid" src="/assets/img/parallax/layer-02.svg" alt="Layer" />
            </div>
            <div className="cs-parallax-layer" data-depth="0.2">
              <img className="img-fluid" src="/assets/img/parallax/layer-03.svg" alt="Layer" />
            </div>
            <div className="cs-parallax-layer" data-depth="0.2">
              <img className="img-fluid" src="/assets/img/parallax/layer-04.svg" alt="Layer" />
            </div>
            <div className="cs-parallax-layer" data-depth="0.4">
              <img className="img-fluid" src="/assets/img/parallax/layer-05.svg" alt="Layer" />
            </div>
            <div className="cs-parallax-layer" data-depth="0.3">
              <img className="img-fluid" src="/assets/img/parallax/layer-06.svg" alt="Layer" />
            </div>
            <div className="cs-parallax-layer" data-depth="0.2">
              <img className="img-fluid" src="/assets/img/parallax/layer-07.svg" alt="Layer" />
            </div>
            <div className="cs-parallax-layer" data-depth="0.2">
              <img className="img-fluid" src="/assets/img/parallax/layer-08.svg" alt="Layer" />
            </div>
            <div className="cs-parallax-layer" data-depth="0.4">
              <img className="img-fluid" src="/assets/img/parallax/layer-09.svg" alt="Layer" />
            </div>
            <div className="cs-parallax-layer" data-depth="0.3">
              <img className="img-fluid" src="/assets/img/parallax/layer-10.svg" alt="Layer" />
            </div>
          </div>
        </div>
        {/* Overlay for small/medium screens */}
        <div className="container d-block d-xl-none position-absolute top-0 start-0 w-100 min-vh-100 d-flex align-items-center justify-content-center pt-10 pb-0" style={{zIndex:2}}>
          <div className="text-center w-100">
            <h1 className="display-4 text-white mb-4" data-aos="fade-left" data-aos-duration="150">
              Explore Premium UI/UX <span className="display-5 text-orange fw-bold">Templates</span>
            </h1>
            <div className="d-flex justify-content-center mb-3">
              <div className="w-75">
                <Input searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              </div>
            </div>
            <p className="text-white text-capitalize" data-aos="fade-up" data-aos-duration="200">
              Trending Search: Portfolio, Ecommerce, UI
            </p>
          </div>
        </div>
        {/* Original layout for xl and up */}
        <div className="container d-none d-xl-block">
          <div className="row align-items-center">
            <div className="col-12 col-md-5 col-lg-6 order-md-2" data-aos="fade-in">
              <img
                src="/assets/img/illustrations/illustration-4.png"
                className="img-fluid ms-xl-5 mw-md-150 mw-lg-130 mb-6 mb-md-0"
                alt="..."
              />
            </div>
            <div className="col-12 col-md-7 col-lg-6 order-md-1">
              <h1 className="display-2 text-white mb-6" data-aos="fade-left" data-aos-duration="150">
              Explore Premium UI/UX <span className="display-1 text-orange fw-bold">Templates</span>
              </h1>
              <Input searchTerm={searchTerm} setSearchTerm={setSearchTerm}></Input>
              <p className="text-white text-capitalize" data-aos="fade-up" data-aos-duration="200">
                Trending Search: Portfolio, Ecommerce, UI
              </p>
            </div>
          </div>
        </div>
        <div className="shape shape-blur mb-n-1 shape-bottom shape-fluid-x svg-shim text-white ice">
          <svg viewBox="0 0 1920 230" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="currentColor" 
              d="M0,229l1920,0V-0.4c0,25.8-19.6,47.3-45.2,49.8L54.8,223.8C25.4,226.6,0,203.5,0,174V229z"
            />
          </svg>
        </div>
      </section>

      <ToastContainer position="top-center" autoClose={5000} />
    </div>
  );
};

export default Navbar;