const multer = require("multer");
const path = require("path");

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Change this to your upload folder
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

// File type validation
const fileFilter = (req, file, cb) => {
  console.log(`[multer fileFilter] fieldname: ${file.fieldname}, originalname: ${file.originalname}`);
  // TEMP: Allow all file types for debugging
  cb(null, true);
  // --- Original strict validation below (commented out for now) ---
  // const allowedExtensions = {
  //   profileImage: [".png", ".jpg", ".jpeg"],
  //   sourceCode: [".zip", ".rar", ".7z"],
  //   demoImages: [".png", ".jpg", ".jpeg"],
  // };
  // const ext = path.extname(file.originalname).toLowerCase();
  // const allowed = allowedExtensions[file.fieldname] || [];
  // if (allowed.includes(ext)) {
  //   cb(null, true);
  // } else {
  //   cb(new Error(`Invalid file type for ${file.fieldname}. Allowed types: ${allowed.join(", ")}`), false);
  // }
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});


module.exports = upload;
