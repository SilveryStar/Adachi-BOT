import { Adachi, master } from "../bot";

enum MessageAllow {
	Neither,
	Group = 1 << 0,
	Private = 1 << 1,
	Both = Group | Private
}

enum MessageType {
	Group,
	Private
}

function getSendMessageFunc( targetID: number, type: MessageType ): any {
	if ( type === MessageType.Private ) {
		return function ( content: string ): any {
			return Adachi.sendPrivateMsg( targetID, content );
		}
	} else if ( type === MessageType.Group ) {
		return function ( content: string ): any {
			return Adachi.sendGroupMsg( targetID, content );
		}
	}
}

async function sendMaster( content: string ): Promise<void> {
	await Adachi.sendPrivateMsg( master, content );
}

export {
	MessageAllow,
	MessageType,
	getSendMessageFunc,
	sendMaster
}