import { MessageType } from "@modules/message";

export default function idParser( id: string ): [ MessageType, number ] {
	const char: string = id[0].toLowerCase();
	const num: number = parseInt( id.slice( 1 ) );
	const type = char === "u" ? MessageType.Private : MessageType.Group;
	return [ type, num ];
}