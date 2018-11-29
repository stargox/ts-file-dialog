
export type AsyncCallBack<T> = {
	onStart?: () => void,
	onFinish?: () => void,
	onError?: (message) => void,
	onSuccess?: (response?: T) => void,
}

export type CallBackApi<T, M> = (callBack: AsyncCallBack<T>, options?: M) => void;

export type GetFilesApi = CallBackApi<Array<string>, any>;

export type OnConfirmApi = CallBackApi<any, { dir: string, name: string }>;

export type ModalOptions = {
	fileInfo?: {
		path?: string,
	},
	locale?: 'en' | 'zh' | 'ja',
	pathSeparator?: string,
	localizationMode?: string,
	ignoreCase?: boolean,
	confirmOnDoubleClick?: boolean,
	inputNotification?: boolean,
	extensions: Array<string>,
	onSuccess?: (saveResult: {
		path: string,
		id: string,
	}) => void,
	onClose?: () => void,
	api: {
		getFiles: () => Promise<Array<{
			path: string,
		}>>,
		confirm: (options: {
			path: string,
		}) => Promise<{ id: string }>,
	},
}
