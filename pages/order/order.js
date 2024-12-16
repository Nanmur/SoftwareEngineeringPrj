const app = getApp();

Page({
  data: {

    orders: [],
    myRequests: [],
    myTakes: [],
    text: {
      publishing: "待接单",
      overtime: "已超时",
      completed: "已完成",
      taked: "进行中",
      null: "未知状态",
    },
    showRequests: true,
    showTakes: true,
  },

  onLoad: function () {
    this.getOrders();
  },

  // 获取订单数据
  getOrders: function () {
    const userId = app.globalData.userInfo.user_id;

    wx.request({
      url: 'https://above-cat-presumably.ngrok-free.app/getUserOrders',
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
      complete: () => {
        wx.stopPullDownRefresh(); // 停止下拉刷新
      },
    });
  },

  // 处理订单数据
  processOrders: function (orders, userId) {
    const currentTime = new Date();

    orders.forEach((order) => {
      // 处理 deadline 显示
      order.deadlineDisplay = order.deadline
        ? this.formatDate(order.deadline)
        : "暂无";

      // 处理超时状态
      if (order.status === "publishing") {
        order.statusDisplay = "publishing"; // 待接单
      } else if (currentTime > new Date(order.deadline) && order.status !== "completed") {
        order.status = "overtime"; // 已超时
      }
    });

    // 分类订单
    const myRequests = orders.filter((order) => order.requester_id === userId);
    const myTakes = orders.filter((order) => order.runner_id === userId);

    // 按 deadline 降序排序
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
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  },

  // 下拉刷新触发
  onPullDownRefresh: function () {
    this.getOrders();
    wx.showToast({ title: "已刷新", icon: "success" });
  },

  // 切换折叠
  toggleRequests: function () {
    this.setData({ showRequests: !this.data.showRequests });
  },
  toggleTakes: function () {
    this.setData({ showTakes: !this.data.showTakes });
  },

});
