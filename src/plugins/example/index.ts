import { CommonMessageEventData as Message } from "oicq";

function main( message: Message, sendMessage: ( content: string ) => any ): void {
	sendMessage( message.raw_message );
}

export { main }