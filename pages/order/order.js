const app = getApp();

Page({
  data: {
    user_id: null, // 当前用户的ID
    receivedOrders: [], // 已接单列表
    postedOrders: [],   // 已发单列表
  },

  onLoad: function () {
    this.getUserOrders();
  },

  // 获取当前用户的订单（发单或接单）
  getUserOrders: function () {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.user_id) {
      wx.showToast({
        title: '请先登录',
        icon: 'error',
        duration: 2000,
      });
      return;
    }

    this.setData({
      user_id: userInfo.user_id
    });

    wx.request({
      url: 'https://above-cat-presumably.ngrok-free.app/getOrdersByUser', // 后端API地址
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
      },
      data: { user_id: this.data.user_id },
      success: (res) => {
        if (res.data.success) {
          const orders = res.data.data;
          const receivedOrders = [];
          const postedOrders = [];

          // 预处理订单状态文本、颜色和截止时间格式
          orders.forEach(order => {
            order.statusText = this.getStatusText(order.status);
            order.statusColor = this.getStatusColor(order.status);
            order.deadline = this.formatDateTime(order.deadline);

            if (order.runner_id === this.data.user_id) {
              receivedOrders.push(order);  // 接单
            } else if (order.requester_id === this.data.user_id) {
              postedOrders.push(order);    // 发单
            }
          });

          // 更新已接单和已发单列表
          this.setData({
            receivedOrders: this.sortOrders(receivedOrders),
            postedOrders: this.sortOrders(postedOrders),
          });

          this.updateOvertimeOrders(); // 检查超时状态
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
      }
    });
  },

  // 格式化时间：YYYY-MM-DD HH:MM:SS
  formatDateTime: function (dateTime) {
    if (!dateTime) return "无";

    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  },

  // 按时间排序，最新的排在前面
  sortOrders: function (orders) {
    return orders.sort((a, b) => new Date(b.deadline) - new Date(a.deadline));
  },

  // 更新超时订单状态
  updateOvertimeOrders: function () {
    const currentTime = new Date().getTime();
    const updatedReceivedOrders = this.data.receivedOrders.map(order => {
      if (new Date(order.deadline).getTime() < currentTime) {
        order.status = 'overtime';
        order.statusText = this.getStatusText('overtime');
        order.statusColor = this.getStatusColor('overtime');
      }
      return order;
    });

    const updatedPostedOrders = this.data.postedOrders.map(order => {
      if (new Date(order.deadline).getTime() < currentTime) {
        order.status = 'overtime';
        order.statusText = this.getStatusText('overtime');
        order.statusColor = this.getStatusColor('overtime');
      }
      return order;
    });

    this.setData({
      receivedOrders: updatedReceivedOrders,
      postedOrders: updatedPostedOrders,
    });
  },

  // 获取订单状态的显示文本
  getStatusText(status) {
    switch (status) {
      case 'publishing':
        return '待接单';
      case 'taked':
        return '进行中';
      case 'completed':
        return '已完成';
      case 'overtime':
        return '已超时';
      default:
        return '未知状态';
    }
  },

  // 获取订单状态的颜色
  getStatusColor(status) {
    switch (status) {
      case 'publishing':
        return '#A0A0A0'; // 灰色
      case 'taked':
        return '#FFD700'; // 黄色
      case 'completed':
        return '#32CD32'; // 绿色
      case 'overtime':
        return '#FF6347'; // 红色
      default:
        return '#A0A0A0'; // 默认灰色
    }
  }
});
