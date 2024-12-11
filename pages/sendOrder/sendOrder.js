Page({
  data: {
    name:null,
    phone_number:null,
    title: '', // 标题
    description: '', // 描述
    reward: '', // 奖励
    timeLimit: '', // 时间限制
    images: [], // 上传的图片列表
    paymentMethods: ["微信支付"], // 支付方式
    selectedPaymentMethod: "微信支付", // 默认支付方式
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

    // 验证必填字段
    if (!title || !description || !reward || !timeLimit) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'error',
        duration: 2000,
      });
      return;
    }

    // 发起 POST 请求到服务器
    wx.request({
      url: 'https://127.0.0.1：3000/create-order', // 替换为你的 ngrok 地址
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
