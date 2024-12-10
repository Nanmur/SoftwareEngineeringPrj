// 引用全局 app 实例
const app = getApp();

// 请求函数，模拟发起后端请求
async function request(url, data) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `https://above-cat-presumably.ngrok-free.app${url}`,
      method: 'POST',
      data: data,
      header: { 'Content-Type': 'application/json' },
      success: (res) => resolve(res.data),
      fail: (err) => reject(err)
    });
  });
}

Page({
  data: {
    account: '',
    password: ''
  },

  // 输入处理
  onAccountInput(e) {
    this.setData({ account: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  // 登录逻辑
  async onLogin() {
    const { account, password } = this.data;
    if (!account || !password) {
      wx.showToast({ title: '请填写必要信息', icon: 'none' });
      return;
    }

    try {
      const response = await request('/login', { account, password });
      if (response.success) {
        // 存储用户信息到全局变量和本地存储
        const userInfo = response.data.data; // 假设后端返回的用户信息在 data 中
        app.globalData.userInfo = userInfo; // 保存到全局变量
        wx.setStorageSync('userInfo', userInfo); // 保存到本地存储

        wx.showToast({ title: '登录成功', icon: 'success' });
        wx.switchTab({ url: '/pages/main/main' }); // 登录后跳转到首页
      } else {
        wx.showToast({ title: response.message, icon: 'none' });
      }
    } catch (error) {
      wx.showToast({ title: '登录失败', icon: 'none' });
    }
  },

  // 跳转到注册页面
  goToRegister() {
    wx.navigateTo({ url: '/pages/register/register' });
  }
});
