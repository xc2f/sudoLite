import {ComponentClass} from 'react'
import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {connect} from '@tarojs/redux'

@connect(({config}) => ({
  config
}), dispatch => ({}))

class About extends Component {

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '关于'
  }

  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    const {config: {menu = []}} = this.props
    console.log(menu)
    return (
      <View className='about'>
        About
      </View>
    )
  }
}

// #region 导出注意
//
// 经过上面的声明后需要将导出的 Taro.Component 子类修改为子类本身的 props 属性
// 这样在使用这个子类时 Ts 才不会提示缺少 JSX 类型参数错误
//
// #endregion

export default About as ComponentClass <PageOwnProps, PageState>
