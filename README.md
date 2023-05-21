<div align="center">
    <img src="https://docs.adachi.top/images/adachi.png" width="200"/>
    <h3>- AdachiBOT -</h3>
    <div>
        <a href="https://docs.adachi.top" target="_blank">官方文档</a> &nbsp;|&nbsp;
        <a href="https://github.com/SilveryStar/Adachi-Plugin" target="_blank">插件库</a> &nbsp;|&nbsp;
        <a href="https://github.com/SilveryStar/Adachi-BOT/issues/146">关于频道</a>
    </div>
    <small>&gt; 原神Q群助手 &lt;</small>
    <div>
        <br/>
        <a href="https://github.com/SilveryStar/Adachi-BOT/issues/137">~ QQ频道上线 ~</a>
    </div>
</div>


# v2 to v3

## feature

### 新的插件配置项

```ts
type PluginParameter = {
    renderRegister: RenderRegister;
    configRegister: <T extends Record<string, any>>( initCfg: T, setValueCallBack?: ( config: T ) => T ) => T;
} & BOT;

type PluginHook = ( input: PluginParameter ) => void | Promise<void>;

interface PluginSetting {
    name: string;
    cfgList: cmd.ConfigType[];
    aliases?: string[];
    renderer?: boolean | {
        dirname?: string;
        mainFiles?: string[];
    };
    server?: {
    	routers?: Record<string, Router>
    };
    repo?: string | {
    	owner: string;// 仓库拥有者名称
    	repoName: string;// 仓库名称
    	ref?: string;// 分支名称
    }; // 设置为非必须兼容低版本插件
    assets?: string | { // 是否从线上同步更新静态资源
        manifestUrl: string; // 线上 manifest.yml 文件地址
        overflowPrompt?: string; // 超出最大更新数量后给予的提示消息
        replacePath?: ( path: string ) => string; // 修改下载后的文件路径
    };
    completed?: PluginHook; // 更新完毕后的回调函数
}
```

#### renderer

可选配置，是否启用框架的 vue-router 前端路由服务，默认不启用。传入 `true` 或配置对象后开启。

| 属性名       | 说明                                                   | 类型       | 默认值          |
|-----------|------------------------------------------------------|----------|--------------|
| dirname   | 从插件目录下的第一级子文件中，指定插件渲染页面存放目录                          | string   | views        |
| mainFiles | 从指定 dirname 下的第一级子目录内，自动查找的 .vue 文件名称列表，将以左往右的顺序依次尝试 | string[] | \[ "index" ] |

详情见 [公共 vue-router](#公共-vue-router)。

**server**

可选配置，通过 `server.routers` 向公共 express-server 注册插件自用路由。

详情见 [公共 express-server](#公共-express-server)。

**assets**

可选配置，是否启用框架自带的 oss 自动更新静态资源支持。传入**对象**或**指向 oss 清单文件的 url**来开启。

| 属性名            | 说明               | 类型                         | 默认值                 |
|----------------|------------------|----------------------------|---------------------|
| manifestUrl    | oss 线上清单文件文件 url | string                     | -                   |
| overflowPrompt | 超出最大更新数量后给予的提示消息 | string                     | 更新文件数量超过阈值，请手动更新资源包 |
| replacePath    | 修改下载后的文件路径       | ( path: string ) => string | -                   |

详情见 [自动更新插件静态资源](#自动更新插件静态资源)。

#### completed

将在插件加载生命周期的最后后执行，支持同步或异步方法，接受类型为 `PluginParameter` 的形参，包含 `BOT` 工具类与额外的配置项注册方法 `configRegister` 与渲染器注册方法 `renderRegister`。

### 公共 vue-router

前端渲染页已整合至一个公共 vite 项目，共享 vue-router 配置。通过 `PluginSetting.renderer` 配置项进行配置，框架将会从该目录下按一定的规则加载 route 配置。

加载规则：

1、对于 `.vue` 文件，直接按文件名加载路由。  
2、对于目录，按照配置项 `renderer -> mainFiles` 给出的列表，以从左到右的优先级在目录的第一级文件内查找并加载。例如对于配置项默认值 `[ "index" ]`，将会加载目录内的 `index.vue`。加载的路由路径将以**插件名称**即插件目录名称起始。

**示例**

存在如下目录结构：

```text
- test-plugin
  - views
    - main.vue
    - test
      - app.vue
      - index.vue
  - init.ts
```

test-plugin/init.ts：

```ts
export async function init( bot: BOT ): Promise<PluginSetting> {
    return {
        name: "test-plugin",
        cfgList: [],
        renderer: {
            dirname: "views"
        }
    }
}
```

加载后的路由结果为：

```ts
[
    {
        path: "/test-plugin/main",
        component: () => import("#/test-plugin/views/main.vue")
    },
    {
        path: "/test-plugin/test",
        component: () => import("#/test-plugin/views/test/index.vue")
    }
]
```

> 仅指定目录下的第一级 .vue 文件与第一级文件中存在 index.vue 的目录进行加载，不会对不符合加载条件的文件/目录进行处理。
> 需要注意的是，当你希望使用本地静态资源时，建议通过 **公共路径 public** 或 `import.meta.url` 来获取静态资源路径。可以参考 `src/web-console/frontend/utils/pub-use.ts` 写法实现，或参考 [vite 官方文档](https://cn.vitejs.dev/guide/assets.html#importing-asset-as-url)。请避免使用 express 提供的静态资源服务加载资源，将会导致无法打包前端代码的严重问题。

### 公共 express-server

框架现已集成一个公共 express-server，插件无需再自行监听端口开启，配置 `PluginSetting.server.routers`  即可使用公共 express-server。

**示例**

```ts
const serverRouters: Record<string, Router> = {
    "/api/info": express.Router().get( "/", async ( req, res ) => {
        res.send( true );
    } )
}

export async function init( bot: BOT ): Promise<PluginSetting> {
    return {
        name: "genshin",
        cfgList: [],
        server: {
            routers: serverRouters
        }
    }
}
```

### 自动更新插件静态资源

v3 中为插件提供了自动更新静态资源支持，该功能基于 oss 实现，可通过比对本地与线上的清单文件来进行插件静态资源的自动更新与下载。

你需要生成一个 `yaml` 格式清单文件的在线 url，并将其提供给 `PluginSetting.assets` 或 `PluginSetting.assets.manifestUrl` 来使用此功能，清单文件的生成可参考 [Node.js列举文件 listV2](https://help.aliyun.com/document_detail/111389.html) 来实现。

#### 下载地址

资源将会被下载至 `public/assets/插件根目录名` 下，可通过 `/assets/插件根目录名/xxx.png` 的方式获取资源。

#### 更新限制

为了防止用户恶意消下载耗流量，比对资源差异的服务存在**最大更新 200 个文件**的限制，若超出限制则会返回 415 报错。此时你可以通过配置 `PluginSetting.assets.overflowPrompt` 来提示用户做一些操作比如前往你提供的地址进行资源的整包下载。

#### 下载路径目录过多嵌套问题

oss 生成的清单文件可能存在路径多层嵌套的问题，下载时将会按路径依次嵌套目录。

如果你不希望出现过多的目录嵌套，可以配置 `PluginSetting.assets.replacePath` 来对路径进行处理，该配置项为一个方法，接受原路径为形参，返回处理后的路径。

下面的配置方式将会将路径 `Version3/genshin/artifact/冒险家/data.json` 重置为 `artifact/冒险家/data.json`。避免创建无用目录 `Version3`、 `genshin`。

```ts
export default definePlugin {
    assets: {
        manifestUrl: "https://xxx/";
        replacePath: path => {
            return path.replace( "Version3/genshin/", "" );
        }
    };
}
```

### 静态资源服务器

框架集成的公共 express-server 为插件目录注册了静态资源服务器，可通过 `localhost:port/插件目录名/资源路径` 访问。如果你不希望使用 vue 编写渲染页面，可通过此支持来使用类似 v2 的渲染方式。

同时，当你希望在前端页面中引入本地资源时，则可以利用静态资源服务器来进行访问。

**示例**

存在如下目录结构：

```text
- test-plugin
  - assets
    - test.png
```

你可以在代码中通过如下方式加载 `test.png`。

```css
.test {
    background: url("/test-plugin/assets/test.png");
}
```

> 如果你使用 vue 编写渲染页面，则不建议你使用此种方式加载静态资源。

### 注册插件配置文件

新增 `PluginSetting.config.register` 方法，该方法会自动创建配置文件，或与已存在的配置文件做深层对比来更新新增的配置项。

**类型**

```ts
interface BotConfigManager {
    register<T extends Record<string, any>>( filename: string, initCfg: T, setValueCallBack?: ( config: T ) => T, file?: FileManagement, refresh?: RefreshConfig );
}
```

**返回值**

返回处理后的配置项对象，通过自动推导传入的对象的来获得 ts 类型。该对象支持自动重载，你无需做任何操作该对象即可自动响应 `#refresh` 指令进行数据重载更新。

**示例**

```ts
import bot from "ROOT";

// 在 config 目录下创建 test-plugin.yml 配置文件 或是与已存在的 test-plugin.yml 进行对比，返回更新后的配置项内容
const configData = bot.config.register( "test-plugin", { setting1: true, setting2: false } );
console.log( configData ); // { setting1: true, setting2: false }
```

若你不满足于自动推导得来的类型，或是你希望来进行一些关于初始值的限制与操作，该方法还支持传入第三个参数。

其接受一个 `config` 形参，即传入的配置对象，返回由你自行处理过的配置对象。

```ts
interface MyConfig {
    setting1: "msg" | "card";
    setting2: boolean;
}

const configData = <MyConfig>bot.config.register( "test-plugin", { setting1: "msg", setting2: false }, config => {
    if ( !["msg", "card"].includes( config.setting1 ) ) config.setting1 = "msg";
    return config;
} );
```

当然我们还为插件提供了更方便的配置文件注册方法，你可以在插件的 `completed` 生命周期钩子中使用 `params.configRegister` 来快速创建以插件名（插件目录名）命名的配置文件。

该方法除了免去了提供第一个参数 `fileName` 外行为与 `bot.config.register` 一致。

```ts
/* test-plugin 插件 */
export default definePlugin( {
    completed( params ) {
        // 在 config 目录下创建 test-plugin.yml 配置文件
        const configData = params.configRegister( { setting1: true, setting2: false } );
        console.log( configData ); // { setting1: true, setting2: false }
    }
} );
```

### renderRegister

在 `completed` 生命周期钩子函数的参数中提供， `PluginSetting.renderer.register` 的插件便捷使用方式。

免去了提供第一个参数 `route`，自动以 `/插件名（插件目录名）` 作为基地址来注册渲染器。

### 通用工具 utils

在 `src/utils` 中新提供了一些常用工具类。

#### progress

该类用于创建一个单行进度条打印输出。

**食用方法**

```ts
import Progress from "@/utils/progress";

// 定义前缀内容、最大值与进度条最大长度
const total = 114;
const progress = new Progress( "下载进度", total, 50 );

// 遍历渲染递增进度
function downloading( completed: number = 0 ) {
    if ( completed > total ) return;
    progress.renderer( completed );
    completed++;
    setTimeout( () => {
        downloading( completed );
    }, 500 );
}

downloading();
```

```text
下载进度: ████████████████████████████████████████████░░░░░░  108/114
```

**new Progress()**

创建一个 Progress 实例

- 参数1：前方所展示的描述文字
- 参数2：进度条的最大值
- 参数3：进度条的长度

**progress.renderer()**

渲染输出进度内容。

- 参数1：当前进度条的值

#### request

通用 ajax 请求类 `request`，该类对 axios 进行了一定的封装，尽可能地保证优化使用的同时不对开发者进行过多的限制。

该类抛出了一个方法 `register`，方法接收两个参数：axios 配置对象 baseConfig 和 api 列表对象 apis。并返回封装好的请求对象 request 与 axios 服务对象 server。其类型定义如下：

```ts
export type FetchGetMethod = "get" | "delete";
export type FetchPostMethod = "post" | "put";
export type FetchMethod = FetchGetMethod | FetchPostMethod;

export type FetchUrlFormat = ( url: string ) => string | Record<string, any>;
export interface FetchRequest<T = AxiosResponse> {
	<D = any>( params?: D, config?: AxiosRequestConfig<D> ): Promise<T>;
	<D = any>( params?: D, urlFormat?: FetchUrlFormat, config?: AxiosRequestConfig<D> ): Promise<T>;
}
export type FetchServer<T extends string | number | symbol, D = AxiosResponse> = Record<T, Record<FetchMethod, FetchRequest<D>>>;

export interface RequestMethods {
	register<T extends Record<string, string>>( baseConfig: CreateAxiosDefaults, apis: T ): {
		request: FetchServer<keyof T>,
		server: AxiosInstance
	};
}
```

可以使用 `request.api键名.请求类型` 来获取 ajax 请求方法，方法共有三个参数：请求传递数据，重写请求 url 方法 和 axios 配置项。三个参数均可选。

- 参数1：当为 `get` 或 `delete` 请求时，对象将会作为查询参数以键值对形式拼接至 url 上，反之则作为 post 请求数据传递。
- 参数2：可选方法，不传递此参数时此位置将被参数3替代。该方法接受一个值为当前 url 的形参，允许的返回值为**对象**或**字符串**类型。
  - 对象：作为查询参数以键值对形式拼接至 url 上。
  - 字符串：以返回值作为真实的请求 url。
- 参数3：axios 配置对象，提供 baseUrl、header、timeout 等属性。

```ts
import { register } from "@/utils/request";

const apis = {
	GENSHIN_USER: "/genshin/uid/$/user",
	LOGIN: "/login",
	UPDATE_STATUS: "/update/status"
}

const { server, request: $https } = register( {
	baseURL: "https://114.514.19.19",
	headers: {
		"content-type": "application/json"
	},
	timeout: 60000
}, apis )

// https://114.514.19.19/genshin/uid/100375694/user
// POST
// data: {random: true}
// headers: "content-type": "application/json"
$https.GENSHIN_USER.post( { random: true }, url => url.replace( "$", "100375694" ) ).then( res => {
	if ( res.status === 200 ) {
		console.log( res.data );
	}
} )


// https://114.514.19.19/login?s=114514
// POST
// data: {username: AsukaMari}
// headers: "content-type": "application/json"
$https.LOGIN.post( { username: "AsukaMari" }, () => ( { s: 114514 } ) ).then( res => {
	if ( res.status === 200 ) {
		console.log( res.data );
	}
} )

// https://114.514.19.19/update/status
// POST
// data: null
// headers: "User-Agent": "Adachi-BOT"
$https.UPDATE_STATUS.post( {}, {
	headers: {
		"User-Agent": "Adachi-BOT"
	}
} ).then( res => {
	if ( res.status === 200 ) {
		console.log( res.data );
	}
} )
```

**自行设置请求返回值**

默认情况下，请求所得的返回值为 axios 默认返回值类型，包含 status、data 等属性。可通过 `register` 方法抛出的 `server` 对象来进行响应拦截设置。此时需要自行对 `request` 对象的类型进行定义。

```ts
import { FetchServer } from "@/utils/request";

const { server, request } = bot.request.register( {
	baseURL: "/api",
	responseType: "json",
	timeout: 60000,
	headers: {
		'Content-Type': 'application/json;charset=UTF-8'
	}
}, apis );

// 设置响应拦截
server.interceptors.response.use( resp => {
    return Promise.resolve( resp.data );
} );

// 重新定义 request 的类型
type FetchResponse<D = any> = {
    code: number;
    data: D;
    msg?: string;
    total?: number;
}

export default <FetchServer<keyof typeof apis, FetchResponse>><unknown>request;
```

定义类型后，请求所得的响应对象将会变为 `FetchResponse` 类型。

## brake change

### 插件配置结构变更

新版插件不再以 `init` 函数的方式配置插件配置项，改为默认导出一个变量的方式。你可以通过 `definePlugin` 宏函数进行一层包装，来获取完善的 ts 类型支持。
该宏函数已全局注入，无需导入即可使用。

```ts
// test-plugin/init.ts
export default definePlugin( {
    name: "测试插件",
    cfgList: [],
    completed() {
        // 插件行为
    }
} );
```

> 我们强烈推荐你在 `completed` 生命周期钩子函数中进行原来的插件的初始化行为。这样可以有效的避免一些加载顺序导致的变量未定义情况，例如其他文件在通过 `import bot from "ROOT"` 使用框架库时提示 `bot 未定义`。

### fileName 配置项变更

配置项 `fileName` 重命名为 `name`，仅用于加载插件的信息提示与 help 中的插件名称展示，可随你的喜好配置中文/英文。

### refresh 注册方法变更

合并 `refresh.registerRefreshableFunc` 与 `refresh.registerRefreshableFile` 为 `refresh.register`。

包含三种类型参数，`obj`、`file` 与 `func`，前两者对应 `refresh.registerRefreshableFunc` 与 `refresh.registerRefreshableFile` 的参数格式，`func` 则直接传入回调函数即可。

刷新函数类型变更，允许使用同步函数，不再强制要求返回 `string` 类型的值。

```ts
interface RefreshTargetFun {
    ( ...args: any[] ): Promise<string | void> | string | void;
}

interface RefreshTargetFile {
    [P: string]: any;
    refresh: RefreshTargetFun;
}

type RefreshTarget<T extends "fun" | "file"> = T extends "fun" ? RefreshTargetFun : RefreshTargetFile;

interface RefreshableMethod {
    register( fileName: string, target: RefreshTarget<"file">, place?: PresetPlace ): void;
    register( target: RefreshTarget<"file"> ): void;
    register( target: RefreshTarget<"fun"> ): void;
}
```

### renderer.asCqCode 方法名称变更

`renderer.asCqCode` 更名为 `renderer.asSegment`，调用方式不变;

### renderer.register 方法参数变更

不再需要传递 `name` 与 `port`（内部自动使用 `bot.config.renderPort`） 参数。

对于 `route` 参数，分为两种情况：

- 当使用框架集成的 vue-router 时，建议传递**插件名称**
- 当使用框架集成的静态资源服务器时，建议传递以 `plugins` 目录为基准的页面所在的目录路径，如 `/genshin/views`

### redis 类工具方法 ts 类型变更

`redis` 下的 `addSetMember`, `delSetMember` 方法输入类型由 `...value: any[]` 限制为 `...value: string[]`，`existSetMember` 方法由 `value: any` 限制为 `string`。

### 路径别名变更

`@` 与 `#` 后追加 `/`，防止语义不明。即 `@modules` 变为 `@/modules`，`#genshin` 变为 `#/genshin`。

### redis 所需版本升级

升级 `redis` 版本，至少为 `v4+`，windows 下载地址：https://github.com/tporadowski/redis/releases

### 前端页面本地静态资源引入路径变更

由于使用了 `vue-router`，相对路径不再准确，建议使用绝对路径，参考上文 **静态资源服务器**