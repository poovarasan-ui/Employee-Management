const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Path pointing directly to 'backend/uploads'
const uploadDir = path.join(__dirname, '../../uploads');

// Create the folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?._id || 'user';
    const uniqueName = `${userId}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }
});

module.exports = upload;
