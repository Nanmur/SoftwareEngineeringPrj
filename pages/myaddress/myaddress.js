Page({
  data: {
    mode: '', // 页面模式 ('select' 或 'manage')
    addressList: [], // 地址列表
    showModal: false, // 控制添加地址弹窗显示
    newAddressDetail: '', // 新地址详情
    isDefault: false, // 是否设为默认地址
  },

  onLoad: function (options) {
    const { mode } = options; // 获取传递的 mode 参数
    this.setData({ mode });
    this.loadAddressList();
  },

  // 加载地址列表
  loadAddressList: function () {
    const userInfo = wx.getStorageSync('userInfo'); // 获取用户信息
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'error',
        duration: 2000,
      });
      return;
    }

    wx.request({
      url: 'https://above-cat-presumably.ngrok-free.app/getAddresses', 
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
      },
      data: { userId: userInfo.user_id },
      success: (res) => {
        if (res.data.success) {
          this.setData({ addressList: res.data.data || [] });
        } else {
          wx.showToast({
            title: res.data.message || '获取地址失败',
            icon: 'error',
            duration: 2000,
          });
          this.setData({ addressList: [] });
        }
      },
      fail: () => {
        wx.showToast({
          title: '无法连接服务器',
          icon: 'error',
          duration: 2000,
        });
        this.setData({ addressList: [] });
      },
    });
  },

  // 显示添加地址弹窗
  showAddAddressModal: function () {
    console.log('显示添加地址弹窗');
    this.setData({ showModal: true });
  },

  // 隐藏添加地址弹窗并清空输入数据
  hideAddAddressModal: function () {
    this.setData({ showModal: false, newAddressDetail: '', isDefault: false });
  },

  // 处理输入框内容
  onInputChange: function (e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [field]: e.detail.value });
  },

  // 处理默认地址选择
  onDefaultChange: function (e) {
    this.setData({ isDefault: e.detail.value.length > 0 });
  },

  // 确认添加地址
  confirmAddAddress: function () {
    const { newAddressDetail, isDefault } = this.data;
    const userInfo = wx.getStorageSync('userInfo');

    if (!newAddressDetail) {
      wx.showToast({
        title: '请填写地址详情',
        icon: 'error',
        duration: 2000,
      });
      return;
    }

    wx.request({
      url: 'https://above-cat-presumably.ngrok-free.app/addAddress',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
      },
      data: {
        userId: userInfo.user_id,
        detail: newAddressDetail,
        isDefault,
      },
      success: (res) => {
        if (res.data.success) {
          wx.showToast({ title: '地址添加成功', icon: 'success', duration: 2000 });
          this.hideAddAddressModal();
          this.loadAddressList(); // 刷新地址列表
        } else {
          wx.showToast({ title: res.data.message || '添加失败', icon: 'error', duration: 2000 });
        }
      },
      fail: () => {
        wx.showToast({
          title: '无法连接服务器',
          icon: 'error',
          duration: 2000,
        });
      },
    });
  },

  // 设置默认地址
  setDefault: function (e) {
    const addressId = e.currentTarget.dataset.id;
    const userInfo = wx.getStorageSync('userInfo');

    wx.request({
      url: 'https://above-cat-presumably.ngrok-free.app/setDefaultAddress',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
      },
      data: {
        userId: userInfo.user_id,
        addressId,
      },
      success: (res) => {
        if (res.data.success) {
          wx.showToast({ title: '默认地址设置成功', icon: 'success', duration: 2000 });
          this.loadAddressList(); // 刷新地址列表
        } else {
          wx.showToast({ title: res.data.message || '设置失败', icon: 'error', duration: 2000 });
        }
      },
      fail: () => {
        wx.showToast({
          title: '无法连接服务器',
          icon: 'error',
          duration: 2000,
        });
      },
    });
  },
});
