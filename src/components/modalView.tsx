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
	onConfirm: (dir: string, name: string) => void,
	files: Array<string>,
	errorMessage: string,
	isLoading: boolean,
	isProcessing: boolean,
};

export type ModalViewState = {
	name: string;
	dir: string,
	filter: string,
	isOverwrite: boolean,
};

export class ModalView extends React.PureComponent<ModalViewProps, ModalViewState> {
	constructor(props) {
		super(props);
		this.state = {
			dir: props.defaultDir,
			name: props.defaultName,
			filter: '',
			isOverwrite: false,
		};
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.files !== nextProps.files) this.updateOverwrite(nextProps.files, this.state.dir, this.state.name);
	}

	setDir = (dir) => {
		this.setState({ dir });
		this.updateOverwrite(this.props.files, dir, this.state.name);
	}

	setName = (name) => {
		this.setState({ name });
		this.updateOverwrite(this.props.files, this.state.dir, name);
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
		this.props.onConfirm(dir, name);
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
		const { dir, name, filter, isOverwrite } = this.state;
		const { ignoreCase, confirmOnDoubleClick, inputNotification, files, isLoading, isProcessing, errorMessage, onConfirm } = this.props; 

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
			confirm: onConfirm,
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
