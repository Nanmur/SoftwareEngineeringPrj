const express = require('express');
const bodyParser = require('body-parser');
const query = require('./db');
const app = express();

app.use(bodyParser.json());

// 用户登录
app.post('/login', async (req, res) => {
  const { account, password } = req.body;
  const result = await query('SELECT * FROM users WHERE account = ? AND password = ?', [account, password]);
  if (result.length > 0) {
    res.json({ success: true, data: result[0] });
  } else {
    res.json({ success: false, message: 'Invalid account or password' });
  }
});

// 用户注册
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

// 微信登录
app.post('/wxlogin', async (req, res) => {
  const { wxId } = req.body;
  let user = await query('SELECT * FROM users WHERE wx_id = ?', [wxId]);
  if (user.length === 0) {
    await query('INSERT INTO users (wx_id, reg_time) VALUES (?, NOW())', [wxId]);
    user = await query('SELECT * FROM users WHERE wx_id = ?', [wxId]);
  }
  res.json({ success: true, data: user[0] });
});

// 获取用户默认地址
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

app.post('/getAddresses', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.json({ success: false, message: 'User ID is required' });
  }

  try {
    const result = await query(
      'SELECT address_id, detail, is_default FROM address WHERE user_id = ?',
      [userId]
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// 获取用户地址列表
app.post('/getAddresses', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.json({ success: false, message: 'User ID is required' });
  }

  try {
    const result = await query(
      'SELECT address_id, detail, is_default FROM address WHERE user_id = ?',
      [userId]
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// 添加新地址
app.post('/addAddress', async (req, res) => {
  const { userId, detail, isDefault } = req.body;

  if (!userId || !detail) {
    return res.json({ success: false, message: 'User ID and address detail are required' });
  }

  try {
    // 检查是否有重复的地址
    const existing = await query(
      'SELECT * FROM address WHERE user_id = ? AND detail = ?',
      [userId, detail]
    );
    if (existing.length > 0) {
      return res.json({ success: false, message: 'Address already exists' });
    }

    // 如果是默认地址，取消其他地址的默认状态
    if (isDefault) {
      await query('UPDATE address SET is_default = FALSE WHERE user_id = ?', [userId]);
    }

    // 插入新地址
    const result = await query(
      'INSERT INTO address (user_id, detail, is_default) VALUES (?, ?, ?)',
      [userId, detail, isDefault]
    );

    const addressId = result.insertId;

    // 同步插入 region 表
    await query(
      'INSERT INTO region (address_id, region_detail, region_id) VALUES (?, "none", 1)',
      [addressId]
    );

    res.json({ success: true, message: 'Address added successfully' });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// 设置默认地址
app.post('/setDefaultAddress', async (req, res) => {
  const { userId, addressId } = req.body;

  if (!userId || !addressId) {
    return res.json({ success: false, message: 'User ID and address ID are required' });
  }

  try {
    // 取消其他默认地址
    await query('UPDATE address SET is_default = FALSE WHERE user_id = ?', [userId]);

    // 设置新的默认地址
    await query('UPDATE address SET is_default = TRUE WHERE address_id = ?', [addressId]);

    res.json({ success: true, message: 'Default address updated successfully' });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// 启动服务器
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
