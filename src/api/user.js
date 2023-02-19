import request from '@/utils/request'

/**
 * 邮箱帐号注册
 * @param {String} email     - 用户邮箱
 * @param {String} user_name - 用户邮箱
 * @param {String} password  - 密码
 * @returns Promise
 */
export const userEmailRegister = ({ email, user_name, password }) => {
  return request('/user/register', 'post', { email, user_name, password })
}

/**
 * 邮箱帐号登录
 * @param {String} email     - 用户邮箱
 * @param {String} password  - 密码
 * @returns Promise
 */
 export const userEmailLogin = ({ email, password }) => {
  return request('/user/login', 'post', { email, password })
}

/**
 * 添加收藏列表
 */
 export const addUserCollect = ({ goods_id }) => {
  return request('/user/collect', 'post', { goods_id })
}

/**
 * 获取收藏列表
 */
 export const getUserCollect = () => {
  return request('/user/collect', 'get')
}

/**
 * 获取手机号的短信验证码
 * @param {String} mobile - 手机号
 * @returns promise
 */
 export const userMobileLoginMsg = (mobile) => {
  return request('/user/login/code', 'get', { mobile })
}
