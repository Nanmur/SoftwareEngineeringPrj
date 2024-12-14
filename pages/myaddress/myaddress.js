Page({
  data: {
    mode: '', // 页面模式 ('select' 或 'manage')
    addressList: [], // 地址列表
    showModal: false, // 控制添加地址弹窗显示
    newAddressDetail: '', // 新地址详情
    isDefault: true, // 是否设为默认地址
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
      url: 'https://above-cat-presumably.ngrok-free.app/getAddresses', // 替换为ngrok地址
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

  // 选择地址
  selectAddress: function (e) {
    const selectedAddress = e.currentTarget.dataset.item; // 获取点击的地址对象
    const pages = getCurrentPages(); // 获取当前页面栈
    const prevPage = pages[pages.length - 2]; // 获取上一页
    // 通过页面栈传值，返回选中的地址
    prevPage.setData({
      address: selectedAddress.detail,
      selectedAddressId: selectedAddress.address_id, 
    });
    console.log(selectedAddress.address_id);
    // 返回上一页
    wx.navigateBack();
  },

  // 显示添加地址弹窗
  showAddAddressModal: function () {
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
      url: 'https://above-cat-presumably.ngrok-free.app/addAddress', // 替换为ngrok地址
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
          this.loadAddressList(); // 刷新地址列表
          this.hideAddAddressModal(); // 隐藏弹窗
        } else {
          wx.showToast({ title: res.data.message || '添加失败', icon: 'error', duration: 2000 });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '无法连接服务器',
          icon: 'error',
          duration: 2000,
        });
      },
    });
  },

  setDefault: function (e) {
    const addressId = e.currentTarget.dataset.id;
    const userInfo = wx.getStorageSync('userInfo');

    wx.request({
      url: 'https://above-cat-presumably.ngrok-free.app/setDefaultAddress', // 替换为ngrok地址
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
      fail: (err) => {
        wx.showToast({
          title: '无法连接服务器',
          icon: 'error',
          duration: 2000,
        });
      },
    });
  },

  deleteAddress: function (e) {
    const addressId = e.currentTarget.dataset.id;
    const userInfo = wx.getStorageSync('userInfo');

    wx.request({
      url: 'https://above-cat-presumably.ngrok-free.app/deleteAddress', // 替换为ngrok地址
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
          wx.showToast({ title: '地址删除成功', icon: 'success', duration: 2000 });
          this.loadAddressList(); // 刷新地址列表
        } else {
          wx.showToast({ title: res.data.message || '删除失败', icon: 'error', duration: 2000 });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '无法连接服务器',
          icon: 'error',
          duration: 2000,
        });
      },
    });
  },
})
