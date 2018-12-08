import * as React from 'react';
import * as _ from 'lodash';

import { GetFilesApi, OnConfirmApi } from '../types';
import { getString } from '../localization';
import Path from '../path';

import { FilesList } from './filesList';
import { DirPath } from './dirPath';

const l = (key) => getString(key);

const validate = (name) => {
	if (!name) return false;
	return name.search(/^(\.)|[<>\\:?*"\/|]/i) === -1;
};

export type ModalViewProps = {
	ignoreCase: boolean,
	confirmOnDoubleClick: boolean,
	inputNotification: boolean,
	defaultDir: string,
	defaultName: string,
	getFiles: GetFilesApi,
	onCancel: () => void,
	onConfirm: OnConfirmApi,
};

export type ModalViewState = {
	name: string;
	dir: string,
	files: Array<string>,
	filter: string,
	errorMessage: string,
	isLoading: boolean,
	isProcessing: boolean,
	isOverwrite: boolean,
};

export class ModalView extends React.Component<ModalViewProps, ModalViewState> {
	constructor(props) {
		super(props);
		this.state = {
			files: [],
			dir: props.defaultDir,
			name: props.defaultName,
			filter: '',
			errorMessage: '',
			isLoading: false,
			isProcessing: false,
			isOverwrite: false,
		};
	}

	isUnmounted: boolean;

	componentDidMount() {
		this.props.getFiles(
			{
				onStart: () => !this.isUnmounted && this.setState({ isLoading: true }),
				onFinish: () => !this.isUnmounted && this.setState({ isLoading: false }),
				onSuccess: (files) => {
					if (this.isUnmounted) return;

					this.setState({ files })
					this.updateOverwrite(files, this.state.dir, this.state.name);
				},
				onError: (errorMessage) => !this.isUnmounted && this.setState({ errorMessage }),
			}
		);
		this.isUnmounted = false;
	}

	componentWillUnmount() {
		this.isUnmounted = true;
	}

	setDir = (dir) => {
		this.setState({ dir });
		this.updateOverwrite(this.state.files, dir, this.state.name);
	}

	setName = (name) => {
		this.setState({ name });
		this.updateOverwrite(this.state.files, this.state.dir, name);
	}

	updateOverwrite = (files, dir, name) => {
		const { ignoreCase } = this.props;
		let path = Path.join(dir, name);
		path = Path.addExtension(path)
	
		if (ignoreCase) path = path.toLowerCase();
		const isOverwrite = files.some(f => ignoreCase ? f.toLowerCase() === path : f === path);

		if (this.state.isOverwrite !== isOverwrite) this.setState({ isOverwrite });
	};

	handleBackClick = () => {
		const { dir } = this.state;
		const updDir = Path.slice(dir, 0, -1)
		this.setDir(updDir);
	}

	handleCancelClick = () => {
		this.props.onCancel();
	}

	handleConfirmClick = () => {
		const { dir, name } = this.state;
		this.onConfirm(dir, name);
	}

	onConfirm = (dir, name) => {
		this.props.onConfirm(
			{
				onStart: () => !this.isUnmounted && this.setState({ isProcessing: true }),
				onFinish: () => !this.isUnmounted && this.setState({ isProcessing: false }),
				onError: (errorMessage) => !this.isUnmounted && this.setState({ errorMessage }),
			},
			{
				name,
				dir,
			},
		);
	}

	handleNameChange = (e) => {
		const updName = e.target.value;
		this.setName(updName);
	};

	handleSearchChange = (e) => {
		const updFilter = e.target.value;
		this.setState({ filter: updFilter.toLocaleLowerCase() })
	};

	handleClearFilterButtonClick = () => {
		this.setState({ filter: '' });
	}

	handlePathElementClick = (dirIndex) => () => {
		const { dir } = this.state;
		const updDir = Path.slice(dir, 0, dirIndex)
		this.setDir(updDir);
	}

	render() {
		const { dir, name, files, filter, isLoading, isProcessing, errorMessage, isOverwrite } = this.state;
		const { ignoreCase, confirmOnDoubleClick, inputNotification } = this.props; 

		const isValid = validate(name);

		const filesListProps = {
			files,
			dir,
			name,
			filter,
			ignoreCase,
			confirmOnDoubleClick,
			setDir: this.setDir,
			setName: this.setName,
			confirm: this.onConfirm,
		};

		const nameInputProps = {
			className: inputNotification && (!isValid && 'invalid' || isOverwrite && 'overwrite') || '',
			value: name,
			onChange: this.handleNameChange,
			autoFocus: true,
		};

		return (
			<div className="file-dialog-modal-view">
				<div className="file-dialog-modal-view-header">
					<span className="file-dialog-modal-view-header-title">{l('title')}</span>
					{errorMessage && <div className="file-dialog-modal-view-header-error">{errorMessage}</div>}
					{isProcessing && <div className="file-dialog-modal-view-header-alert">{l('processing')}</div>}
					<div className="file-dialog-modal-view-header-tools">
						<div className="file-dialog-modal-view-dir-buttons">
							<button onClick={this.handleBackClick} disabled={!dir}><i className="mdi mdi-arrow-left" /></button>
						</div>
						<div className="file-dialog-modal-view-dir-path">
							<DirPath dir={dir} setDir={this.setDir} />
						</div>
						<div className="file-dialog-modal-view-dir-search">
							<input onChange={this.handleSearchChange} value={filter} placeholder={l('search')}></input>
							{filter && <button onClick={this.handleClearFilterButtonClick} tabIndex={-1}><i className="mdi mdi-close" /></button>}
						</div>
					</div>
				</div>
				<div className="file-dialog-modal-view-body">
					<FilesList {...filesListProps} />
				</div>
				<div className="file-dialog-modal-view-footer">
					<div className="file-dialog-modal-view-footer-inputs">
						<div className="file-dialog-modal-view-footer-inputs-report-name">
							<span>{l('name')}</span>
							<input {...nameInputProps} />
							{inputNotification && isOverwrite &&
							<div className="file-dialog-modal-view-problem-container">
								<div className="warning">
									<i className="mdi mdi-alert-circle-outline" />
									<span>{l('willBeOverwritten')}</span>
								</div>
							</div>}
							{inputNotification && !isValid &&
							<div className="file-dialog-modal-view-problem-container">
								<div className="error">
									<i className="mdi mdi-alert-circle-outline" />
									<span title={l('invalidNameTooltip')}>{l('invalidName')}</span>
								</div>
							</div>}
						</div>
					</div>
					<div className="file-dialog-modal-view-footer-buttons">
						<button onClick={this.handleConfirmClick} disabled={!isValid} className="primary">{l('confirm')}</button>
						<button onClick={this.handleCancelClick}>{l('cancel')}</button>
					</div>
				</div>
				{isLoading &&
				<div className="loading-overlay">
					<div className="loader-circle"></div>
					<span>{l('gettingFiles')}</span>
				</div> || null}
			</div>
		);
	}
}
