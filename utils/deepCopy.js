// 数组对象深拷贝
export default function deepCopy(source) {
  var sourceCopy = source instanceof Array ? [] : {};
  for (var item in source) {
    sourceCopy[item] = typeof source[item] === 'object' ? deepCopy(source[item]) : source[item];
  }
  return sourceCopy;
}