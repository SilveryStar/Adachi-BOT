/* 通用封装 ajax 请求类 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CreateAxiosDefaults } from "axios";

export type FetchGetMethod = "get" | "delete";
export type FetchPostMethod = "post" | "put";
export type FetchMethod = FetchGetMethod | FetchPostMethod;

export type FetchUrlFormat = ( url: string ) => string | Record<string, any>;
export interface FetchRequest<T = AxiosResponse> {
	<D = any>( params?: D, config?: AxiosRequestConfig<D> ): Promise<T>;
	<D = any>( params?: D, urlFormat?: FetchUrlFormat, config?: AxiosRequestConfig<D> ): Promise<T>;
}
export type FetchServer<T extends string | number | symbol, D = AxiosResponse> = Record<T, Record<FetchMethod, FetchRequest<D>>>;

export function register<T extends Record<string, string>>( baseConfig: CreateAxiosDefaults, apis: T ) {
	const server: AxiosInstance = createServer( baseConfig );
	return {
		request: getHttps( apis, server ),
		server
	}
}

function createServer( config?: CreateAxiosDefaults ): AxiosInstance {
	return axios.create( config );
}

function getServer<T = any, D = any>( server: AxiosInstance, url: string, params?: D, method: FetchMethod = "get", config: AxiosRequestConfig<D> = {} ): Promise<T> {
	const paramsField = [ "get", "delete" ].includes( method ) ? "params" : "data"
	const serverConfig = {
		url,
		method,
		[paramsField]: params,
		...config
	}
	return server( serverConfig ) as any;
}

function getHttps<T extends Record<string, string>>( apis: T, server: AxiosInstance ): FetchServer<keyof typeof apis> {
	return <FetchServer<keyof typeof apis>>new Proxy( {}, {
		get( target: {}, p: string ): Record<FetchMethod, FetchRequest> {
			return <Record<FetchMethod, FetchRequest>>new Proxy( {}, {
				get( target: {}, m: FetchMethod ): FetchRequest {
					return <T = any, D = any>( params?: D, urlFormat?: FetchUrlFormat | AxiosRequestConfig<D>, config: AxiosRequestConfig<D> = {} ) => {
						let url: string = apis[p];
						if ( typeof urlFormat === "function" ) {
							const format = urlFormat( apis[p] );
							if ( typeof format === "string" ) {
								url = format;
							} else {
								config.params = format;
							}
							return getServer<T, D>( server, url, params, m, config );
						}
						return getServer<T, D>( server, url, params, m, urlFormat );
					}
				}
			} )
		}
	} );
}