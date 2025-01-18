// controllers/authController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register User
exports.signup = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        // Save the user to the database
        await newUser.save();

        // Redirect to login page after successful signup
        res.status(201).json({ message: 'User created successfully. Please login.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occurred while registering user.' });
    }
};

// Login User
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Create JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send the token and user data in response
        res.status(200).json({ token, message: 'Login successful.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occurred while logging in.' });
    }
};
