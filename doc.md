### 前言

尝试在 esm 的环境下使用别名，无解

### 一句话总结

- tsconfig.json 中配置的别名仅对**类型导入**有效，若映射入代码运行时则需要第三方包

### 使用文件配置

ts-node 允许使用 在 tsconfig.json 中使用 `ts-node` 选项进行配置，避免执行过长的 cli 命令。

例如对于下面的 cli 命令：

```bash
ts-node --file --transpileOnly -r tsconfig-paths/register app.ts
```

可在 tsconfig.json 中进行配置：

```json
{
    "ts-node": {
        "transpileOnly": false,
        "files": true,
        "require": ["tsconfig-paths/register"]
    }
}
```

对应的，cli 命令可以做出一定程度的简化：

```bash
ts-node app.ts
```

> Tips：cli 命令的优先级高于配置文件中的配置

### 使用 ESM

默认情况下，ts-node 使用 CommonJS 语法，但可通过一些配置来使用最新的 ESM 加载器加载脚本。

使用以下任何一种方式来在 node 中使用 ESM 语法：

```bash
ts-node --esm
ts-node-esm
# tsconfig.json 中设置
"esm": true
node --experimental-loader ts-node/esm
NODE_OPTIONS="--loader ts-node/esm" node
```

同时，还需要在 package.json 中设置 `"type": "module"` 属性。

### --files

使用 `--files` 时，注意使用位置。

```bash
# wrong
ts-node-esm --project tsconfig.json --experimental-specifier-resolution=node app.ts --files
# true
ts-node-esm --files --project tsconfig.json --experimental-specifier-resolution=node app.ts
```

### --experimental-specifier-resolution

仅当使用 ESM 模式时，用于自定义扩展解析算法，解析不支持 CommonJS 加载器的所有默认行为，行为差异之一是文件扩展名的自动解析以及导入具有索引文件的目录的能力。

有两种模式：
- explicit: 需要向加载程序提供模块的完整路径（默认）
- node: 自动扩展解析并从包含索引文件的目录导入