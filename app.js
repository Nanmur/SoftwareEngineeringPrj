App({
  globalData: {
    userInfo: null // 初始化全局变量
  },

  onLaunch() {
    // 检查本地存储是否存在用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo; // 加载到全局变量
      console.log('加载到全局变量:', userInfo);

      // 可选：自动跳转到主页面
      wx.switchTab({
        url: '/pages/main/main'
      });
    }
  }
});