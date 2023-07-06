/** 图片信息 */
export interface ImageInfo {
	/** 图片源文件大小 */
	size: number;
	/** 图片文件原名 */
	filename: string;
	/** 图片下载地址 */
	url: string;
}

/** 图片 OCR 信息 */
interface OcrImageText {
	/** 文本 */
	text: string;
	/** 置信度 */
	confidence: number;
	/** 坐标 */
	coordinates: any[];
}

/** 图片 OCR */
export interface OcrImage {
	/** OCR结果 */
	texts: OcrImageText[];
	/** 语言 */
	language: string;
}