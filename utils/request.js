const baseUrl = 'https://light-basically-fox.ngrok-free.app'; //挂载的本地端口

function request(url, data, method = 'POST') {
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + url,
      method,
      data,
      header: { 'Content-Type': 'application/json' },
      success: (res) => resolve(res.data),
      fail: (err) => reject(err)
    });
  });
}

module.exports = request;
