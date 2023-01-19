import { ResponseBody } from "#genshin/types/response";

/**
 Author: Extrwave
 CreateTime: 2023/1/7
 */

export interface VerifyError {
	type: "verify-error"
}

export const verifyError: ResponseBody = {
	retcode: 1034,
	message: "多次尝试绕过验证码失败，请联系Master反馈",
	data: {
		type: 'verify-error'
	}
};