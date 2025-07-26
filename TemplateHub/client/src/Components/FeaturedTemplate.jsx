import React, { useEffect, useRef } from 'react'

const FeaturedTemplate = () => {
    const flickityRef = useRef(null);

  useEffect(() => {
    // Check if Flickity is available globally
    if (typeof window !== 'undefined' && window.Flickity) {
      try {
        // Initialize Flickity when the component mounts
        const flkty = new window.Flickity(flickityRef.current, {
          pageDots: false,
          prevNextButtons: true,
          cellAlign: 'left',
          wrapAround: true,
          imagesLoaded: true,
          // Add other options as needed
        });

        // Optionally, if Flickity relies on images being loaded, you might need to update it:
        flkty.reloadCells();

        return () => {
          if (flkty && typeof flkty.destroy === 'function') {
            flkty.destroy();
          }
        };
      } catch (error) {
        console.warn('Flickity initialization failed:', error);
      }
    }
  }, []);

  return (
    <>
        <section className="pt-5 pb-9 pt-md-11 bg-dark bg-cover jarallax" data-jarallax="" data-speed=".8" style={{backgroundImage: "url(/assets/img/illustrations/illustration-3.svg)"}}>
        <div className="container">
            <div className="text-center mb-5 mb-md-8">
                <h1 className="text-white mb-1">Popular Template</h1>
                <p className="font-size-lg text-capitalize">Discover your perfect template in our Website.</p>
            </div>

            <div ref={flickityRef}  className="mx-n4 flickity-button-outset" data-flickity='{"pageDots": false, "prevNextButtons": true, "cellAlign": "left", "wrapAround": true, "imagesLoaded": true}'>
                <div className="col-12 col-md-6 col-xl-4 pb-4 pb-md-7" style={{paddingRight:"15px",paddingLeft:"15px"}}>
                    {/* <!-- Card --> */}
                    <div className="card border rounded-xl shadow p-2 sk-fade">
                        {/* <!-- Image --> */}
                        <div className="card-zoom position-relative">
                            <div className="badge-float sk-fade-top top-0 right-0 mt-4 me-4">
                                <a href="#" className="btn btn-xs btn-dark text-white rounded-circle lift opacity-dot-7 me-1 p-2 d-inline-flex justify-content-center align-items-center w-36 h-36">
                                    {/* <!-- Icon --> */}
                                    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.8856 8.64995C17.7248 8.42998 13.8934 3.26379 8.99991 3.26379C4.10647 3.26379 0.274852 8.42998 0.114223 8.64974C-0.0380743 8.85843 -0.0380743 9.14147 0.114223 9.35016C0.274852 9.57013 4.10647 14.7363 8.99991 14.7363C13.8934 14.7363 17.7248 9.5701 17.8856 9.35034C18.0381 9.14169 18.0381 8.85843 17.8856 8.64995ZM8.99991 13.5495C5.39537 13.5495 2.27345 10.1206 1.3493 8.99965C2.27226 7.87771 5.38764 4.4506 8.99991 4.4506C12.6043 4.4506 15.726 7.8789 16.6505 9.00046C15.7276 10.1224 12.6122 13.5495 8.99991 13.5495Z" fill="currentColor"></path>
                                        <path d="M8.9999 5.43958C7.03671 5.43958 5.43945 7.03683 5.43945 9.00003C5.43945 10.9632 7.03671 12.5605 8.9999 12.5605C10.9631 12.5605 12.5603 10.9632 12.5603 9.00003C12.5603 7.03683 10.9631 5.43958 8.9999 5.43958ZM8.9999 11.3736C7.69103 11.3736 6.62629 10.3089 6.62629 9.00003C6.62629 7.6912 7.69107 6.62642 8.9999 6.62642C10.3087 6.62642 11.3735 7.6912 11.3735 9.00003C11.3735 10.3089 10.3088 11.3736 8.9999 11.3736Z" fill="currentColor"></path>
                                    </svg>

                                </a>
                                <a href="#" className="btn btn-xs btn-dark text-white rounded-circle lift opacity-dot-7 p-2 d-inline-flex justify-content-center align-items-center w-36 h-36">
                                    {/* <!-- Icon --> */}
                                    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.2437 1.20728C10.0203 1.20728 8.87397 1.66486 7.99998 2.48357C7.12598 1.66486 5.97968 1.20728 4.7563 1.20728C2.13368 1.20728 0 3.341 0 5.96366C0 7.2555 0.425164 8.52729 1.26366 9.74361C1.91197 10.6841 2.80887 11.5931 3.92937 12.4454C5.809 13.8753 7.66475 14.6543 7.74285 14.6867L7.99806 14.7928L8.25384 14.6881C8.33199 14.6562 10.1889 13.8882 12.0696 12.4635C13.1907 11.6142 14.0881 10.7054 14.7367 9.7625C15.575 8.54385 16 7.26577 16 5.96371C16 3.341 13.8663 1.20728 11.2437 1.20728ZM8.00141 13.3353C6.74962 12.7555 1.33966 10.0142 1.33966 5.96366C1.33966 4.07969 2.87237 2.54698 4.75634 2.54698C5.827 2.54698 6.81558 3.03502 7.46862 3.88598L8.00002 4.57845L8.53142 3.88598C9.18446 3.03502 10.173 2.54698 11.2437 2.54698C13.1276 2.54698 14.6604 4.07969 14.6604 5.96366C14.6603 10.0433 9.25265 12.7613 8.00141 13.3353Z" fill="currentColor"></path>
                                    </svg>

                                </a>
                            </div>

                            <a href="#" className="card-img sk-thumbnail d-block">
                                <img className="rounded shadow-light-lg" src="https://img.freepik.com/free-vector/gradient-color-year-2022-landing-page-template_23-2149277396.jpg" alt="..."/>
                            </a>

                            <span className="badge sk-fade-bottom badge-lg badge-orange badge-pill badge-float bottom-0 left-0 mb-4 ms-4">
                                <span className="text-white text-uppercase fw-bold font-size-xs">BEST SELLER</span>
                            </span>
                        </div>

                        {/* <!-- Footer --> */}
                        <div className="card-footer px-2 pb-2 mb-1 pt-4 position-relative">
                            <a href="#" className="d-block">
                                <div className="avatar sk-fade-right avatar-xl badge-float position-absolute top-0 right-0 mt-n6 me-5 rounded-circle shadow border border-white border-w-lg">
                                    <img src="/assets/img/avatars/avatar-1.jpg" alt="..." className="avatar-img rounded-circle"/>
                                </div>
                            </a>

                            {/* <!-- Preheading --> */}
                            <a href="#"><span className="mb-1 d-inline-block text-gray-800">Photography</span></a>

                            {/* <!-- Heading --> */}
                            <div className="position-relative">
                                <a href="#" className="d-block stretched-link"><h4 className="line-clamp-2 h-md-48 h-lg-58 me-md-6 me-lg-10 me-xl-4 mb-2">Fashion TemplatesFrom Professional</h4></a>

                                <div className="d-lg-flex align-items-end flex-wrap mb-n1">
                                 

                                
                                </div>

                                <div className="row mx-n2 align-items-end">
                                    <div className="col px-2">
                                        <ul className="nav mx-n3">
                                            <li className="nav-item px-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="me-2 d-flex icon-uxs text-secondary">
                                                        {/* <!-- Icon --> */}
                                                    

                                                    </div>
                                                 
                                                </div>
                                            </li>
                                            <li className="nav-item px-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="me-2 d-flex icon-uxs text-secondary">
                                                        {/* <!-- Icon --> */}
                                                     

                                                    </div>
                                               
                                                </div>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="col-auto px-2 text-right">
                                      
                                        <ins className="h4 mb-0 d-block mb-lg-n1">pkr 415.99</ins>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4 pb-4 pb-md-7" style={{paddingRight:"15px",paddingLeft:"15px"}}>
                    {/* <!-- Card --> */}
                    <div className="card border rounded-xl shadow p-2 sk-fade">
                        {/* <!-- Image --> */}
                        <div className="card-zoom position-relative">
                            <a href="#" className="card-img sk-thumbnail d-block">
                                <img className="rounded shadow-light-lg" src="https://i.pinimg.com/736x/f4/79/1b/f4791b5ad9eda287de92a5113bf5bd95.jpg" alt="..."/>
                            </a>
                        </div>

                        {/* <!-- Footer --> */}
                        <div className="card-footer px-2 pb-2 mb-1 pt-4 position-relative">
                            <a href="#" className="">
                                <div className="avatar avatar-xl sk-fade-right badge-float position-absolute top-0 right-0 mt-n6 me-5 rounded-circle shadow border border-white border-w-lg">
                                    <img src="/assets/img/avatars/avatar-2.jpg" alt="..." className="avatar-img rounded-circle"/>
                                </div>
                            </a>

                            {/* <!-- Preheading --> */}
                            <a href="course-single-v5.html"><span className="mb-1 d-inline-block text-gray-800">Development</span></a>

                            {/* <!-- Heading --> */}
                            <div className="position-relative">
                                <a href="#" className="d-block stretched-link"><h4 className="line-clamp-2 h-md-48 h-lg-58 me-md-6 me-lg-10 me-xl-4 mb-2">The Complete JavaScript Template 2020: Build Real Projects!</h4></a>

                                <div className="d-lg-flex align-items-end flex-wrap mb-n1">
                                  

                                
                                </div>

                                <div className="row mx-n2 align-items-end">
                                    <div className="col px-2">
                                        <ul className="nav mx-n3">
                                            <li className="nav-item px-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="me-2 d-flex icon-uxs text-secondary">
                                                        {/* <!-- Icon --> */}
                                                    

                                                    </div>
                                                 
                                                </div>
                                            </li>
                                            <li className="nav-item px-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="me-2 d-flex icon-uxs text-secondary">
                                                        {/* <!-- Icon --> */}
                                                     

                                                    </div>
                                               
                                                </div>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="col-auto px-2 text-right">
                                      
                                        <ins className="h4 mb-0 d-block mb-lg-n1">pkr 21.99</ins>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4 pb-4 pb-md-7" style={{paddingRight:"15px",paddingLeft:"15px"}}>
                    {/* <!-- Card --> */}
                    <div className="card border rounded-xl shadow p-2 sk-fade">
                        {/* <!-- Image --> */}
                        <div className="card-zoom position-relative">
                            <a href="#" className="card-img sk-thumbnail d-block">
                                <img className="rounded shadow-light-lg" src="https://assets.justinmind.com/wp-content/uploads/2024/07/hero-image-examples-design-summit.png" alt="..."/>
                            </a>
                        </div>

                        {/* <!-- Footer --> */}
                        <div className="card-footer px-2 pb-2 mb-1 pt-4 position-relative">
                            <a href="#" className="">
                                <div className="avatar avatar-xl sk-fade-right badge-float position-absolute top-0 right-0 mt-n6 me-5 rounded-circle shadow border border-white border-w-lg">
                                    <img src="/assets/img/avatars/avatar-3.jpg" alt="..." className="avatar-img rounded-circle"/>
                                </div>
                            </a>

                            {/* <!-- Preheading --> */}
                            <a href="#"><span className="mb-1 d-inline-block text-gray-800">Design</span></a>

                            {/* <!-- Heading --> */}
                            <div className="position-relative">
                                <a href="#" className="d-block stretched-link"><h4 className="line-clamp-2 h-md-48 h-lg-58 me-md-6 me-lg-10 me-xl-4 mb-2">Modern Web Design: From Beginner to Advanced</h4></a>

                                <div className="d-lg-flex align-items-end flex-wrap mb-n1">
                                  

                                
                                </div>

                                <div className="row mx-n2 align-items-end">
                                    <div className="col px-2">
                                        <ul className="nav mx-n3">
                                            <li className="nav-item px-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="me-2 d-flex icon-uxs text-secondary">
                                                        {/* <!-- Icon --> */}
                                                    

                                                    </div>
                                                 
                                                </div>
                                            </li>
                                            <li className="nav-item px-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="me-2 d-flex icon-uxs text-secondary">
                                                        {/* <!-- Icon --> */}
                                                     

                                                    </div>
                                               
                                                </div>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="col-auto px-2 text-right">
                                      
                                        <ins className="h4 mb-0 d-block mb-lg-n1">pkr 89.99</ins>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    </>
  )
}

export default FeaturedTemplate
