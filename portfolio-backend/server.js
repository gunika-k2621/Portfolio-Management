const express = require('express');
const cors = require('cors');
const { initDB, getPool } = require('./db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Allow large base64 strings
app.use(express.urlencoded({ limit: '50mb', extended: true }));

initDB().then(() => {
    console.log("Database connected. Starting server routes...");
}).catch(err => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
});

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const pool = getPool();
        const [existing] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existing.length > 0) return res.status(400).json({ error: 'Username already exists' });
        
        await pool.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
        res.json({ message: 'Registration successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const pool = getPool();
        const [users] = await pool.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        
        const user = users[0];
        res.json({ id: user.id, username: user.username, email: user.email });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user's projects
app.get('/api/projects/:userId', async (req, res) => {
    try {
        const pool = getPool();
        const [projects] = await pool.query('SELECT * FROM projects WHERE user_id = ?', [req.params.userId]);
        for (let p of projects) {
            const [files] = await pool.query('SELECT * FROM project_files WHERE project_id = ?', [p.id]);
            p.files = files;
        }
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Save or Update project
app.post('/api/projects', async (req, res) => {
    try {
        const { id, user_id, title, description, technologies, files } = req.body;
        const pool = getPool();
        let insertId = id;
        
        if (!id) {
            // New project
            const [result] = await pool.query('INSERT INTO projects (user_id, title, description, technologies) VALUES (?, ?, ?, ?)', [user_id, title, description, technologies]);
            insertId = result.insertId;
        } else {
            // Update project
            await pool.query('UPDATE projects SET title=?, description=?, technologies=? WHERE id=? AND user_id=?', [title, description, technologies, id, user_id]);
            // Clear existing files to re-upload them
            await pool.query('DELETE FROM project_files WHERE project_id=?', [insertId]);
        }

        if (files && files.length > 0) {
            for (let f of files) {
                await pool.query('INSERT INTO project_files (project_id, name, type, size, lastModified, dataUrl) VALUES (?, ?, ?, ?, ?, ?)',
                    [insertId, f.name, f.type, f.size || 0, f.lastModified || 0, f.dataUrl]);
            }
        }
        
        res.json({ message: 'Project saved' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Delete project
app.delete('/api/projects/:id', async (req, res) => {
    try {
        const pool = getPool();
        await pool.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
        res.json({ message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Portfolio Get
app.get('/api/portfolio/:username', async (req, res) => {
    try {
        const pool = getPool();
        const [users] = await pool.query('SELECT id, username, email FROM users WHERE username = ?', [req.params.username]);
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });
        const user = users[0];
        
        const [projects] = await pool.query('SELECT * FROM projects WHERE user_id = ?', [user.id]);
        for (let p of projects) {
            const [files] = await pool.query('SELECT * FROM project_files WHERE project_id = ?', [p.id]);
            p.files = files;
        }
        
        const [resumes] = await pool.query('SELECT * FROM resumes WHERE user_id = ?', [user.id]);
        user.resume = resumes.length > 0 ? resumes[0] : null;
        user.projects = projects;
        
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload resume
app.post('/api/resume', async (req, res) => {
    try {
        const { user_id, name, type, dataUrl } = req.body;
        const pool = getPool();
        await pool.query(`
            INSERT INTO resumes (user_id, name, type, dataUrl) 
            VALUES (?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE name=VALUES(name), type=VALUES(type), dataUrl=VALUES(dataUrl)`,
            [user_id, name, type, dataUrl]
        );
        res.json({ message: 'Resume uploaded' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
