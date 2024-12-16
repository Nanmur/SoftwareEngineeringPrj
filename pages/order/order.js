const app = getApp();

Page({
  data: {
    orders: [], // 所有订单
    myRequests: [], // 我的发单
    myTakes: [], // 我的接单
    text: {
      publishing: "待接单",
      overtime: "已超时",
      completed: "已完成",
      taked: "进行中",
      null: "未知状态",
    },
    showRequests: true, // 控制“我的发单”是否展开
    showTakes: true, // 控制“我的接单”是否展开
  },

  onLoad: function () {
    this.getOrders(); // 页面加载时自动刷新订单状态
  },

  // 获取订单数据
  getOrders: function () {
    wx.showLoading({ title: "加载中..." });
    const userId = app.globalData.userInfo.user_id;

    wx.request({
      url: 'https://light-basically-fox.ngrok-free.app/getUserOrders',
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: { userId },
      success: (res) => {
        if (res.data.success) {
          const orders = res.data.data;
          this.processOrders(orders, userId);
        } else {
          wx.showToast({
            title: res.data.message || '获取订单失败',
            icon: 'error',
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '无法连接到服务器',
          icon: 'error',
        });
      },
      complete: () => wx.hideLoading(),
    });
  },

  // 处理订单：格式化、分类、排序
  processOrders: function (orders, userId) {
    const currentTime = new Date();

    orders.forEach((order) => {
      // 处理 deadline 显示：如果为 null，则显示“暂无”
      if (!order.deadline) {
        order.deadlineDisplay = "暂无";
      } else {
        order.deadline = this.formatDate(order.deadline);
        order.deadlineDisplay = order.deadline;
      }

      // 判断超时状态，仅对非 publishing 订单处理
      const deadlineTime = new Date(order.deadline);
      if (order.status === "publishing") {
        order.statusDisplay = "publishing"; // 待接单，灰色
      } else if (currentTime > deadlineTime && order.status !== "completed") {
        order.status = "overtime";
      }
    });

    // 分类订单
    const myRequests = orders.filter((order) => order.requester_id === userId);
    const myTakes = orders.filter((order) => order.runner_id === userId);

    // 根据 deadline 降序排序
    myRequests.sort((a, b) => new Date(b.deadline) - new Date(a.deadline));
    myTakes.sort((a, b) => new Date(b.deadline) - new Date(a.deadline));

    this.setData({
      myRequests,
      myTakes,
    });
  },

  // 格式化时间
  formatDate: function (dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  },

  // 切换折叠显示
  toggleRequests: function () {
    this.setData({ showRequests: !this.data.showRequests });
  },
  toggleTakes: function () {
    this.setData({ showTakes: !this.data.showTakes });
  },

  // 刷新订单
  refreshOrders: function () {
    wx.showLoading({ title: "刷新中..." });
    this.getOrders();
    wx.showToast({ title: "已刷新", icon: "success" });
  },
});
