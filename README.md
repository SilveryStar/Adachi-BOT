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

# 更新内容

- 指令 `#refresh` 现允许对所有配置项进行刷新
- 帮助列表中限制最多展示两个指令头，`#detail` 指令可用于查看全部指令头
- 新增插件热重载指令 `#reload`
- #help 现在将展示权限内的全部指令，使用符号来标记指令的使用场景
- `config.header` 指令头现允许配置多个，且允许配置正则相关符号
- `command.yml` 中新增优先级配置项 `priority`。对相同触发条件指令根据优先级大小决定应触发的目标
- 通讯底层协议由 `icqq` 改为 `go-cqhttp`
- 由于改为 `go-cqhttp` 后不再需要 bot qq与密码配置，控制台改为在初次进入时进入创建 root 账号页面

# v2 to v3

## feature

### 新的插件配置项

```ts
export type PluginHook = ( input: PluginParameter ) => void | Promise<void>;

type SubUser = {
    person?: number[];
    group?: number[];
};

export interface PluginSetting {
    name: string;
    cfgList: cmd.ConfigType[];
    aliases?: string[];
    renderer?: boolean | {
        dirname?: string;
        mainFiles?: string[];
    };
    server?: {
        routers?: Record<string, Router>;
    };
    repo?: string | {
        owner: string;// 仓库拥有者名称
        repoName: string;// 仓库名称
        ref?: string;// 分支名称
    }; // 设置为非必须兼容低版本插件
    assets?: string | { // 是否从线上同步更新静态资源
        manifestUrl: string; // 线上 manifest.yml 文件地址
        overflowPrompt?: string; // 超出最大更新数量后给予的提示消息
        noOverride?: string[];  // 此配置项列举的拓展名文件，当位于用户配置的忽略文件中时，仍下载更新，但仅更新新增内容不对原内容进行覆盖
        replacePath?: ( path: string ) => string; // 修改下载后的文件路径
    };
    subscribe?: {
        name: string;
        getUser: ( bot: BOT ) => Promise<SubUser> | SubUser;
        reSub: ( userId: number, type: "private" | "group", bot: BOT ) => Promise<void> | void;
    }[];
    mounted?: PluginHook; // 钩子函数：插件加载完毕时触发
    unmounted?: PluginHook; // 钩子函数：插件卸载/重载时触发
}
```

#### renderer

可选配置，是否启用框架的 vue-router 前端路由服务，默认不启用。传入 `true` 或配置对象后开启。

| 属性名       | 说明                                                   | 类型       | 默认值          |
|-----------|------------------------------------------------------|----------|--------------|
| dirname   | 从插件目录下的第一级子文件中，指定插件渲染页面存放目录                          | string   | views        |
| mainFiles | 从指定 dirname 下的第一级子目录内，自动查找的 .vue 文件名称列表，将以左往右的顺序依次尝试 | string[] | \[ "index" ] |

详情见 [公共 vue-router](#公共-vue-router)。

##### server

可选配置，通过 `server.routers` 向公共 express-server 注册插件自用路由。

详情见 [公共 express-server](#公共-express-server)。

##### assets

可选配置，是否启用框架自带的 oss 自动更新静态资源支持。传入**对象**或**指向 oss 清单文件的 url**来开启。

| 属性名            | 说明                                                  | 类型                         | 默认值                 |
|----------------|-----------------------------------------------------|----------------------------|---------------------|
| manifestUrl    | oss 线上清单文件文件 url                                    | string                     | -                   |
| overflowPrompt | 超出最大更新数量后给予的提示消息                                    | string                     | 更新文件数量超过阈值，请手动更新资源包 |
| noOverride     | 此配置项列举的拓展名文件，当位于用户配置的忽略文件中时，仍下载更新，但仅更新新增内容不对原内容进行覆盖 | string[]                   | [ "yml", "json" ]   |
| replacePath    | 修改下载后的文件路径                                          | ( path: string ) => string | -                   |

详情见 [自动更新插件静态资源](#自动更新插件静态资源)。

#### subscribe

可选配置，使框架为你的插件提供完善的订阅相关支持。该项为值为一个订阅对象数组，对象中存在如下属性：

| 属性名     | 说明               | 类型                                                                        |
|---------|------------------|---------------------------------------------------------------------------|
| name    | 订阅名称，用于在网页控制台中展示 | string                                                                    | -                   |
| getUser | 获取用户/群主id列表的方法   | ( bot: BOT ) => Promise<SubUser>                                          |
| reSub   | 清除指定用户/群组订阅的方法   | ( userId: number, type: "private" \| "group", bot: BOT ) => Promise<void> | void;    | 

详情见 [订阅服务支持](#订阅服务支持)。

#### mounted

将在插件加载生命周期的最后后执行，支持同步或异步方法，接受类型为 `PluginParameter` 的形参，包含 `BOT` 工具类与额外的配置项注册方法 `configRegister` 与渲染器注册方法 `renderRegister`。

#### unmounted

在插件卸载或重载时执行，与 mounted 类型一致。强烈建议在此钩子中注销会影响插件重载的逻辑，如释放监听端口等。

### 公共 vue-router

前端渲染页已整合至一个公共 vite 项目，共享 vue-router 配置。通过 `PluginSetting.renderer` 配置项进行配置，框架将会从该目录下按一定的规则加载 route 配置。

加载规则：

1、对于 `.vue` 文件，直接按文件名加载路由。  
2、对于目录，按照配置项 `renderer -> mainFiles` 给出的列表，以从左到右的优先级在目录的第一级文件内查找并加载。例如对于配置项默认值 `[ "index" ]`，将会加载目录内的 `index.vue`。加载的路由路径将以**插件名称**即插件目录名称起始。

#### 示例

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

#### 示例

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

> tip：强烈建议使用该支持来注册插件的接口路由。自行创建 server 服务不仅会额外占用端口，还会导致你的插件无法使用 v3 新增的插件重载支持，除非你自行对自己的 server 服务进行注销重启。

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
export default definePlugin({
    assets: {
        manifestUrl: "https://xxx/",
        replacePath: path => {
            return path.replace( "Version3/genshin/", "" );
        }
    }
})
```

#### 更新时不完全覆盖

对于搭建者可能会有的 diy 本地文件的需求，在搭建者配置忽略文件清单后，允许指定部分拓展名的文件依旧照常更新下载。但不会对本地文件直接覆盖，而是采用保留旧内容，仅更新新增部分的方式进行更新。
通过 `PluginSetting.assets.noOverride` 来配置拓展名列表。

### 订阅服务支持

如果你的插件中为用户提供了订阅相关服务（定期主动向用户发送消息），那么可以通过配置 `PluginSetting.subscribe` 来开启框架针对插件订阅的相关功能支持：

- 删除好友、退群时自动取消订阅
- 网页控制台提供对插件的订阅管理支持

该配置项为一个数组，数组中每个对象需要提供三个属性：订阅名称（name）、获取用户id列表方法（getUser）、清除指定id订阅方法（reSub）。

框架将会通过 `getUser` 方法来获取开启了订阅的用户与群组id列表，并通过执行 `reSub` 方法来在必要的时机清除指定用户的订阅信息。

其中 `getUser` 与 `reSub` 的类型定于如下：

```typescript
type SubUser = {
    person?: number[];
    group?: number[];
};

export interface PluginSetting {
    // ...
    subscribe?: {
        name: string;
        getUser: ( bot: BOT ) => Promise<SubUser> | SubUser;
        reSub: ( userId: number, type: "private" | "group", bot: BOT ) => Promise<void> | void;
    }[];
    // ...
}
```

### 静态资源服务器

框架集成的公共 express-server 为插件目录注册了静态资源服务器，可通过 `localhost:port/插件目录名/资源路径` 访问。如果你不希望使用 vue 编写渲染页面，可通过此支持来使用类似 v2 的渲染方式。

同时，当你希望在前端页面中引入本地资源时，则可以利用静态资源服务器来进行访问。

#### 示例

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

#### 类型

```ts
interface BotConfigManager {
    register<T extends Record<string, any>>( filename: string, initCfg: T, setValueCallBack?: ( config: T ) => T, file?: FileManagement, refresh?: RefreshConfig ): ExportConfig<T>;
}
```

#### 参数

- filename: 期望创建的文件名称，可填写基于 `config` 目录的相对路径，无需填写后缀名，将自动创建以 `.yml` 结尾的文件。
- initCfg: 配置文件初始内容，用于与实际文件内容做比对，并进行缺失属性的填充。
- setValueCallBack: 对配置对象的值进行自定义格式化处理，按照该回调函数指定的规则格式化实际配置文件内容，可用于预防用户错填属性值等情况。接受一个形参 config：
  - config：经过配置文件内容与初始内容比对后的配置项值
  - 返回值：最终呈现的配置对象内容

#### 返回值

返回处理后的配置项对象，通过自动推导传入的对象的来获得 ts 类型。

该对象存在以下特性：

- 支持自动重载，你无需做任何操作该对象即可自动响应 `#refresh` 指令进行数据重载更新。
- 可自行注册的重载事件注册方法，你可以额外为其注册其他你希望在执行 `#refresh` 时所执行的回调：
  - on( type, callback ): 新增一个回调事件，允许注册多个回调事件。
    - type: 暂时仅支持 `refresh` 一种类型;
    - callback: 接受两个形参：`newCfg` 与 `oldCfg`，分别表示刷新前后的配置项值。当返回 `string` 类型的值时，将替代默认的刷新成功的打印文本：`xxx.yml 重新加载完毕`。
  - clear( type? ): 清空指定 `type` 的全部回调事件，若不传递 `type` 则清空所有回调事件。

> 值得注意的是，你完全可以在 on 的回调函数中直接使用 config 配置项对象本身来作为新值使用。因为当执行回调函数时，配置项对象自身的值已经提前完成了更新。这在某些需要传递完整 config 类型的场景下格外有用。

#### 示例

```ts
import bot from "ROOT";

// 在 config 目录下创建 test-plugin.yml 配置文件 或是与已存在的 test-plugin.yml 进行对比，返回更新后的配置项内容
const configData = bot.config.register( "test-plugin", { setting1: true, setting2: false }, config => {
    // 预防用户填写非 boolean 值
    if ( typeof config.setting1 !== "boolean" ) {
        config.setting = false;
    }
    return config;
} );
console.log( configData ); // { setting1: true, setting2: false }

// 注册刷新回调函数
let setting1 = configData.setting1;
configData.on( "refresh", ( newCfg, oldCfg ) => {
    setting1 = newCfg.setting1;
} );
```

若你不满足于自动推导得来的类型，或是你希望来进行一些关于初始值的限制与操作，该方法还支持传入第三个参数。

其接受一个 `config` 形参，即传入的配置对象，返回由你自行处理过的配置对象。

```ts
interface MyConfig {
    setting1: "msg" | "card";
    setting2: boolean;
}

// 在 config/test-plugin 目录下创建 main.yml 配置文件
const configData = <MyConfig>bot.config.register( "test-plugin/main", { setting1: "msg", setting2: false }, config => {
    if ( !["msg", "card"].includes( config.setting1 ) ) config.setting1 = "msg";
    return config;
} );
```

当然我们还为插件提供了更方便的配置文件注册方法，你可以在插件的 `mounted` 生命周期钩子中使用 `params.configRegister` 来快速在 `config/插件名` 目录中创建配置文件。

该方法参数传递方式与 `bot.config.register` 一致。

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

### setAlias

在 `mounted` 等生命周期钩子函数的参数中提供，用于设置插件的别名，插件的别名可用于 更新插件、重载插件 等命令。

```ts
export default definePlugin( {
    // ...
    mounted( params ) {
        params.setAlias( [ "茉莉" ] );
    }
} );
```

### refreshRegister

在 `mounted` 等生命周期钩子函数的参数中提供，其使用方式与原来的 `bot.refresh.register` 方法完全相同，为了替代后者而诞生。

```ts
export default definePlugin( {
    // ...
    mounted( params ) {
        params.refreshRegister( () => {
            // 刷新方法
        } );
    }
} );
```

### renderRegister

在 `mounted` 等生命周期钩子函数的参数中提供， `PluginSetting.renderer.register` 的插件便捷使用方式。

免去了提供第一个参数 `route`，自动以 `/插件名（插件目录名）` 作为基地址来注册渲染器。

### 新的指令属性 priority

指令配置对象中新增属性 `priority`，指示指令的优先级大小，值为 `number` 类型，默认值为 0。

当两个指令因为配置重复等原因同时触发时，会根据优先级来决定触发对象。

在编写原生框架指令的增强版本时该属性尤为有效，可用来覆盖原生框架指令。

### 通用工具 utils

在 `src/utils` 中新提供了一些常用工具类。

#### progress

该类用于创建一个单行进度条打印输出。

##### 食用方法

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

##### new Progress()

创建一个 Progress 实例

- 参数1：前方所展示的描述文字
- 参数2：进度条的最大值
- 参数3：进度条的长度

##### progress.renderer()

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

##### 自行设置请求返回值

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

### 新的全局变量

在 .vue 端环境全局挂载变量 `ADACHI_VERSION`，指向当前框架版本。可直接通过 `window.ADACHI_VERSION` 使用。

### order 指令的 match 属性

`OrderMatchResult` 类型新增 `match` 属性。这表示着 Order 类型的指令也允许通过 `matchResult.match` 来获取正则匹配结果。

使用方法如下：

```ts
export default defineDirective( "order", async ( { messageData } ) => {
    const params = matchResult.match;
} );
```

该属性为一个字符串数组，当用户未输入指令的某个可选参数时，该参数所在的数组位置的值为 空字符串`""`。

#### 示例

现有如下指令配置：

```ts
const information: OrderConfig = {
    type: "order",
    headers: [ "info" ],
    regexps: [ "[\\w\\u4e00-\\u9fa5]+", "(-skill)?" ],
    // ...
};
```

当用户输入 `#info 行秋` 与 `#info 行秋 -skill` 时，`matchResult.match` 的值分别为如下结果：

```yaml
# 用户输入：#info 行秋
- [ "行秋", "" ]
# 用户输入：#info 行秋 -skill
- [ "行秋", "-skill" ]
```

## break change

### bot.client 重写

v3 不再使用 `icqq` 作为底层通讯工具，改为对接外部 `gocq` 进行消息通讯。

我们在尽可能保证原来开发习惯的前提下对 `bot.client` 核心库进行了适配 gocq 化重写，现其核心代码位于 `src/module/lib` 下，其方法调用风格与 `oicq1` 类似。

你需要对核心库的导入方式进行一定程度的修改：

```ts
// v2
import * as sdk from "icqq";
// v3
import * as sdk from "@/module/lib";
```

具体方法调用可参考核心工具类 `src/module/lib/client.ts` 与 [go-cqhttp 帮助中心](https://docs.go-cqhttp.org/)。

下面对部分功能实现方式做出说明：

#### 获取当前登陆账号

v3 删除了账号登陆配置，你需要通过 `client.uin` 来获取当前登录的账号。

#### 调用 go-cqhttp api

尽管我们在 `src/module/lib/client.ts` 下尽可能对所有 go-cqhttp 的 api 提供了支持，但难以保证会存在更新不及时的情况。
你可以通过 `fetchGocq` 方法来自行调用 api。

下面给出调用获取陌生人信息 api 示例，该 api 的官网文档：[获取陌生人信息](https://docs.go-cqhttp.org/api/#%E8%8E%B7%E5%8F%96%E9%99%8C%E7%94%9F%E4%BA%BA%E4%BF%A1%E6%81%AF)

```ts
client.fetchGoCq( "get_stranger_info", { user_id: 114514191 } ).then( res => {
    console.log( res ); // 得到结果
} );
```

当然这里仅为了展示 `fetchGoCq` 的使用方法，目前官网的所有文档我们都提供了适配，可以直接通过下面的方法来获取陌生人信息：

```ts
client.getStrangerInfo( 114514191 ).then( res => {
    console.log( res ); // 得到结果
} );
```

#### 监听 go-cqhttp 上报事件

你可以通过 `client.on()` 来监听 go-cqhttp 所发送的特定事件。你可以在 `src/module/lib/types/map/event.ts` 下查看所支持的全部事件类型。

下面是监听 群聊撤回 事件的示例：

```ts
client.on( "notice.group.recall", data => {
    console.log( "data" ); // 事件上报数据
} );
```

可以使用 `client.once()` 来进行一次性事件触发监听，使用方式与 `client.on()` 完全相同。

你同样可以通过 `client.off()` 来注销事件监听，但需要提供与注册事件完全相同的回调函数。

```ts
function callback( data: GroupRecallNoticeEvent ) {
    console.log( data );
};

client.on( "notice.group.recall", callback );
client.off( "notice.group.recall", callback );
```

#### 获取可发送的数据格式

我们提供了 `segment` 工具对象来快速生成可发送的各种数据格式，并支持以数组的方式进行组合发送。详细可以参考 `src/modules/lib/element.ts`;

```ts
import * as sdk from "@/modules/lib";

client.sendPrivateMsg( 114514191, [
    sdk.segment.at( 114514190 ),
    "艾特你一下，wink~",
    sdk.segment.face( 1 )
] );
```

当然你也可以不借助 `segment`，自行组装支持发送的数据格式 `Sendable`。详情可参考 `src/modules/lib/types/element/send.ts`;

```ts
/** 可用来发送的类型集合 */
export type Sendable = string | MessageElem | (string | MessageElem)[];
```

#### 一些其他的核心方法

- sdk.toCqCode(): 将 `MessageElem` 类型数组转变为 cqcode 码的格式。
- sdk.toMessageRecepElem(): 将 cqcode 码转换为事件接收到的格式的对象 `MessageRecepElem[]`;

### 移除的全局工具类 refresh

全局对象 `bot` 已不再包含 `refresh` 对象。请改为通过在插件钩子函数的形参中提供的 [refreshRegister](#refreshRegister) 方法来注册刷新事件。

当然如果你有特殊需要，必须使用 `refresh` 工具类中的方法。可通过以下方式来获取 `refresh` 实例对象。

```ts
import Refreshable from "@/modules/management/refresh";

const refresh = Refreshable.getInstance();
```

### 插件入口函数格式变更

新版插件不再以 `init` 函数的方式配置插件配置项，改为默认导出一个变量的方式。

```ts
// test-plugin/init.ts
export default {
    name: "测试插件",
    cfgList: [],
    mounted() {
        // 插件行为
    }
};
```

你可以通过 `definePlugin` 宏函数进行一层包装，来获取完善的 ts 类型支持。

```ts
import { definePlugin } from "@/modules/plugin";

// test-plugin/init.ts
export default definePlugin( {
    name: "测试插件",
    cfgList: [],
    mounted() {
        // 插件行为
    }
} );
```

> 我们强烈推荐你在 `mounted` 生命周期钩子函数中进行原来的插件的初始化行为。这样可以有效的避免一些加载顺序导致的变量未定义情况，例如其他文件在通过 `import bot from "ROOT"` 使用框架库时提示 `bot 未定义`。

### 指令入口函数写法变更

新版指令入口函数取消了以往抛出 `main` 函数的写法，改为默认导出一个普通函数的方式。

```ts
// test-plugin/achieves/test.ts
export default async function ( i ) {
    // 指令行为
}
```

你可以通过 `defineDirective` 宏函数进行一层包装，来获取完善的 ts 类型支持。
该宏函数接受两个参数：指令类型（`"order" | "switch" | "enquire"`）与指令入口函数。

```ts
import { defineDirective } from "@/modules/command/main";

// test-plugin/achieves/test.ts
export default defineDirective( "order", async i => {
    // 指令行为
});
```

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

### 指令 Enquire 重写

鉴于 v2 的 `Enquire` 使用场景比较稀少，v3 对 `Enquire` 指令进行了重写，现在它除了名称相同以外与 v2 完全没有联系。

新版的 `Enquire` 指令旨在实现 **问答** 的场景，如下：

```text
Q: #ps
A: 请发送你的账号 cookie 来绑定私人服务
Q: ltuid=15......
A: 绑定成功
// 或在一定时间未回复时
A: 操作超时
```

新版 `Enquire` 的定义如下：

```ts
export type EnquireConfig = CommandCfg & {
    type: Enquire["type"];
    headers: string[];
    timeout: number;
};
```

这样可能有些难以理解，我们可以把他解释为下面的结构：

```ts
interface EnquireConfig {
    type: "enquire";
    cmdKey: string;
    main: string | CommandEntry;
    desc: [ string, string ];
    headers: string[];
    timeout: number;
    detail?: string;
    auth?: AuthLevel;
    scope?: MessageScope;
    display?: boolean;
    ignoreCase?: boolean;
    start?: boolean;
    stop?: boolean;
    priority?: number;
}
```

可以看出，其相对 `Order` 来说，移除了 `regexps` 属性，新增了 `timeout` 属性。

目前认为，问答式指令并没有参数输入的需求，因此移除了 `regexps` 配置。
而 `timeout` 属性则用来控制“回答”的最长等待时间，单位**秒**。若你填写 0 或小于 0 的值，将会被重置为默认的 `300s`。

enquire 的入口函数定义与其他指令类似，仅修改类型参数即可：

```ts
export default defineDirective( "enquire", async i => {
    // 指令逻辑
} );
```

与其他指令对比，入口函数携带的 `i.matchResult` 发生了变化，格式如下：

```ts
export interface EnquireMatchResult {
    type: "enquire";
    header: string;
    status: "activate" | "confirm" | "timeout";
    timeout: number;
}
```

其中 `timeout` 为回答等待超时时间；`status` 三种状态分别对应：初次触发、用户回答、超时，在这三种事件出现时，均会携带对应的 `status` 执行入口函数。

默认情况下，用户只需回答一次即可终止本次问答。指令也提供了一种方式来覆盖次默认行为： 当 `status` 的值为 `confirm` 时，使入口函数执行 `return false` 来禁止终止问答。
通常这可以用来根据用户回答内容是否有效来决定是否结束问答。

下面是一个 `enquire` 指令完整的案例：

```ts
/* 指令配置 */
const qa: EnquireConfig = {
    type: "enquire",
    cmdKey: "adachi.test.enquire",
    desc: [ "问答测试", "" ],
    headers: [ "qa" ],
    main: "achieves/qa",
    timeout: 180
};

/* achieves/qa.ts */
export default defineDirective( "enquire", async i => {
    if ( i.matchResult.status === "activate" ) {
        await i.sendMessage( "请发送你的问题" );
        return;
    }
    if ( i.matchResult.status === "timeout" ) {
        await i.sendMessage( "操作已超时，会话终止" );
        return;
    }
    if ( i.matchResult.status === "confirm" ) {
        try {
            // 通过 i.messageData.raw_message 获取用户发送内容
            const answer = await answerQuestion( i.messageData.raw_message );
            await i.sendMessage( answer );
        } catch {
            await i.sendMessage( "你的问题我无法回答，请重新提问" );
            return false; // 不终止会话，继续等待提问
        }
    }
} );
```

### bot 配置项结构变更

删除 `bot.whiteList`，合并至 `bot.config.whiteList`。

`bot.config` 变更为新结构：

```javascript
config = {
    base: {
        master: 987654321,
        inviteAuth: 2,
        logLevel: "info",
        atUser: false,
        atBOT: false,
        addFriend: true,
        renderPort: 80
    },
    directive: {
        header: [ "#" ],
        groupIntervalTime: 1500,
        privateIntervalTime: 2000,
        helpMessageStyle: "message",
        fuzzyMatch: false,
        matchPrompt: true,
        callTimes: 3,
        countThreshold: 60,
        ThresholdInterval: false
    },
    ffmpeg: {
        ffmpegPath: "",
        ffprobePath: ""
    },
    db: {
        port: 56379,
        password: ""
    },
    mail: {
        host: "smtp.qq.com",
        port: 587,
        user: "123456789@qq.com",
        pass: "",
        secure: false,
        servername: "",
        rejectUnauthorized: false,
        logoutSend: false,
        sendDelay: 5,
        retry: 3,
        retryWait: 5
    },
    autoChat: {
        enable: false,
        type: 1,
        audio: false,
        secretId: "",
        secretKey: ""
    },
    whiteList: {
        enable: false,
        user: [ "（用户QQ）" ],
        group: [ "（群号）" ]
    },
    banScreenSwipe: {
        enable: false,
        limit: 10,
        duration: 1800,
        prompt: true,
        promptMsg: "请不要刷屏哦~"
    },
    banHeavyAt: {
        enable: false,
        limit: 10,
        duration: 1800,
        prompt: true,
        promptMsg: "你at太多人了，会被讨厌的哦~"
    },
    webConsole: {
        enable: true,
        password: "",
        tcpLoggerPort: 54921,
        logHighWaterMark: 64,
        jwtSecret: getRandomString( 16 )
    }
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

由于使用了 `vue-router`，相对路径不再准确，建议使用绝对路径，参考上文 [静态资源服务器](#静态资源服务器)