Page({
  data: {
<<<<<<< HEAD
    nicname: null, // 用户名
    phone_number: null, // 手机号
    address: '', // 默认收货地址
    title: '', // 订单标题
    description: '', // 订单描述
    reward: '', // 报酬
=======
    name:null,
    phone_number:null,
    title: '', // 标题
    description: '', // 描述
    reward: '', // 奖励
>>>>>>> 97f0ac259dcb37a25d135b5a5362b53c8f49f8a0
    timeLimit: '', // 时间限制
    images: [], // 图片列表
    paymentMethods: ["微信支付"], // 支付方式
    selectedPaymentMethod: "微信支付", // 默认支付方式
  },

  onLoad: function () {
    this.getUserInfoAndAddress();
  },

  // 获取用户信息和默认地址
  getUserInfoAndAddress: function () {
    const userInfo = wx.getStorageSync('userInfo'); // 获取存储的用户信息

    if (!userInfo || !userInfo.user_id) {
      wx.showToast({
        title: '请先登录',
        icon: 'error',
        duration: 2000,
      });
      return;
    }

    // 设置用户基本信息
    this.setData({
      nicname: userInfo.account,
      phone_number: userInfo.phone,
    });

    // 请求默认地址
    wx.request({
      url: 'https://above-cat-presumably.ngrok-free.app/getDefaultAddress', // 替换为你的后端地址
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
      },
      data: { userId: userInfo.user_id }, // 使用 user_id 作为查询参数
      success: (res) => {
        if (res.data.success) {
          const { detail } = res.data.data;
          this.setData({
            address: detail,
          });
        } else {
          wx.showToast({
            title: res.data.message || '获取地址失败',
            icon: 'error',
            duration: 2000,
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '无法连接到服务器',
          icon: 'error',
          duration: 2000,
        });
      },
    });
  },

  // 选择图片
  chooseImage: function () {
    let that = this;
    wx.chooseImage({
      count: 1, // 最多选择 1 张图片
      sourceType: ["album", "camera"], // 图片来源
      success: function (res) {
        let newImages = that.data.images.concat(res.tempFilePaths); // 合并图片数组
        that.setData({
          images: newImages,
        });
      },
    });
  },

  // 切换支付方式
  onPaymentChange: function (e) {
    this.setData({
      selectedPaymentMethod: this.data.paymentMethods[e.detail.value],
    });
  },

  // 捕获输入框内容
  onInputChange: function (e) {
    const { field } = e.currentTarget.dataset; // 获取输入字段的标识符
    this.setData({
      [field]: e.detail.value,
    });
  },

  // 提交订单
  confirmOrder: function () {
    const { title, description, reward, timeLimit, images } = this.data;

    if (!title || !description || !reward || !timeLimit) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'error',
        duration: 2000,
      });
      return;
    }

    wx.request({
      url: 'https://above-cat-presumably.ngrok-free.app/create-order', // 替换为你的后端地址
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
      },
      data: {
        title,
        description,
        reward,
        timeLimit,
        images,
      },
      success: function (res) {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '订单提交成功',
            icon: 'success',
            duration: 2000,
          });
          wx.navigateBack(); // 返回上一页
        } else {
          wx.showToast({
            title: '订单提交失败',
            icon: 'error',
            duration: 2000,
          });
        }
      },
      fail: function () {
        wx.showToast({
          title: '无法连接到服务器',
          icon: 'error',
          duration: 2000,
        });
      },
    });
  },

  // 取消订单
  cancelOrder: function () {
    wx.navigateBack(); // 返回上一页
  },
});
