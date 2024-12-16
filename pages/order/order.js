const app = getApp();

Page({
  data: {
    orders: [], // 订单列表
    text:{
      "publishing":"待接单",
      "overtime":"已超时",
      "completed":"已完成",
      "taked":"进行中",
      null:"未知状态"
    }
  },

  onLoad: function () {
    this.getOrders();
  },

  // 获取当前用户相关的订单
  getOrders: function () {
    const userId = app.globalData.userInfo.user_id;

    // 请求当前用户相关的所有订单
    wx.request({
      url: 'https://light-basically-fox.ngrok-free.app/getUserOrders',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
      },
      data: { userId },
      success: (res) => {
        if (res.data.success) {
          const orders = res.data.data;
          console.log(orders);
          // 格式化 deadline，并更新订单状态：检测超时
          this.updateOrderStatus(orders);
        } else {
          wx.showToast({
            title: res.data.message || '获取订单失败',
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

  // 更新订单状态
  updateOrderStatus: function (orders) {
    const currentTime = new Date();
    
    orders.forEach(order => {
      // 格式化 deadline
      order.deadline = this.formatDate(order.deadline);
      
      const deadline = new Date(order.deadline);
      if (currentTime > deadline && order.status !== 'completed') {
        order.status = 'overtime';  // 超时的订单
      }
    });

    this.setData({
      orders: orders,
    });
  },

  // 格式化时间
  formatDate: function (dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  },


});
