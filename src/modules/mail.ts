import mail from "nodemailer";
import { BotConfig } from "@/modules/config";
import { Logger } from "log4js";
import { sleep } from "@/utils/common";

enum InfoMessage {
	SUCCESS_SEND = "邮件发送成功。",
	ERROR_SEND = "邮件发送失败，错误："
}

export type SendFunc = ( mailOptions: mail.SendMailOptions, retry: number, retryWait: number ) => Promise<void>;

interface MailManagementMethod {
	getSendMailFunc( address: mail.SendMailOptions["to"] ): SendFunc;
	sendMaster: SendFunc;
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
			host: mailConfig.host,
			port: mailConfig.port,
			secure: mailConfig.secure,
			tls: {
				servername: mailConfig.servername,
				rejectUnauthorized: mailConfig.rejectUnauthorized
			},
			auth: {
				user: mailConfig.user,
				pass: mailConfig.pass
			}
		} );
	}
	
	public getSendMailFunc( address: mail.SendMailOptions["to"] ) {
		const sendMailFunc = async ( mailOptions: mail.SendMailOptions, retry: number = 3, retryWait: number = 120 ) => {
			try {
				await this.sender.sendMail( {
					from: this.senderInfo,
					to: address,
					...mailOptions
				} );
				this.logger.info( InfoMessage.SUCCESS_SEND );
			} catch ( error ) {
				if ( retry ) {
					await sleep( retryWait );
					await sendMailFunc( mailOptions, retry - 1, retryWait );
				} else {
					this.logger.error( InfoMessage.ERROR_SEND + ( <Error>error ).message );
				}
			}
		};
		
		return sendMailFunc;
	}
	
	public async sendMaster(
		mailOptions: mail.SendMailOptions,
		retry: number = 3,
		retryWait: number = 180
	) {
		try {
			await this.sender.sendMail( {
				from: this.senderInfo,
				to: `${ this.config.master }@qq.com`,
				...mailOptions
			} );
			this.logger.info( InfoMessage.SUCCESS_SEND );
		} catch ( error ) {
			if ( retry ) {
				await sleep( retryWait );
				await this.sendMaster( mailOptions, retry - 1, retryWait );
			} else {
				this.logger.error( InfoMessage.ERROR_SEND + ( <Error>error ).message );
			}
		}
	}
}