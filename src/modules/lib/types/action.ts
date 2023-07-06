/** 响应数据 */
export interface ActionResponse {
	/** API调用状态 ok:成功 async:已开始处理 failed:失败 */
	status: "ok" | "async" | "failed";
	/** API调用状态 0:成功 1:已开始处理 其他:失败 */
	retcode: number;
	/** 响应数据 */
	data: Record<string, any>;
	/** 错误消息 */
	msg?: string;
	/** 对错误的详细解释(中文) */
	wording?: string;
	/** 如果请求时指定了 echo, 那么响应也会包含相同 echo */
	echo?: string;
}

/** 请求数据 */
export interface ActionRequest {
	/** 终结点名称 */
	action: string;
	/** 请求数据 */
	params?: Record<string, any>;
	/** 如果请求时指定了 echo, 那么响应也会包含相同 echo */
	echo?: string;
}