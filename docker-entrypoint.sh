#!/bin/sh
set -e

# 切换用户，运行指定的命令
chown -R $(id -u adachi):$(id -u adachi) .

# 使用 gosu 切换到 adachi 用户启动 dumb-init
exec gosu adachi dumb-init -- "$@"