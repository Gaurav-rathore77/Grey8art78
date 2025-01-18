const express = require('express');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { v2: cloudinary } = require('cloudinary');
const fs = require('fs/promises');
const Image = require('./models/Image'); // Ensure the schema exists
const authRoutes = require('./routes/auth');
const staticRoutes = require('./routes/static');

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', staticRoutes);
app.use('/auth', authRoutes);

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
    api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret',
    secure: true, // Use HTTPS
});

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Database connected successfully'))
    .catch(error => {
        console.error('Database connection failed:', error);
        process.exit(1);
    });

// Ensure the 'uploads' directory exists for temporary file storage
const uploadDir = path.join(__dirname, 'uploads');
fs.mkdir(uploadDir, { recursive: true }).catch(err =>
    console.error('Error creating uploads directory:', err)
);

// Multer configuration for local storage
const upload = multer({
    dest: uploadDir, // Temporary storage
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Unsupported file type'), false);
        }
        cb(null, true);
    },
});

// Routes
// Serve the upload form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
app.get('/index1', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index1.html'));
});
// Handle image upload, upload to Cloudinary, and save to MongoDB
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send('No file uploaded.');

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'uploads',
            transformation: [{ width: 800, height: 800, crop: 'limit' }],
        });

        // Save image info to MongoDB
        const image = new Image({
            public_id: result.public_id,
            url: result.secure_url,
        });
        await image.save();

        // Cleanup local file
        await fs.unlink(req.file.path);

        // Redirect to the gallery
        res.redirect('/portfolio');
    } catch (error) {
        console.error('Error uploading file:', error);

        // Cleanup the temporary file if an error occurs
        if (req.file?.path) {
            await fs.unlink(req.file.path).catch(cleanupError =>
                console.error('File cleanup error:', cleanupError)
            );
        }
        res.status(500).send('File upload failed.');
    }
});

// Serve the gallery page
app.get('/images', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'images.html'));
});
app.get('/portfolio', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'portfolio-2.html'));
    
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});
app.get('/service', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'service.html'));
});
app.get('/services', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'services.html'));
});
app.get('/publication', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'publication.html'));
});
app.get('/blog', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'blog.html'));
});
app.get('/team', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'team.html'));
});
app.get('/404', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
});
// Fetch all images as JSON for the frontend
app.get('/fetch-images', async (req, res) => {
    try {
        const images = await Image.find();
        res.json(images);
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).send('Error fetching images from the database.');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
