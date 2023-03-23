import mail from "nodemailer";
import BotConfig from "@modules/config";
import { Logger } from "log4js";

enum InfoMessage {
	SUCCESS_SEND = "邮件发送成功。",
	ERROR_SEND = "邮件发送失败，错误："
}

export type SendFunc = ( title: mail.SendMailOptions["subject"], content: mail.SendMailOptions["html"] ) => Promise<void>;

interface MailManagementMethod {
	getSendMailFunc( address: mail.SendMailOptions["to"] ): SendFunc;
	sendMaster( title: mail.SendMailOptions["subject"], content: mail.SendMailOptions["html"] ): Promise<void>;
}


export default class MailManagement implements MailManagementMethod {
	private sender: mail.Transporter;
	private readonly senderInfo: mail.SendMailOptions["from"];
	
	constructor(
		private config: BotConfig,
		private logger: Logger
	) {
		const mailConfig = config.mailConfig;
		this.senderInfo = {
			name: "Adachi-BOT",
			address: `${ this.config.number }@qq.com`
		}
		this.sender = mail.createTransport( {
			service: mailConfig.platform,
			auth: {
				user: mailConfig.user,
				pass: mailConfig.authCode
			}
		} );
	}
	
	public getSendMailFunc( address: mail.SendMailOptions["to"] ) {
		return async ( title: mail.SendMailOptions["subject"], content: mail.SendMailOptions["html"] ) => {
			try {
				await this.sender.sendMail( {
					from: this.senderInfo,
					subject: title,
					to: address,
					html: content
				} );
				this.logger.info( InfoMessage.SUCCESS_SEND );
			} catch ( error ) {
				this.logger.error( InfoMessage.ERROR_SEND + ( <Error>error ).stack )
			}
		}
	}
	
	public async sendMaster( title: mail.SendMailOptions["subject"], content: mail.SendMailOptions["html"] ) {
		try {
			await this.sender.sendMail( {
				from: this.senderInfo,
				subject: title,
				to: `${ this.config.master }@qq.com`,
				html: content
			} );
			this.logger.info( InfoMessage.SUCCESS_SEND );
		} catch ( error ) {
			this.logger.error( InfoMessage.ERROR_SEND + ( <Error>error ).stack )
		}
	}
}