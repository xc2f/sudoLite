import { combineReducers } from 'redux'
import config from "./config";
import counter from './counter'

export default combineReducers({
  config,
  counter
})
