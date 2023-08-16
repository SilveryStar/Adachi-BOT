#!/bin/sh
set -e
# 设置文件所属的用户和用户组(排除数据库使用的database目录)
#find . -type d \( -path ./database -o -path ./qsign -o \) -prune -o -print | xargs chown adachi:adachi
find . \! -user adachi -exec chown adachi '{}' +

# 使用 gosu 切换到 adachi 用户启动 dumb-init
exec gosu adachi dumb-init -- "$@"