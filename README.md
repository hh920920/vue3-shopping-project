# shopping-api 《后端接口》使用koa2 + mysql + sequelize 开发

#　################《使用教程》：

# 一、下载依赖
``` 
npm install
```

# 二、在src/.env文件可修改端口、mysql地址等...
```
　APP_PORT（服务器启动端口）
  MYSQL_HOST（数据库连接地址）
  MYSQL_PORT（数据库端口）
  MYSQL_DB_NAME（数据库名称）
  MYSQL_USER（数据库连接账号）
  MYSQL_PASSWORD（数据库连接密码）
  
```

# 三、修改允许跨域  
  在src/app/index.js 文件里面可修改允许跨域访问地址

# 四、修改邮邮箱POP3/SMTP服务权码
  由于注册功能是以发送邮箱链接激活形式激活注册，需要有邮箱账号发送者的授权码（获取授权码方式具体百度）

# 五、安装redis
```
  之所以用redis存储起初是为了安全，不管前端哪个请求验证token，都从redis中拿出来对比，不一致则不允通过。

  redis 下载地址：https://wwwl.lanzouw.com/b03pvwjyf
  密码:felx

  redis可视化工具（看个人需求）下载地址：https://docs.redis.com/latest/ri/
```
# 五、运行项目：切换到src目录下，然后执行命令：
``` 
node main.js
```

