Page({
  data: {
    orderId: null,
    type: '',
    order: null,
    text: {
      publishing: '待接单',
      overtime: '已超时',
      completed: '已完成',
      taked: '进行中',
      null: '异常状态'
    }
  },

  onLoad: function (options) {
    this.setData({
      orderId: options.orderId,
      type: options.type
    });
    this.getOrderDetail();
  },

  // 获取订单详情
  getOrderDetail: function () {
    wx.request({
      url: 'https://above-cat-presumably.ngrok-free.app/getOrderDetail',
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: { orderId: this.data.orderId },
      success: (res) => {
        if (res.data.success) {
          const order = res.data.data;

          // 格式化时间
          order.deadline = this.formatToReadableTime(order.deadline);

          this.setData({
            order
          });
        } else {
          wx.showToast({ title: '获取订单失败', icon: 'error' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'error' });
      }
    });
  },

  // 时间格式化函数
  formatToReadableTime: function (dateStr) {
    if (!dateStr) return '暂无';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  }
});
