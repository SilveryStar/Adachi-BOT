(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{395:function(t,a,e){"use strict";e.r(a);var s=e(54),v=Object(s.a)({},(function(){var t=this,a=t.$createElement,e=t._self._c||a;return e("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[e("h1",{attrs:{id:"windows-部署"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#windows-部署"}},[t._v("#")]),t._v(" Windows 部署")]),t._v(" "),e("div",{staticClass:"custom-block warning"},[e("p",{staticClass:"custom-block-title"},[t._v("WARNING")]),t._v(" "),e("p",[t._v("尽管本页面用于介绍如何在 Windows 环境中对应用进行部署，我们还是更推荐使用如 "),e("a",{attrs:{href:"https://www.centos.org/",target:"_blank",rel:"noopener noreferrer"}},[t._v("CentOS"),e("OutboundLink")],1),t._v(" 等 Linux 发行版")]),t._v(" "),e("p",[t._v("！！拒绝伸手，不提供成品号，有需要请自行部署！！")])]),t._v(" "),e("h2",{attrs:{id:"闲言碎语"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#闲言碎语"}},[t._v("#")]),t._v(" 闲言碎语")]),t._v(" "),e("p",[t._v("偶然在B站看到关于本项目的演示视频和 Windows 中的"),e("a",{attrs:{href:"https://www.bilibili.com/read/cv13331826",target:"_blank",rel:"noopener noreferrer"}},[t._v("部署文章"),e("OutboundLink")],1),t._v("\n，事无巨细地介绍了很多部署细节。本文也将一定程度的参考这篇文件进行介绍，同时汇总一些常见的可能出现的问题。")]),t._v(" "),e("h2",{attrs:{id:"准备"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#准备"}},[t._v("#")]),t._v(" 准备")]),t._v(" "),e("h3",{attrs:{id:"服务器"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#服务器"}},[t._v("#")]),t._v(" 服务器")]),t._v(" "),e("p",[t._v("首先必须要知道的一点，机器人本身只是在模拟真人来对你在群聊中的种种信息做出回答，所以如果想让你的群友们24小时都能使用机器人，你就需要一台云服务器来挂着你准备的机器人QQ账号（当然，如果你打算24小时开着自己的电脑，可以跳过这一步）。")]),t._v(" "),e("p",[t._v("我们的程序对服务器配置的要求并不高，学生机就足够了，参考 "),e("a",{attrs:{href:"https://cloud.tencent.com/act/campus",target:"_blank",rel:"noopener noreferrer"}},[t._v("腾讯云"),e("OutboundLink")],1),t._v("\n和 "),e("a",{attrs:{href:"https://developer.aliyun.com/plan/grow-up",target:"_blank",rel:"noopener noreferrer"}},[t._v("阿里云"),e("OutboundLink")],1),t._v(" ，月租只需要9元。下面以腾讯云为例来介绍如何创建服务器(-¥27)。")]),t._v(" "),e("p",[e("img",{attrs:{src:"/windows/prepare1.png",alt:""}}),t._v(" "),e("img",{attrs:{src:"/windows/prepare2.png",alt:""}})]),t._v(" "),e("p",[t._v("付费成功后，进入控制台，选择通用场景或勾选暂不需要场景教学，然后确定，并等待服务器创建完成。")]),t._v(" "),e("p",[t._v("在控制台页面，点开刚刚创建成功的服务器右上角的「更多」，然后选择下拉菜单里的「管理」，在实例信息的方格中，先将服务器「关机」后，选择「重置密码」，确认设置后，点击「开机」开启服务器。")]),t._v(" "),e("p",[t._v("在控制台页面的上方，有一段类似 "),e("code",[t._v("上海 | (公) xxx.xxx.xxx.xxx")]),t._v(" 的文字，点击右侧即可复制你的服务器的IP。复制之后，通过远程桌面连接服务器。")]),t._v(" "),e("div",{staticClass:"custom-block tip"},[e("p",{staticClass:"custom-block-title"},[t._v("TIP")]),t._v(" "),e("p",[t._v("如何连接远程桌面？")]),t._v(" "),e("ol",[e("li",[t._v("同时按下 Windows键 + R，在「打开」右侧的输入框中输入 "),e("code",[t._v("mstsc")]),t._v("，回车即可打开「远程桌面连接」窗口。或是按下 Windows键 后，在「开始」页面里搜索「远程桌面连接」，也能打开这个窗口。")]),t._v(" "),e("li",[t._v("在打开的窗口中点击「显示选项」，「计算机」中填写上面复制的服务器IP，「用户名」在你没有进行修改的情况下是 "),e("code",[t._v("Administrator")]),t._v("。")]),t._v(" "),e("li",[t._v("填写完成后可以点击下方的「另存为」将他保存在你的桌面上，以后只需双击这个文件就能连接到服务器。然后点击「连接」，不需要在意弹出的提示，只需要点击「是」即可，然后输入你前面设置的密码。")]),t._v(" "),e("li",[t._v("登录进服务器后可能会弹出「仪表盘」，关闭即可。")])])]),t._v(" "),e("p",[t._v("以上，你就完成了服务器的设置。")]),t._v(" "),e("h3",{attrs:{id:"环境"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#环境"}},[t._v("#")]),t._v(" 环境")]),t._v(" "),e("p",[t._v("你需要先为机器人准备 "),e("code",[t._v("Node.js")]),t._v(" 的运行环境，你可以在 "),e("a",{attrs:{href:"https://nodejs.org/download/release/v14.17.2/",target:"_blank",rel:"noopener noreferrer"}},[t._v("这里"),e("OutboundLink")],1),t._v(" 找到正确的版本。选择 "),e("code",[t._v("node-v14.17.2-x64.msi")]),t._v("\n，这是为 64位 系统准备的版本，如果你正在自己的电脑上进行这些步骤，并且你的电脑安装的是 32位 系统，请选择 "),e("code",[t._v("node-v14.17.2-x86.msi")]),t._v(" "),e("s",[t._v("（这年头不会还有人用 32位 吧）")]),t._v("\n。你也不需要为英文的安装界面所烦恼，不需要考虑安装路径，看到能勾选的地方勾选即可，然后无脑「Next」就好。")]),t._v(" "),e("p",[t._v("安装完成后最好检查版本是否正确，同时按下 Windows键 + R，在「打开」右侧的输入框中输入 "),e("code",[t._v("cmd")]),t._v("，回车打开命令行，分别输入 "),e("code",[t._v("node -v")]),t._v(" 和 "),e("code",[t._v("npm -v")]),t._v(" ，看到下面的输出就算环境安装成功。")]),t._v(" "),e("p",[e("img",{attrs:{src:"/windows/env1.png",alt:""}})]),t._v(" "),e("p",[t._v("以上都完成后我们还建议你安装 "),e("code",[t._v("cnpm")]),t._v(" ，方法十分简单，只需要在刚刚的命令行窗口中输入 "),e("code",[t._v("npm i -g cnpm")]),t._v(" 即可。安装完成后同样可以通过 "),e("code",[t._v("cnpm -v")]),t._v(" 来查看是否正确安装。")]),t._v(" "),e("h3",{attrs:{id:"下载"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#下载"}},[t._v("#")]),t._v(" 下载")]),t._v(" "),e("p",[t._v("最简单的方法是下载代码的压缩包，进入 "),e("a",{attrs:{href:"https://github.com/SilveryStar/Adachi-BOT",target:"_blank",rel:"noopener noreferrer"}},[t._v("项目主页"),e("OutboundLink")],1),t._v(" ，在页面中的绿色按钮「Code」的下拉菜单中选择「Download\nZIP」，下载到你指定的地方解压即可。")]),t._v(" "),e("p",[t._v("不过这种方法可能下载速度较慢，并且以后更新机器人的版本比较麻烦，所有希望你能参考下面的方法来进行下载。")]),t._v(" "),e("ol",[e("li",[t._v("进入 "),e("a",{attrs:{href:"https://git-scm.com/downloads",target:"_blank",rel:"noopener noreferrer"}},[t._v("Git 主页"),e("OutboundLink")],1),t._v(" ，然后点击 "),e("code",[t._v("Windows")]),t._v(" 进入下载页面，稍等片刻后会自动弹出下载窗口。如果没有窗口弹出，则点击「Click here to download\nmanually」。")]),t._v(" "),e("li",[t._v("下载完成后同样无脑「Next」即可完成安装。")]),t._v(" "),e("li",[t._v("在任何一个你创建的文件夹中，空白处右键鼠标，选择「Git Bash\nHere」，然后在弹出的命令行窗口中输入 "),e("code",[t._v("git clone https://ghproxy.com/https://github.com/SilveryStar/Adachi-BOT.git")]),t._v(" ，很快就能下载完成。")])]),t._v(" "),e("h2",{attrs:{id:"启动"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#启动"}},[t._v("#")]),t._v(" 启动")]),t._v(" "),e("p",[t._v("我们提供了两种启动机器人的方案，事实上，处于程序运行的稳定性考虑，其实更加推荐 "),e("code",[t._v("Docker")]),t._v(" 的启动方式。但处于很多看本文的人应该都没有相关的维护经验的考虑，我们还是着重介绍另一种直接启动的方法。")]),t._v(" "),e("h3",{attrs:{id:"数据库安装"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#数据库安装"}},[t._v("#")]),t._v(" 数据库安装")]),t._v(" "),e("p",[t._v("进入 "),e("a",{attrs:{href:"https://github.com/microsoftarchive/redis/releases/tag/win-3.2.100",target:"_blank",rel:"noopener noreferrer"}},[t._v("GitHub"),e("OutboundLink")],1),t._v(" 选择 "),e("code",[t._v("Redis-x64-3.2.100.zip")]),t._v("\n进行下载并解压，然后把BOT项目中的 "),e("code",[t._v("redis.conf")]),t._v(" 文件复制到解压后的目录里然后把文件里的 "),e("code",[t._v("dir /data/")]),t._v(" 改为 "),e("code",[t._v("dir ./")]),t._v(" ，把 "),e("code",[t._v("port 56379")]),t._v(" 改为 "),e("code",[t._v("port 6379")]),t._v("\n（之后需要把BOT项目里 "),e("code",[t._v("config/setting.yml")]),t._v("里的 "),e("code",[t._v("dbport")]),t._v(" 改为 "),e("code",[t._v("6379")]),t._v(" ），之后新建一个文本文件，可以命名为 "),e("code",[t._v("start-redis.bat")]),t._v(" （注意后缀名是 "),e("code",[t._v(".bat")]),t._v("\n，重命名文件时一定要把后缀名改掉不能是 "),e("code",[t._v("txt")]),t._v(" ，至于怎么显示后缀名，不会可以百度下）。把下面的命令粘贴到这个脚本文件里，保存后双击运行，启动后不要关闭窗口。")]),t._v(" "),e("div",{staticClass:"language-bash extra-class"},[e("pre",{pre:!0,attrs:{class:"language-bash"}},[e("code",[t._v("."),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("\\")]),t._v("redis-server.exe ."),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("\\")]),t._v("redis.conf\n")])])]),e("h3",{attrs:{id:"配置"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#配置"}},[t._v("#")]),t._v(" 配置")]),t._v(" "),e("p",[t._v("首先进入 "),e("code",[t._v("Adachi-BOT")]),t._v(" 文件夹，依照上面的方法打开 "),e("code",[t._v("Git Bash")]),t._v(" 命令行，输入以下两行代码来安装程序所需的文件。")]),t._v(" "),e("div",{staticClass:"language-bash extra-class"},[e("pre",{pre:!0,attrs:{class:"language-bash"}},[e("code",[e("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 设置 npm 国内镜像")]),t._v("\n"),e("span",{pre:!0,attrs:{class:"token function"}},[t._v("npm")]),t._v(" config "),e("span",{pre:!0,attrs:{class:"token builtin class-name"}},[t._v("set")]),t._v(" registry https://registry.npmmirror.com\n\n"),e("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 下载项目所需依赖")]),t._v("\n"),e("span",{pre:!0,attrs:{class:"token function"}},[t._v("npm")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token function"}},[t._v("install")]),t._v("\n")])])]),e("p",[t._v("然后输入 "),e("code",[t._v("npm start")]),t._v(" ，这会在当前文件夹内创建一个 "),e("code",[t._v("config")]),t._v(" 文件夹，这是用来配置机器人的文件夹。")]),t._v(" "),e("p",[t._v("由于服务器内自带的文件编辑器并不好用，这里建议你安装 "),e("a",{attrs:{href:"https://code.visualstudio.com/",target:"_blank",rel:"noopener noreferrer"}},[t._v("VSCode"),e("OutboundLink")],1),t._v(" 。进入页面后点击「Download for\nWindows」即可。如果没有弹出下载窗口的话，可以在自己的电脑上下载好安装包复制进服务器进行安装。")]),t._v(" "),e("p",[e("code",[t._v("config")]),t._v(" 文件夹中包含 "),e("code",[t._v("setting.yml")]),t._v(", "),e("code",[t._v("cookies.yml")]),t._v(" 和 "),e("code",[t._v("commands.yml")]),t._v(" 三个文件，请按照 "),e("RouterLink",{attrs:{to:"/config/"}},[t._v("这里")]),t._v("\n的信息进行配置，里面非常详细的说明了每个属性的作用。其中 "),e("code",[t._v("commands.yml")]),t._v(" 不需要处理，只用管另外两个就好。")],1),t._v(" "),e("p",[t._v("对于 "),e("code",[t._v("setting")]),t._v(" ，一般情况下，你只需要配置 "),e("code",[t._v("number")]),t._v(", "),e("code",[t._v("password")]),t._v(", "),e("code",[t._v("master")]),t._v(" 几个属性，其他的默认情况下都是最常用的属性。此外，注意将 "),e("code",[t._v("port")]),t._v(" 改为 6379 。")]),t._v(" "),e("p",[t._v("对于 "),e("code",[t._v("cookies")]),t._v("\n，这是用来得到米游社数据的东西，每个米游社账号都是独一无二的，"),e("RouterLink",{attrs:{to:"/faq/#如何获得米游社-cookies"}},[t._v("这里")]),t._v("\n会告诉你如何获得它。")],1),t._v(" "),e("h3",{attrs:{id:"运行"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#运行"}},[t._v("#")]),t._v(" 运行")]),t._v(" "),e("p",[t._v("一切准备就绪，输入 "),e("code",[t._v("npm restart")]),t._v(" 即可启动机器人，然后保持窗口不关闭即可，远程桌面可以断开连接。现在机器人就能收发信息了。")]),t._v(" "),e("div",{staticClass:"custom-block tip"},[e("p",{staticClass:"custom-block-title"},[t._v("TIP")]),t._v(" "),e("p",[t._v("这里有一个容易犯的误区，"),e("s",[t._v("包括B站上的那位作者也犯了")]),t._v("，就是 "),e("code",[t._v("npm run login")]),t._v(" 在这里并不需要使用，这条命令是用来帮助 "),e("code",[t._v("Docker")]),t._v(" 启动验证设备的")])]),t._v(" "),e("h3",{attrs:{id:"更新"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#更新"}},[t._v("#")]),t._v(" 更新")]),t._v(" "),e("p",[t._v("因为项目会时常更新版本，你当然可以保持较旧版本的使用，但出现 BUG 时也需要进行更新，下面简单的介绍两种更新项目的方式。")]),t._v(" "),e("h4",{attrs:{id:"git"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#git"}},[t._v("#")]),t._v(" Git")]),t._v(" "),e("ol",[e("li",[t._v("在项目根目录下，输入 "),e("code",[t._v("git pull")]),t._v(" 进行更新，若出现 "),e("code",[t._v("error: Yout local changes to the following files would be overwritten by merge:")]),t._v("\n，说明本地存在修改记录无法更新。若记不起自己改了什么或无关紧要的修改，可执行 "),e("code",[t._v("git reset --hard")]),t._v(" 来清除本地修改记录，然后再次尝试拉取。")]),t._v(" "),e("li",[t._v("运行 "),e("code",[t._v("npm restart")]),t._v(" 重启。")])]),t._v(" "),e("h4",{attrs:{id:"指令更新"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#指令更新"}},[t._v("#")]),t._v(" 指令更新")]),t._v(" "),e("p",[t._v("使用拥有 master 权限的账号 对 BOT 发送 "),e("code",[t._v("#upgrade")]),t._v(" 指令即可开始更新，并在成功更新后自动重启 BOT。")]),t._v(" "),e("div",{staticClass:"custom-block tip"},[e("p",{staticClass:"custom-block-title"},[t._v("TIP")]),t._v(" "),e("p",[t._v("由于每个人的配置不同，发送无效的请使用帮助指令查看具体更新指令。"),e("br"),t._v("\n以及因为众所周知的原因，从 git 上拉取代码的网络极其不稳定，出现网络问题拉取失败为正常现象，多试几次即可。")])]),t._v(" "),e("h3",{attrs:{id:"问题查找"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#问题查找"}},[t._v("#")]),t._v(" 问题查找")]),t._v(" "),e("p",[t._v("若按在上述操作中未达到下一步的预期结果，可查看日志来排查错误，使用以下方式来查看 BOT 运行日志。")]),t._v(" "),e("div",{staticClass:"language-bash extra-class"},[e("pre",{pre:!0,attrs:{class:"language-bash"}},[e("code",[e("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 若已全局安装 pm2，可无视这一步")]),t._v("\n"),e("span",{pre:!0,attrs:{class:"token function"}},[t._v("npm")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token function"}},[t._v("install")]),t._v(" -g pm2\n\n"),e("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 查看日志")]),t._v("\npm2 log adachi-bot\n")])])]),e("p",[t._v("若报错信息无法自行解决，可携带报错信息截图向我们的 "),e("a",{attrs:{href:"https://qun.qq.com/qqweb/qunpro/share?_wv=3&_wwv=128&inviteCode=ZcZDq&from=246610&biz=ka",target:"_blank",rel:"noopener noreferrer"}},[t._v("官方频道"),e("OutboundLink")],1),t._v("\n反馈。")]),t._v(" "),e("h2",{attrs:{id:"问题解答"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#问题解答"}},[t._v("#")]),t._v(" 问题解答")]),t._v(" "),e("p",[t._v("此处收集了部分 "),e("a",{attrs:{href:"https://www.bilibili.com/read/cv13331826",target:"_blank",rel:"noopener noreferrer"}},[t._v("该文章"),e("OutboundLink")],1),t._v(" 评论区提及的问题，并做统一解答。")]),t._v(" "),e("h3",{attrs:{id:"怎么更改指令的形式"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#怎么更改指令的形式"}},[t._v("#")]),t._v(" 怎么更改指令的形式")]),t._v(" "),e("blockquote",[e("p",[t._v("大佬，我想再请问一下，那个机器人的英文命令具体怎么更改呀，就是把mys改成米游社，aby改成深渊那种。我看您评论区里说init里面修改，但是我找不到abyss，只把command里面的abyss改成深渊可以吗")])]),t._v(" "),e("p",[t._v("在第一次成功运行机器人后，"),e("code",[t._v("config")]),t._v(" 文件夹里的 "),e("code",[t._v("commands.yml")]),t._v(" 文件会更新。对机器人发送 "),e("code",[t._v("#help -k")]),t._v(" 可以看到每个功能的指令对应的 "),e("code",[t._v("key")]),t._v(" ，在 "),e("code",[t._v("commands.yml")]),t._v("\n中找到你要修改的功能，然后按照 "),e("RouterLink",{attrs:{to:"/config/#commands-yml"}},[t._v("这里")]),t._v(" 介绍的进行更改即可，例如：")],1),t._v(" "),e("p",[t._v("下面的是深渊查询的指令配置，默认情况下 "),e("code",[t._v("caby")]),t._v(" 用于查询本期深渊，"),e("code",[t._v("laby")]),t._v(" 是上期深渊。")]),t._v(" "),e("div",{staticClass:"language-yaml extra-class"},[e("pre",{pre:!0,attrs:{class:"language-yaml"}},[e("code",[e("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("silvery-star.private-abyss")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n  "),e("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("type")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" switch\n  "),e("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("auth")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),t._v("\n  "),e("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("scope")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token number"}},[t._v("3")]),t._v("\n  "),e("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("mode")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" divided\n  "),e("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("onKey")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" caby\n  "),e("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("offKey")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" laby\n  "),e("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("header")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token string"}},[t._v('""')]),t._v("\n  "),e("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("enable")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token boolean important"}},[t._v("true")]),t._v("\n")])])]),e("p",[t._v("把其中的部分属性改成下面这样，即可修改上面的英文指令。")]),t._v(" "),e("div",{staticClass:"language-yaml extra-class"},[e("pre",{pre:!0,attrs:{class:"language-yaml"}},[e("code",[e("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("onKey")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 深渊\n"),e("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("offKey")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 上期深渊\n")])])]),e("p",[t._v("下面是米游社查询的指令，默认只有 "),e("code",[t._v("mys")]),t._v(" 一个关键词。")]),t._v(" "),e("div",{staticClass:"language-yaml extra-class"},[e("pre",{pre:!0,attrs:{class:"language-yaml"}},[e("code",[e("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("silvery-star.private-mys")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n  "),e("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("type")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" order\n  "),e("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("auth")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),t._v("\n  "),e("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("scope")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token number"}},[t._v("3")]),t._v("\n  "),e("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("headers")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n    "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("-")]),t._v(" mys\n  "),e("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("enable")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token boolean important"}},[t._v("true")]),t._v("\n")])])]),e("p",[t._v("同样，你也可以修改他的形式，比如:")]),t._v(" "),e("div",{staticClass:"language-yaml extra-class"},[e("pre",{pre:!0,attrs:{class:"language-yaml"}},[e("code",[e("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("headers")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n  "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("-")]),t._v(" 米游社\n")])])]),e("div",{staticClass:"custom-block tip"},[e("p",{staticClass:"custom-block-title"},[t._v("TIP")]),t._v(" "),e("p",[t._v("大多数时候，你不需要为一个命令配置大小写的关键词，如 "),e("code",[t._v("uid")]),t._v(", "),e("code",[t._v("Uid")]),t._v(" 和 "),e("code",[t._v("UID")]),t._v("，只需要使用全小写的那个即可")])]),t._v(" "),e("h3",{attrs:{id:"关于机器人账号"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#关于机器人账号"}},[t._v("#")]),t._v(" 关于机器人账号")]),t._v(" "),e("blockquote",[e("p",[t._v("up最后的时候提示qq等级过低是什么问题啊？还特意去更新了一下qq不过暂时好像还是没用")])]),t._v(" "),e("p",[t._v("账号密码登录时，如果QQ账号等级（就那个星星月亮的等级）较低，因为服务器登录属于异地登录，可能被腾讯风控。")]),t._v(" "),e("p",[t._v("这种情况一般把账号在服务器挂一段时间就行，或者选择把 "),e("code",[t._v("setting.yml")]),t._v(" 中的 "),e("code",[t._v("qrcode")]),t._v(" 改成 "),e("code",[t._v("true")]),t._v("，使用扫码的方式进行登录。")]),t._v(" "),e("h3",{attrs:{id:"运行机器人时卡住了"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#运行机器人时卡住了"}},[t._v("#")]),t._v(" 运行机器人时卡住了")]),t._v(" "),e("blockquote",[e("p",[t._v("npm start之后")]),t._v(" "),e("p",[t._v("> adachi-bot@2.2.0 start D:\\test\\Adachi-BOT-master")]),t._v(" "),e("p",[t._v("> ts-node -r tsconfig-paths/register app.ts --files")])]),t._v(" "),e("p",[t._v("在你把 "),e("code",[t._v("setting.yml")]),t._v(" 中的 "),e("code",[t._v("webConsole.enable")]),t._v(" 设置为 "),e("code",[t._v("true")]),t._v(" 时（"),e("strong",[t._v("注意")]),t._v("，此时"),e("code",[t._v("jwtSecret")]),t._v("\n要随便填一点内容,否则启动会报错），这里不会打印出更多消息，你可以直接在外部访问你的服务器IP进入网页控制台，详细见 "),e("RouterLink",{attrs:{to:"/web-console/#访问"}},[t._v("控制台")]),t._v(" 。")],1),t._v(" "),e("p",[t._v("且在 v2.6.4 以及更高的版本下，默认情况下 "),e("code",[t._v("jwtSecret")]),t._v(" 将会随机生成，且在启动成功后将会在日志中给予提示。")]),t._v(" "),e("h2",{attrs:{id:"结"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#结"}},[t._v("#")]),t._v(" 结")]),t._v(" "),e("p",[t._v("以上是我自认为最详细的 Windows 部署方法，如有疑问，请到 "),e("a",{attrs:{href:"https://github.com/SilveryStar/Adachi-BOT",target:"_blank",rel:"noopener noreferrer"}},[t._v("GitHub"),e("OutboundLink")],1),t._v(" 提交 issue，喜欢的话可以点个 "),e("code",[t._v("star")]),t._v("。")])])}),[],!1,null,null,null);a.default=v.exports}}]);