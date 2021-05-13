import { addPlugin } from "../../modules/plugin";
import { MessageAllow } from "../../modules/message";
import { AuthLevel } from "../../modules/auth";

function init(): any {
	return addPlugin( "example", MessageAllow.Both, {
		docs: "样例 | #example",
		regexp: [ "^#example" ],
		authLimit: AuthLevel.User
	} );
}

export { init }