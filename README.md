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
interface PluginSetting {
    pluginName: string;
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
        saveTarget?: string; // 保存到本地的目标目录名
        overflowPrompt?: string; // 超出最大更新数量后给予的提示消息
    };
}
```

**renderer**

是否启用框架的 vue-router 前端路由服务，默认不启用。传入 `true` 或配置对象后开启。

| 属性名       | 说明                                                   | 类型       | 默认值          |
|-----------|------------------------------------------------------|----------|--------------|
| dirname   | 从插件目录下的第一级子文件中，指定插件渲染页面存放目录                          | string   | views        |
| mainFiles | 从指定 dirname 下的第一级子目录内，自动查找的 .vue 文件名称列表，将以左往右的顺序依次尝试 | string[] | \[ "index" ] |

### 公共 vue-router

前端渲染页已整合至一个公共 vite 项目，共享 vue-router 配置。通过 `PluginSetting.renderer` 配置项进行配置，框架将会从该目录下按一定的规则加载 route 配置。

加载规则：

1、对于 `.vue` 文件，直接按文件名加载路由。  
2、对于目录，按照配置项 `renderer -> mainFiles` 给出的列表，以从左到右的优先级在目录的第一级文件内查找并加载。例如对于配置项默认值 `[ "index" ]`，将会加载目录内的 `index.vue`。加载的路由路径将以**插件名称**即 `PluginSetting.pluginName` 起始。

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
        pluginName: "test-plugin",
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
> 需要注意的是，当你希望使用本地静态资源时，建议通过 `import.meta.url` 来获取静态资源路径。可以参考 `src/web-console/frontend/utils/pub-use.ts` 写法实现，或参考 [vite 官方文档](https://cn.vitejs.dev/guide/assets.html#importing-asset-as-url)。请避免使用 express 提供的静态资源服务加载资源，将会导致无法打包前端代码的严重问题。

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
        pluginName: "genshin",
        cfgList: [],
        server: {
            routers: serverRouters
        }
    }
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

### 注册插件配置文件

新增 `bot.config.register` 方法，该方法会自动创建配置文件，或与已存在的配置文件做深层对比来更新新增的配置项。

**返回值**

返回处理后的配置项对象，该对象支持自动重载，你无需做任何操作该对象即可自动响应 #refresh 指令进行数据重载更新。

**示例**

```ts
/* test-plugin 插件 */
export async function init( { file, config }: BOT ): Promise<PluginSetting> {
    // 创建 test-plugin.yml 配置文件 或是与已存在的 test-plugin.yml 进行对比，返回更新后的配置项内容
	const configData = config.register( "test-plugin", { setting1: true, setting2: false } );
    console.log( configData ); // { setting1: true, setting2: false }
}
```

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