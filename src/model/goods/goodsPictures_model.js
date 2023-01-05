/**
 *  商品主图集合表
 */
 const { DataTypes } = require('sequelize')
 const seq = require('../../db/seqConnection')
 
 const GoodsPictures = seq.define('goods_pictures', {
     goods_id: {
         type: DataTypes.INTEGER,
         allowNull: false,
         comment: '商品id',
     },
     picture: {
         type: DataTypes.STRING,
         allowNull: false,
         comment: '商品图片地址',
     }
 },{
     // 默认情况下,Sequelize 使用数据类型 DataTypes.DATE 自动向每个模型添加 createdAt 和 updatedAt 字段. 这些字段会自动进行管理
     // 不想要就设置为 false
     timestamps: true // 时间戳
 }
 ) 
 
 // 强制同步数据库(创建数据表)  
 // GoodsPictures.sync({
 //     force: true //如果存在表，true 则新建
 // })
 
 
 module.exports = GoodsPictures