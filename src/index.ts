import * as React from 'react';
import { render } from 'react-dom';

import { ModalOptions, AsyncCallBack } from './types'
import { ModalDialog, ModalDialogProps } from './components';
import Path, { setPathSeparator } from './path';

import './styles';

const asyncCall = (fn: () => Promise<any>, callBack: AsyncCallBack<any> = {}, responseConverter = (r) => r) => {
	if (callBack.onStart) callBack.onStart();
	Promise.resolve(fn())
		.then(response => {
			if (callBack.onSuccess) callBack.onSuccess(responseConverter(response));
		})
		.catch(message => {
			if (callBack.onError) callBack.onError(message);
		})
		.then(() => {
			if (callBack.onFinish) callBack.onFinish();
		});
};

function createFileDialog(id: string, options: ModalOptions) {

	setPathSeparator(options.pathSeparator, options.extensions);

	const ignoreCase = options.ignoreCase === undefined ? true : options.ignoreCase;
	const confirmOnDoubleClick = options.confirmOnDoubleClick === undefined ? false : options.confirmOnDoubleClick;
	const inputNotification = options.inputNotification === undefined ? true : options.inputNotification;

	const filePath = options.fileInfo && options.fileInfo.path || '';
	const defaultDir = Path.getDirName(filePath);
	const defaultName = Path.getFileName(filePath);

	const modalDialogProps: React.Attributes & ModalDialogProps = {
		key: Math.random(), // recreate component on each call to cleanup states
		dialogId: id,
		ignoreCase,
		confirmOnDoubleClick,
		inputNotification,
		defaultDir: defaultDir,
		defaultName: defaultName,

		getFiles: (callBack) => {
			asyncCall(
				() => options.api.getFiles(),
				callBack,
				filesList => filesList.map(r => r.path),
			);
		},
		onClose: options.onClose,
		onCancel: options.onClose,
		onConfirm: (callBack, { dir, name }) => {
			const path = Path.addExtension(Path.join(dir, name));
			asyncCall(
				() => options.api.confirm({ path }),
				{
					onStart: callBack.onStart,
					onError: (message) => {
						if (callBack.onError) callBack.onError(message);
						if (callBack.onFinish) callBack.onFinish();
					},
					onSuccess: ({ id }) => {
						if (callBack.onSuccess) callBack.onSuccess();
						if (callBack.onFinish) callBack.onFinish();
						if (options.onSuccess) options.onSuccess({ id, path });
					},
				}
			);
		},
	};

	render(React.createElement(ModalDialog, modalDialogProps), document.getElementById(id));
}

module.exports = {
	create: createFileDialog,
};
