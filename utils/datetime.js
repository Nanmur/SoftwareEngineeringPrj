// 获取当前时间加上指定小时，返回格式化的 datetime 字符串
function addHoursToCurrentTime(hours) {
  // 获取当前时间
  const currentDate = new Date();
  console.log("现在的时间是：",currentDate);
  // 在当前时间基础上加上指定小时
  currentDate.setHours(currentDate.getHours() + hours);

  // 格式化为 datetime 格式 (YYYY-MM-DD HH:mm:ss)
  const formattedDateTime = formatDateTime(currentDate);

  return formattedDateTime;
}

// 格式化日期为 YYYY-MM-DD HH:mm:ss
function formatDateTime(date) {
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
