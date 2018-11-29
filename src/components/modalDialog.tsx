import * as React from 'react';
import ReactModal from 'react-modal';

import { GetFilesApi, OnConfirmApi } from '../types';
import { ModalView, ModalViewProps } from './modalView';


export type ModalDialogProps = {
	ignoreCase: boolean,
	confirmOnDoubleClick: boolean,
	inputNotification: boolean,
	defaultDir: string,
	defaultName: string,
	dialogId: string,
	getFiles: GetFilesApi,
	onClose: () => void;
	onCancel: () => void;
	onConfirm: OnConfirmApi,
};

const DefaultModalStyle = {
	overlay: {
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
	},
};

export class ModalDialog extends React.Component<ModalDialogProps> {

	parentSelector = () => document.getElementById(this.props.dialogId);

	render() {
		const { getFiles, defaultDir, defaultName, onCancel, onClose, onConfirm, ignoreCase, confirmOnDoubleClick, inputNotification } = this.props;
		
		const reactModalProps = {
			className: 'file-dialog-modal-dialog',
			isOpen: true,
			ariaHideApp: false,
			onRequestClose: onClose,
			parentSelector: this.parentSelector,
			style: DefaultModalStyle,
		};
		const fileViewProps: ModalViewProps = {
			defaultDir,
			defaultName,
			ignoreCase,
			confirmOnDoubleClick,
			inputNotification,
			getFiles,
			onCancel,
			onConfirm,
		};
		return (
			<ReactModal {...reactModalProps}>
				<ModalView {...fileViewProps} />
			</ReactModal>
		);
	}
}
