const INITIAL_STATE = {
  menu: [
    {
      name: '首页',
      to: ''
    },
    {
      name: '统计',
      to: ''
    },
    {
      name: '设置',
      to: ''
    },
    {
      name: '关于',
      to: ''
    }
  ]
}

export default function counter (state = INITIAL_STATE, action) {
  return state
}
