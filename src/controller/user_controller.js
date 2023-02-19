const {
    createUser,
    findUser,
    updateName,
    updateSex,
    updateBirthday,
    updatePassword,
    getSysMessage,
    addUserCollect,
    findUserCollect,
    addCart,
    getCartList
} = require('../service/user_service')

const { userRegisterError, updateError, addCollectError, addCartError } = require('../constant/err.type')

const jwt_decode = require('jwt-decode')

const { JWT_SECRET } = require('../config/config_default')

const sendEmail = require('../utils/email')

const jwt = require('jsonwebtoken')

const {
    setString,
    getString
} = require('../utils/redis-client')

class UserController {
    // 注册
    async register(ctx, next) {
        const {
            email,
            user_name,
            password
        } = ctx.request.body

        // // 注册激活的token
        const activateToken = jwt.sign({ email: email }, JWT_SECRET, {
            // expiresIn: 以秒或描述时间跨度zeit/ms的字符串表示。 例如：60, "2 days", "10h", "7d".
            // 数值被解释为秒数。如果您使用字符串，请确保提供时间单位（天、小时等），否则默认使用毫秒单位（"120"等于"120ms"）
            expiresIn: '2h'
        })
        // 邮箱激活链接模板
        const mail = {
            // 发件人
            from: '1414287034@qq.com',
            // 主题
            subject: '小熊猫注册激活验证',
            // 收件人
            to: email,
            // 邮件内容，HTML格式
            text: `尊敬的${user_name}，您好！点击链接即可激活您的账号,<a href='http://localhost:3000/user/activate?activateToken=${activateToken}'>立即激活</a> <br/>请在2小时内激活，您也可以将链接：http://localhost:3000/user/activate?activateToken=${activateToken}<br/>复制到浏览器地址栏访问。` //接收激活请求的链接
        }

        try {
            // 把用户信息存进数据库表
            const res = await createUser(email, user_name, password)
            if (res) {
                // 发送邮件
                sendEmail(mail)
                ctx.body = {
                    code: 0,
                    message: '注册成功，我们已经向您的邮箱发送一封激活邮件，激活后才能登录'
                }
            }

        } catch (err) {
            console.error(err)
            ctx.body = userRegisterError
        }
    }

    // 登录
    async login(ctx, next) {
        const { email, password } = ctx.request.body
        // 获取用户信息（在token的playlaod中，记录id,user_name,is_admin)
        try {
            // 从返回结果对象中 解构password，将剩余对象放进 res中   相当于剔除掉password
            const { dataValues } = await findUser(email)
            const { password, ...res } = dataValues

            // 生成双token    (refresh_token 比 access_token 时间要长）
            const access_token = jwt.sign(res, JWT_SECRET, {
                // expiresIn: 以秒或描述时间跨度zeit/ms的字符串表示。 例如：60, "2 days", "10h", "7d".
                // 数值被解释为秒数。如果您使用字符串，请确保提供时间单位（天、小时等），否则默认使用毫秒单位（"120"等于"120ms"）
                expiresIn: '4h'
            })
            const refresh_token = jwt.sign(res, JWT_SECRET, {
                expiresIn: '8h'
            })

            // 存入redis
            await setString(email + '_access_token', access_token, 14400).then(res => {
                console.log('access_token存入：' + res)
            })
            await setString(email + '_refresh_token', refresh_token, 28800).then(res => {
                console.log('refresh_token存入：' + res)
            })
            ctx.body = {
                code: 0,
                message: '登录成功',
                data: {
                    user_id: dataValues.id,
                    user_name: dataValues.user_name,
                    user_email: dataValues.user_email,
                    picture: dataValues.picture,
                    vipGrade: dataValues.vipGrade,
                    sex: dataValues.sex,
                    birthday: dataValues.birthday,
                    access_token,
                    refresh_token
                },
            }
        } catch (error) {
            console.error('用户登录失败', error)
        }
    }

    // 刷新token
    async refreshToken(ctx, next) {
        // 解析信息
        const {
            authorization = ''
        } = ctx.request.header
        let token = authorization.replace('Bearer ', '')
        const user = jwt_decode(token)
        const email = user.user_email
        // 去对比redis中的refresh_token 判断前端传来的是不是refresh_token
        let refreshToken = ''
        await getString(user.user_email + '_refresh_token').then(res => {
            refreshToken = res
        })
        // 如果 refreshToken = null，则提示返回给前端需要刷新双token
        if (token === refreshToken) {
            // 需要刷新token
            try {
                // 从返回结果对象中 解构password，将剩余对象放进 res中   相当于剔除掉password
                const { dataValues } = await findUser(email)
                const { password, ...res } = dataValues

                // 生成双token    (refresh_token 比 access_token 时间要长）
                const access_token = jwt.sign(res, JWT_SECRET, {
                    // expiresIn: 以秒或描述时间跨度zeit/ms的字符串表示。 例如：60, "2 days", "10h", "7d".
                    // 数值被解释为秒数。如果您使用字符串，请确保提供时间单位（天、小时等），否则默认使用毫秒单位（"120"等于"120ms"）
                    expiresIn: '4h'
                })
                const refresh_token = jwt.sign(res, JWT_SECRET, {
                    expiresIn: '8h'
                })

                // 存入redis
                await setString(email + '_access_token', access_token, 14400).then(res => {
                    console.log('access_token存入：' + res)
                })
                await setString(email + '_refresh_token', refresh_token, 28800).then(res => {
                    console.log('refresh_token存入：' + res)
                })
                ctx.body = {
                    code: 0,
                    message: '刷新token成功',
                    data: {
                        user_id: dataValues.id,
                        user_name: dataValues.user_name,
                        user_email: dataValues.user_email,
                        picture: dataValues.picture,
                        vipGrade: dataValues.vipGrade,
                        access_token,
                        refresh_token
                    },
                }
            } catch (error) {
                console.error('刷新token失败', error)
            }
        } else {
            ctx.status = 301
        }
    }

    // 获取用户信息
    async getUserInfo(ctx, next) {
        // 解析信息
        const {
            authorization = ''
        } = ctx.request.header
        let token = authorization.replace('Bearer ', '')
        const user = jwt_decode(token)
        const email = user.user_email
        const res = await findUser(email)
        ctx.body = {
            code: 0,
            message: 'success',
            data: res
        }
    }

    // 修改用户名
    async updateName(ctx, next) {
        // 解析信息
        const {
            authorization = ''
        } = ctx.request.header
        const token = authorization.replace('Bearer ', '')
        const { user_name } = ctx.request.body
        const user = jwt_decode(token)
        const email = user.user_email
        try {
            const res = await updateName(email, user_name)
            if (res) {
                ctx.body = {
                    code: 0,
                    message: '用户名修改成功'
                }
            }
        } catch (error) {
            console.error(error)
            ctx.body = updateError
        }
    }

    // 修改用户性别
    async updateSex(ctx, next) {
        // 解析信息
        const {
            authorization = ''
        } = ctx.request.header
        const token = authorization.replace('Bearer ', '')
        const { sex } = ctx.request.body
        const user = jwt_decode(token)
        const email = user.user_email
        try {
            console.log(sex);
            const res = await updateSex(email, sex)
            if (res) {
                ctx.body = {
                    code: 0,
                    message: '用户性别修改成功'
                }
            }
        } catch (error) {
            console.error(error)
            ctx.body = updateError
        }
    }

    // 修改用户生日
    async updateBirthday(ctx, next) {
        // 解析信息
        const {
            authorization = ''
        } = ctx.request.header
        const token = authorization.replace('Bearer ', '')
        const { birthday } = ctx.request.body
        const user = jwt_decode(token)
        const email = user.user_email
        try {
            const res = await updateBirthday(email, birthday)
            if (res) {
                ctx.body = {
                    code: 0,
                    message: '用户生日修改成功'
                }
            }
        } catch (error) {
            console.error(error)
            ctx.body = updateError
        }
    }

    // 修改用户密码
    async updatePassword(ctx, next) {
        // 解析信息
        const {
            authorization = ''
        } = ctx.request.header
        const token = authorization.replace('Bearer ', '')
        const { password } = ctx.request.body
        const user = jwt_decode(token)
        const email = user.user_email
        try {
            const res = await updatePassword(email, password)
            if (res) {
                ctx.body = {
                    code: 0,
                    message: '密码修改成功'
                }
                //
            }
        } catch (error) {
            console.error(error)
            ctx.body = updateError
        }
    }

    // 获取系统消息通知
    async getSysMessage(ctx, next) {
        try {
            const res = await getSysMessage()
            if (res) {
                ctx.body = {
                    code: 0,
                    message: 'success',
                    data: res
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    // 添加收藏商品
    async addUserCollect(ctx, next) {
        // 解析信息
        const {
            authorization = ''
        } = ctx.request.header
        const token = authorization.replace('Bearer ', '')
        const user = jwt_decode(token)
        const { goods_id } = ctx.request.body
        const email = user.user_email
        try {
            // console.log();
            const res = await addUserCollect(email, goods_id)
            if (res !== null) {
                ctx.body = {
                    code: 0,
                    message: '添加收藏成功',
                    data: res
                }
            } else {
                ctx.body = addCollectError
            }
        } catch (error) {
            console.error(error)
        }
    }

    // 获取用户收藏商品列表
    async getUserCollect(ctx, next) {
        // 解析信息
        const {
            authorization = ''
        } = ctx.request.header
        const token = authorization.replace('Bearer ', '')
        const user = jwt_decode(token)
        const email = user.user_email
        try {
            const res = await findUserCollect(email)
            if (res) {
                ctx.body = {
                    code: 0,
                    message: 'success',
                    data: res
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    // 添加购物车
    async addUserCar(ctx, next) {
        const { goods_id, sku_id, goods_name, picture, price, count } = ctx.request.body
         // 解析信息
         const {
            authorization = ''
        } = ctx.request.header
        const token = authorization.replace('Bearer ', '')
        const user = jwt_decode(token)
        const email = user.user_email
        try {
            const res = await addCart(email,parseInt(goods_id), sku_id, goods_name, picture, price, parseInt(count))
            if (res) {
                ctx.body = {
                    code: 0,
                    message: '成功加入购物车',
                    data: res
                }
            }
        } catch (error) {
            console.error(error)
            ctx.body = addCartError
        }
    }

    // 获取用户购物车列表
    async getUserCartList(ctx, next) {
        const { goods_id, sku_id, goods_name, picture, price, count } = ctx.request.body
        // 解析信息
        const {
           authorization = ''
       } = ctx.request.header
       const token = authorization.replace('Bearer ', '')
       const user = jwt_decode(token)
       const email = user.user_email
       try {
           const res = await getCartList(email)
           if (res) {
               ctx.body = {
                   code: 0,
                   message: 'success',
                   data: res
               }
           }
       } catch (error) {
           console.error(error)
       }
    }

}
// 类不能直接导出，所以转化为导出实例化对象
module.exports = new UserController()