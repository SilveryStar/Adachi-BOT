#!/bin/sh
set -e

# 切换用户前执行依赖安装操作，处理 pnpm 创建文件夹权限不够的问题
pnpm i -P --no-frozen-lockfile

find . \! -user adachi -exec test -e '{}' \; -exec chown adachi '{}' +

# 使用 gosu 切换到 adachi 用户启动 dumb-init
exec gosu adachi dumb-init -- "$@"