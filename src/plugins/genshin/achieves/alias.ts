import { CommonMessageEventData as Message } from "oicq";
import { aliasClass, typeData } from "../init";
import { Redis } from "../../../bot";

async function main( sendMessage: ( content: string ) => any, message: Message ): Promise<void> {
	const [ operation, name, alias ] = message.raw_message.split( " " );
	
	const nameList: string[] = typeData.getNameList();
	if ( !nameList.some( el => el === name ) ) {
		await sendMessage( `不存在名称为「${ name }」的角色或武器，若确认名称输入无误，请前往 github.com/SilveryStar/Ada.chi-BOT 进行反馈` );
		return;
	}
	
	if ( operation === "add" ) {
		const added: string[] = await Redis.getList( `silvery-star.alias-add-${ name }` );
		if ( added.some( el => el === alias ) || aliasClass.search( alias ) !== undefined ) {
			await sendMessage( `别名「${ alias }」已存在` );
			return;
		}
		
		aliasClass.addPair( alias, name );
		await Redis.addListElement( `silvery-star.alias-add-${ name }`, alias );
		await Redis.delListElement( `silvery-star.alias-remove`, alias );
	} else if ( operation === "remove" ) {
		const removed: string[] = await Redis.getList( "silvery-star.alias-remove" );
		if ( removed.some( el => el === alias ) ) {
			await sendMessage( `别名「${ alias }」已被删除` );
			return;
		}
		
		aliasClass.removeAlias( alias );
		await Redis.addListElement( `silvery-star.alias-remove`, alias );
		await Redis.delListElement( `silvery-star.alias-add-${ name }`, alias );
	}
	
	await sendMessage( `别名${ operation === "add" ? "添加" : "删除" }成功` );
	return;
}

export { main }