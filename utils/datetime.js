// 获取当前时间加上指定小时，返回格式化的 datetime 字符串
function addHoursToCurrentTime(hours) {
  console.log("需要增加的小时数是：",hours);

  // 获取当前时间
  const currentDate = new Date();

  // console.log("现在的时间是：",currentDate);
  // 使用时间戳计算新时间，避免 `setHours` 的问题
  const newTime = new Date(currentDate.getTime() + hours * 60 * 60 * 1000);
  // console.log("计算后的新时间是：", newTime);

  // 格式化为 datetime 格式
  const formattedDateTime = formatDateTime(newTime);
  // console.log("格式化后的时间是：", formattedDateTime);

  return formattedDateTime;
}

// 格式化日期为 YYYY-MM-DD HH:mm:ss
function formatDateTime(date) {
  // console.log("待格式化的时间是：",date);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，需加 1
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 导出函数
module.exports = {
  addHoursToCurrentTime,
  formatDateTime,
};
