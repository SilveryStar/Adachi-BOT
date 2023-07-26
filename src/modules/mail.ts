import mail from "nodemailer";
import { BotConfig } from "@/modules/config";
import { Logger } from "log4js";
import { sleep } from "@/utils/async";
import { Client } from "@/modules/lib";

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
	private readonly name = "Adachi-BOT";
	
	constructor(
		private config: BotConfig,
		private client: Client
	) {
		this.sender = this.getSender();
		config.mail.on( "refresh", newCfg => {
			this.sender = this.getSender();
		} )
	}
	
	get senderInfo(): mail.SendMailOptions["from"] {
		return {
			name: this.name,
			address: `${ this.client.uin }@qq.com`
		}
	}
	
	private getSender() {
		const mailConfig = this.config.mail;
		return mail.createTransport( {
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
		} )
	}
	
	public getSendMailFunc( address: mail.SendMailOptions["to"] ) {
		const sendMailFunc = async ( mailOptions: mail.SendMailOptions, retry: number = 3, retryWait: number = 120 ) => {
			try {
				await this.sender.sendMail( {
					from: this.senderInfo,
					to: address,
					...mailOptions
				} );
				this.client.logger.info( InfoMessage.SUCCESS_SEND );
			} catch ( error ) {
				if ( retry ) {
					await sleep( retryWait );
					await sendMailFunc( mailOptions, retry - 1, retryWait );
				} else {
					this.client.logger.error( InfoMessage.ERROR_SEND + ( <Error>error ).message );
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
				to: `${ this.config.base.master }@qq.com`,
				...mailOptions
			} );
			this.client.logger.info( InfoMessage.SUCCESS_SEND );
		} catch ( error ) {
			if ( retry ) {
				await sleep( retryWait );
				await this.sendMaster( mailOptions, retry - 1, retryWait );
			} else {
				this.client.logger.error( InfoMessage.ERROR_SEND + ( <Error>error ).message );
			}
		}
	}
}