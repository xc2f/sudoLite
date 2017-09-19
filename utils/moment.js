export default function fromNow(date) {
  date = new Date(date)
  let time = (date.getHours()) + ':' + ((date.getMinutes() < 10) ? ('0' + date.getMinutes()) : (date.getMinutes()))
  let now = new Date()
  let interval = now.getTime() - date
  let oneMinute = 1000 * 60
  let oneHour = oneMinute * 60
  let oneDay = oneHour * 24
  if (now.getDate() === date.getDate()) {
    if (interval < oneMinute) {
      // return interval<1000 ? 0 + '秒前' : Math.floor(interval / 1000) + '秒前'
      return '刚刚'
    } else if (interval < oneHour) {
      return Math.floor(interval / oneMinute) + '分钟前'
    } else {
      return Math.floor(interval / oneHour) + '小时前'
    }
  } else if (now.getDate() === date.getDate() + 1) {
    return '昨天 ' + time
  } else if (now.getDate() === date.getDate() + 2) {
    return '前天 ' + time
  } else {
    return (date.getMonth() + 1) + '月' + date.getDate() + '日 ' + time
  }
}

export const computeTime = function (date) {
  let time = Math.round(date / 1000),
    m = Math.floor(time / 60),
    s = time % 60 < 10 ? '0' + time % 60 : time % 60
  return m + ':' + s
}

export const parseTime = function (date) {
  let time = new Date(date)
  let minutes = time.getMinutes()
  let seconds = time.getSeconds()
  let result = time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate() + ' ' + time.getHours() + ':' + (minutes < 10 ? ('0' + minutes) : minutes) + ':' + (seconds < 10 ? ('0' + seconds) : seconds)
  return result
}