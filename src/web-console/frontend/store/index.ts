import { createPinia } from "pinia";
import { useAppStore } from "./modules/app";
import { useUserStore } from "./modules/user";

function createStore() {
	const pinia = createPinia();
	useAppStore( pinia );
	useUserStore( pinia );
	return pinia;
}

export {
	createStore,
	useAppStore,
	useUserStore
}