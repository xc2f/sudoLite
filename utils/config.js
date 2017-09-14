// export const degree = .3

export const degree = [
  {
    range: [0, 10],
    title: '胎教水平'
  }, {
    range: [11, 20],
    title: '托儿所水平'
  }, {
    range: [21, 30],
    title: '幼儿园水平'
  }, {
    range: [31, 40],
    title: '学前班水平'
  }, {
    range: [41, 50],
    title: '小学生水平'
  }, {
    range: [51, 60],
    title: '成人水平'
  }, {
    range: [61, 70],
    title: '学徒水平'
  }, {
    range: [71, 80],
    title: '高手水平'
  }, {
    range: [81, 90],
    title: '大侠水平'
  }, {
    range: [91, 100],
    title: '吹牛水平了得'
  },
]

export function adapterDegree(shadeDegree, returnType='title') {
  let setDegree = parseInt(shadeDegree * 100)
  let title, range
  degree.map(item => {
    if (setDegree >= item.range[0] && setDegree <= item.range[1]) {
      title = item.title
      range = item.range
      // 好像并不会跳过剩余的循环
      return
    }
  })
  if(returnType === 'range'){
    return range
  }
  return title
}