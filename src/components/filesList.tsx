import * as React from 'react';
import * as _ from 'lodash';

import Path from '../path';

export type FileInfo = {
	type: string,
	name: string,
}

export type FilesListState = {
	selected: FileInfo;
	filesInfo: Array<FileInfo>
};

export type FilesListProps = {
	files: Array<string>,
	filter: string,
	setDir: (dir: string) => void,
	setName: (name: string) => void,
	confirm: (dir: string, name: string) => void,
	name: string,
	dir: string,
	ignoreCase: boolean,
	confirmOnDoubleClick: boolean,
};

const ELEMENT_TYPE = {
	FOLDER: 'folder',
	DOCUMENT: 'document',
};

const getName = (x) => x && x.name || '';
const byNameComparer = (a, b) => getName(a).localeCompare(getName(b));
const sortByName = (items) => [...(items || [])].sort(byNameComparer);

function getDirFilesInfo(files: Array<string>, dir: string) {
	const dirPathParts = Path.split(dir);
	const dirFiles = files.filter(p => p.indexOf(dir) === 0 && p !== dir);

	const foldersInfo = [];
	const documentsInfo = [];

	const addItem = (info, { name, type }) => {
		if (!info.some(f => f.name === name && f.type === type)) {
			info.push({ name, type });
		}
	};

	dirFiles.forEach(path => {
		const pathParts = Path.split(path);
		const isSubElement = pathParts.length > dirPathParts.length && dirPathParts.every((dirPathPart, idx) => pathParts[idx] === dirPathPart);
		if (!isSubElement) return;

		const relPathParts = pathParts.slice(dirPathParts.length);
		const name = relPathParts[0];
		const type = relPathParts.length > 1 ? ELEMENT_TYPE.FOLDER : ELEMENT_TYPE.DOCUMENT;
		addItem(type === ELEMENT_TYPE.FOLDER ? foldersInfo : documentsInfo, { name, type });
	});

	const dirFilesInfo = [...sortByName(foldersInfo), ...sortByName(documentsInfo)];
	return dirFilesInfo;
}

function getFilteredFilesInfo(files: Array<string>, filter: string) {
	let filesInfo = files.map(path => ({
		type: ELEMENT_TYPE.DOCUMENT,
		name: path,
	}));
	filesInfo = filter ? filesInfo.filter(f => _.includes(f.name.toLocaleLowerCase(), filter)) : filesInfo;

	filesInfo = sortByName(filesInfo);

	return filesInfo;
}

function getFilesInfo(files: Array<string>, dir: string, filter: string) {
	return filter ? getFilteredFilesInfo(files, filter) : getDirFilesInfo(files, dir);
}

const getIcon = (type) => {
	switch (type) {
		case ELEMENT_TYPE.DOCUMENT:
			return 'mdi mdi-file-document';
		case ELEMENT_TYPE.FOLDER:
			return 'mdi mdi-folder-outline';
		default: return '';
	}
}

export class FilesList extends React.Component<FilesListProps, FilesListState> {
	constructor(props) {
		super(props);
		this.state = {
			selected: {
				type: ELEMENT_TYPE.DOCUMENT,
				name: Path.addExtension(props.name),
			},
			filesInfo: getFilesInfo(props.files, props.dir, props.filter),
		};
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.name !== nextProps.name || this.props.dir !== nextProps.dir || this.props.filter && !nextProps.filter || !this.props.filter && nextProps.filter) {
			const nameWithExtension = Path.addExtension(nextProps.name);
			this.setState({
				selected: {
					type: ELEMENT_TYPE.DOCUMENT,
					name: nextProps.filter ? Path.join(nextProps.dir, nameWithExtension) : nameWithExtension,
				},
			});
		}

		if (this.props.files !== nextProps.files || this.props.dir !== nextProps.dir || this.props.filter !== nextProps.filter) {
			this.setState({
				filesInfo: getFilesInfo(nextProps.files, nextProps.dir, nextProps.filter),
			})
		}
	}

	handleClick = (fileInfo: FileInfo) => () => {
		if (fileInfo.type === ELEMENT_TYPE.DOCUMENT) {
			if (this.props.filter) {
				const fDir = Path.getDirName(fileInfo.name);
				const fName = Path.getFileName(fileInfo.name);
				this.props.setDir(fDir);
				this.props.setName(fName);
			}
			else {
				this.props.setName(fileInfo.name);
			}
		}
		else if (fileInfo.type === ELEMENT_TYPE.FOLDER) {
			this.setState({ selected: fileInfo })
		}
	}

	handleDoubleClick = (fileInfo: FileInfo) => () => {
		const { setName, setDir, dir, confirmOnDoubleClick, confirm, filter } = this.props;
		if (fileInfo.type === ELEMENT_TYPE.DOCUMENT) {
			if (filter) {
				const fDir = Path.getDirName(fileInfo.name);
				const fName = Path.getFileName(fileInfo.name);
				if (confirmOnDoubleClick) {
					confirm(fDir, fName)
				}
				else {
					this.props.setDir(fDir);
					this.props.setName(fName);
				}
			}
			else {
				if (confirmOnDoubleClick) {
					confirm(dir, fileInfo.name)
				}
				else {
					setName(fileInfo.name);
				}
			}
		}
		else if (fileInfo.type === ELEMENT_TYPE.FOLDER) {
			setDir(Path.join(dir, fileInfo.name));
		}
	}

	isSameFile = (file1: FileInfo, file2: FileInfo) => {
		const { ignoreCase } = this.props;
		if (file1.type !== file2.type) return false;
		if (ignoreCase) return file1.name.toLowerCase() === file2.name.toLowerCase();
		return file1.name === file2.name;
	}

	render() {
		const { filter } = this.props;
		const { selected, filesInfo } = this.state;

		const createLabel = (text: string) => {
			const startPosition = text.toLowerCase().indexOf(filter.toLowerCase());
			if (!filter || startPosition < 0) return (<span>{text}</span>);
		
			const endPosition = startPosition + filter.length;
			return (
				<span>
					{text.substring(0, startPosition)}
					<b>{text.substring(startPosition, endPosition)}</b>
					{text.substring(endPosition)}
				</span>
			);
		};

		const createListFile = (f: FileInfo, idx) => {
			const isSelected = selected && this.isSameFile(selected, f)
			const itemProps = {
				key: `${f.name}.${idx}`,
				title: f.name,
				className: `file-dialog-files-list-element ${isSelected ? ' selected' : ''}`,
				onClick: this.handleClick(f),
				onDoubleClick: this.handleDoubleClick(f),
			};
			return (
				<div {...itemProps}>
					<i className={getIcon(f.type)}/>
					{createLabel(f.name)}
				</div>
			);
		};

		return (
			<div className="file-dialog-files-list">
				{filesInfo.map((e, idx) => createListFile(e, idx))}
			</div>
		);
	}
}
