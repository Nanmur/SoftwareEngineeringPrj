Page({
  data: {
    orders: [], // 订单列表
  },

  onLoad: function () {
    this.getPublishingOrders();
  },

  // 获取所有status为publishing的订单
  getPublishingOrders: function () {
    const userInfo = wx.getStorageSync('userInfo'); // 获取存储的用户信息

    if (!userInfo || !userInfo.user_id) {
      wx.showToast({
        title: '请先登录',
        icon: 'error',
        duration: 2000,
      });
      return;
    }

    wx.request({
      url: 'https://above-cat-presumably.ngrok-free.app/getPublishingOrders', // 替换为你的后端地址
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
      },
      data: { userId: userInfo.user_id },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            orders: res.data.data, // 更新订单列表
          });
        } else {
          wx.showToast({
            title: '获取订单失败',
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

  // 接单处理
  takeOrder: function (e) {
    const orderId = e.currentTarget.dataset.orderId; // 获取订单ID
    const index = e.currentTarget.dataset.index; // 获取订单索引
    const userInfo = wx.getStorageSync('userInfo'); // 获取存储的用户信息

    if (!userInfo || !userInfo.user_id) {
      wx.showToast({
        title: '请先登录',
        icon: 'error',
        duration: 2000,
      });
      return;
    }

    const userId = userInfo.user_id; // 接单人ID
    const timelimit = this.data.orders[index].timelimit; // 获取订单时限

    // 发送请求到后端接单
    wx.request({
      url: 'https://above-cat-presumably.ngrok-free.app/takeOrder', // 替换为你的后端地址
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
      },
      data: {
        user_id: userId,
        order_id: orderId,
        timelimit: timelimit, // 传递时限
      },
      success: (res) => {
        if (res.data.success) {
          wx.showToast({
            title: '接单成功',
            icon: 'success',
            duration: 2000,
          });

          // 更新本地订单状态
          const updatedOrders = this.data.orders.filter(order => order.order_id !== orderId);
          this.setData({
            orders: updatedOrders, // 移除已接的订单
          });
        } else {
          wx.showToast({
            title: '接单失败',
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
});
