export interface PluginConfig {
	name: string;
	plugin: string;
	configs: Array<{
		name: string;
		data: string;
	}>;
}