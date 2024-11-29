const request = require('../../utils/request.js');

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