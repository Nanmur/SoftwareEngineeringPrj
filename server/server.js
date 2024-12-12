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

// 获取用户地址列表
app.post('/getAddresses', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.json({ success: false, message: 'User ID is required' });
  }

  try {
    const result = await query(
      `SELECT address_id, detail, is_default FROM address WHERE user_id = ?`,
      [userId]
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// 获取用户默认地址
app.post('/getDefaultAddress', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.json({ success: false, message: 'User ID is required' });
  }

  try {
    const result = await query(
      `SELECT address_id, detail, is_default FROM address WHERE user_id = ? AND is_default = TRUE`,
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

// 添加新地址
app.post('/addAddress', async (req, res) => {
  const { userId, detail, isDefault } = req.body;

  console.log("接收到添加地址请求", req.body); // 输出请求的参数

  if (!userId || !detail) {
    return res.json({ success: false, message: 'User ID and address details are required' });
  }

  try {
    if (isDefault) {
      // 如果是默认地址，先将所有地址的 is_default 设置为 FALSE
      await query('UPDATE address SET is_default = FALSE WHERE user_id = ?', [userId]);
    }
    // 添加新地址
    await query(
      'INSERT INTO address (user_id, detail, is_default) VALUES (?, ?, ?)',
      [userId, detail, isDefault ? 1 : 0]
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
    return res.json({ success: false, message: 'User ID and Address ID are required' });
  }

  try {
    // 将所有地址的 is_default 设置为 FALSE
    await query('UPDATE address SET is_default = FALSE WHERE user_id = ?', [userId]);

    // 将指定地址设置为默认地址
    await query('UPDATE address SET is_default = TRUE WHERE address_id = ? AND user_id = ?', [addressId, userId]);

    res.json({ success: true, message: 'Default address set successfully' });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// 删除地址
app.post('/deleteAddress', async (req, res) => {
  const { userId, addressId } = req.body;

  if (!userId || !addressId) {
    return res.json({ success: false, message: 'User ID and Address ID are required' });
  }

  try {
    // 删除地址
    await query('DELETE FROM address WHERE address_id = ? AND user_id = ?', [addressId, userId]);

    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
