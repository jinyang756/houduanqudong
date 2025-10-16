#!/bin/bash

# 启动脚本 - 安装依赖并初始化系统
echo "开始安装依赖..."
npm install

if [ $? -eq 0 ]; then
    echo "依赖安装成功！"
    
    echo "正在初始化数据库..."
    node init-db.js
    
    if [ $? -eq 0 ]; then
        echo "数据库初始化成功！"
        echo "正在启动服务器..."
        npm start
    else
        echo "数据库初始化失败，请检查MySQL服务是否正常运行"
    fi
else
    echo "依赖安装失败，请检查网络连接"
fi