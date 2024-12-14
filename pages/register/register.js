// const request = require('../../utils/request.js');
const baseUrl = 'https://above-cat-presumably.ngrok-free.app'; //挂载的本地端口

function request(url, data, method = 'POST') {
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + url,
      method,
      data,
      header: { 'Content-Type': 'application/json' },
      success: (res) => resolve(res.data),
      fail: (err) => reject(err)
    });
  });
}
Page({
  data: {
    account: '',
    password: '',
    phone: ''
  },

  onAccountInput(e) {
    this.setData({ account: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  async onRegister() {
    const { account, password, phone } = this.data;

    if (!account || !password || !phone) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    try {
      const response = await request('/register', { account, password, phone });
      if (response.success) {
        wx.showToast({ title: '注册成功，请登录', icon: 'success' });
        wx.redirectTo({ url: '/pages/login/login' });
      } else {
        wx.showToast({ title: response.message, icon: 'none' });
      }
    } catch (error) {
      wx.showToast({ title: '注册失败', icon: 'none' });
    }
  }
});