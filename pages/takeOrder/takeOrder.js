// 获取全局实例
const app = getApp();

function request(url, data = {}, method = 'GET') {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `https://light-basically-fox.ngrok-free.app${url}`,
      method: method,
      data: data,
      header: { 'Content-Type': 'application/json' },
      success: (res) => resolve(res.data),
      fail: (err) => reject(err)
    });
  });
}

Page({
  data: {
    orders: []
  },

  onLoad() {
    this.loadOrders();
  },

  async loadOrders() {
    try {
      const response = await request('/orders?region_id=1&status=available');
      if (response.success) {
        // 若无订单，response.data 为空数组或未定义，可确保最终 orders 为空数组
        this.setData({ orders: response.data || [] });
      } else {
        // 即使出现非success情况，也让订单为空，从而显示提示
        this.setData({ orders: [] });
      }
    } catch (error) {
      // 网络错误时也显示空列表和提示
      this.setData({ orders: [] });
    }
  },

  async onTakeOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    const that = this;
    wx.showModal({
      title: '确认接单',
      content: '确定要接这个单吗？',
      success: async (res) => {
        if (res.confirm) {
          const userInfo = app.globalData.userInfo;
          if (!userInfo || !userInfo.user_id) {
            wx.showToast({ title: '请先登录', icon: 'none' });
            return;
          }

          try {
            const takeRes = await request('/takeOrder', { 
              order_id: orderId, 
              runner_id: userInfo.user_id 
            }, 'POST');

            if (takeRes.success) {
              wx.showToast({ title: '接单成功', icon: 'success' });
              that.loadOrders();
            } else {
              wx.showToast({ title: takeRes.message || '接单失败', icon: 'none' });
            }
          } catch (error) {
            wx.showToast({ title: '网络错误', icon: 'none' });
          }
        }
      }
    });
  }
});
