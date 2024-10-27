const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const router = express.Router();

const GITHUB_TOKEN = ${{ secrets.GITHUB_TOKEN }};
const GITHUB_REPO = 'roblox-remake';
const GITHUB_USER = 'softbf395';

// Hashes password using SHA-256
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Check if a user exists
async function checkUserExists(username) {
    try {
        const response = await axios.get(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/users/${username}.rbxuser`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        return response.data;
    } catch (error) {
        return null; // User does not exist
    }
}

// Create a new user
async function createUser(username, password) {
    const hashedPassword = hashPassword(password);
    const userContent = JSON.stringify({
        username: username,
        password: hashedPassword,
        isadmin: false
    });

    const encodedContent = Buffer.from(userContent).toString('base64');

    await axios.put(
        `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/users/${username}.rbxuser`,
        {
            message: `Creating user ${username}`,
            content: encodedContent
        },
        {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        }
    );
}

// Sign-Up Route
router.post('/public/SignUp', async (req, res) => {
    const { username, password } = req.body;

    // Check if the user already exists
    const userExists = await checkUserExists(username);
    if (userExists) {
        return res.json({ message: 'User already exists!' });
    }

    // Create new user
    await createUser(username, password);
    return res.json({ message: 'User created successfully!' });
});

// Sign-In Route
router.post('/public/SignIn', async (req, res) => {
    const { username, password } = req.body;

    // Check if the user exists
    const user = await checkUserExists(username);
    if (!user) {
        return res.json({ message: 'User does not exist!' });
    }

    // Decode and verify the password
    const decodedUserContent = Buffer.from(user.content, 'base64').toString('utf8');
    const userData = JSON.parse(decodedUserContent);

    if (userData.password === hashPassword(password)) {
        return res.json({ message: 'Login successful!' });
    } else {
        return res.json({ message: 'Incorrect password!' });
    }
});

module.exports = router;
