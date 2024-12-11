const express = require('express');
const bodyParser = require('body-parser');
const query = require('./db');
const app = express();

app.use(bodyParser.json());


app.post('/login', async (req, res) => {
  const { account, password } = req.body;
  const result = await query('SELECT * FROM users WHERE account = ? AND password = ?', [account, password]);
  if (result.length > 0) {
    res.json({ success: true, data: result[0] });
  } else {
    res.json({ success: false, message: 'Invalid account or password' });
  }
});

// Register API
app.post('/register', async (req, res) => {
  const { account, password, phone } = req.body;

  if (!account || !password || !phone) {
    return res.json({ success: false, message: 'Account, password, and phone are required' });
  }

  try {
    const existing = await query('SELECT * FROM users WHERE account = ?', [account]);
    if (existing.length > 0) {
      return res.json({ success: false, message: 'Account already exists' });
    }

    await query(
      'INSERT INTO users (account, password, phone, reg_time) VALUES (?, ?, ?, NOW())',
      [account, password, phone]
    );

    res.json({ success: true, message: 'Registration successful' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// WeChat Login API
app.post('/wxlogin', async (req, res) => {
  const { wxId } = req.body;
  let user = await query('SELECT * FROM users WHERE wx_id = ?', [wxId]);
  if (user.length === 0) {
    await query('INSERT INTO users (wx_id, reg_time) VALUES (?, NOW())', [wxId]);
    user = await query('SELECT * FROM users WHERE wx_id = ?', [wxId]);
  }
  res.json({ success: true, data: user[0] });
});
//获取用户地址的API
app.post('/getDefaultAddress', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.json({ success: false, message: 'User ID is required' });
  }

  try {
    const result = await query(
      `SELECT a.address_id, a.detail, u.phone 
       FROM address a 
       JOIN users u ON a.user_id = u.user_id 
       WHERE a.user_id = ? AND a.is_default = TRUE`,
      [userId]
    );
    if (result.length > 0) {
      res.json({ success: true, data: result[0] });
    } else {
      res.json({ success: false, message: 'No default address found' });
    }
  } catch (error) {
    console.error('Error fetching default address:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Start server
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
