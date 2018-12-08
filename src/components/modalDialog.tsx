import * as React from 'react';
import ReactModal from 'react-modal';

import { GetFilesApi, OnConfirmApi } from '../types';
import { ModalView, ModalViewProps } from './modalView';

export type ModalDialogProps = {
	ignoreCase: boolean,
	isOpen: boolean,
	confirmOnDoubleClick: boolean,
	inputNotification: boolean,
	defaultDir: string,
	defaultName: string,
	dialogId: string,
	getFiles: GetFilesApi,
	onClose: () => void;
	onConfirm: OnConfirmApi,
};

export type ModalDialogState = {
	isOpen: boolean,
	files: Array<string>,
	errorMessage: string,
	isLoading: boolean,
	isProcessing: boolean,
};

const DefaultModalStyle = {
	overlay: {
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
	},
};

const DefaultModalDialogState = {
	isOpen: false,
	files: [],
	errorMessage: '',
	isLoading: false,
	isProcessing: false,
};

export class ModalDialog extends React.Component<ModalDialogProps, ModalDialogState> {
	constructor(props) {
		super(props);
		this.state = {
			...DefaultModalDialogState,
			isOpen: props.isOpen,
		};
	}

	componentDidMount() {
		this.loadFiles();
	}

	componentWillReceiveProps(nextProps) {
		if (!this.state.isOpen && nextProps.isOpen) {
			this.setState({ isOpen: nextProps.isOpen });
			this.loadFiles();
		}
	}

	loadFiles = () => {
		this.props.getFiles(
			{
				onStart: () => this.setState({ isLoading: true }),
				onFinish: () => this.setState({ isLoading: false }),
				onSuccess: (files) => this.setState({ files }),
				onError: (errorMessage) => this.setState({ errorMessage }),
			}
		);
	}

	handleClose = () => {
		this.setState(DefaultModalDialogState);
		this.props.onClose();
	}

	handleConfirm = (dir, name) => {
		this.props.onConfirm(
			{
				onStart: () => this.setState({ isProcessing: true }),
				onFinish: () => this.setState({ isProcessing: false }),
				onError: (errorMessage) => this.setState({ errorMessage }),
				onSuccess: () => this.handleClose(),
			},
			{
				name,
				dir,
			},
		);
	}

	parentSelector = () => document.getElementById(this.props.dialogId);

	render() {
		const { getFiles, defaultDir, defaultName, ignoreCase, confirmOnDoubleClick, inputNotification } = this.props;
		const { isOpen, files, errorMessage, isLoading, isProcessing } = this.state;
		
		const reactModalProps = {
			className: 'file-dialog-modal-dialog',
			isOpen,
			ariaHideApp: false,
			onRequestClose: this.handleClose,
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
			onCancel: this.handleClose,
			onConfirm: this.handleConfirm,
			files,
			errorMessage,
			isLoading,
			isProcessing,
		};
		return (
			<ReactModal {...reactModalProps}>
				<ModalView {...fileViewProps} />
			</ReactModal>
		);
	}
}
