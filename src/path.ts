const defaultPathSeparator = '/';
const defaultExtensions = [];
let pathSeparator = defaultPathSeparator;
let availableExtensions = defaultExtensions;

export const setPathSeparator = (separator: string, extensions: Array<string>) => {
	if (typeof separator === 'string' && separator.length) {
		pathSeparator = separator;
	}
	if (extensions && extensions.length) {
		availableExtensions = extensions;
	}
};

const split = (path: string): Array<string> => path.length ? path.split(pathSeparator) : [];
const slice = (path: string, start?, end?): string => {
	const pathParts = split(path);
	const updPath = pathParts.slice(start, end).join(pathSeparator);
	return updPath;
};
const join = (...pathParts: Array<string>): string => {
	return pathParts.filter(p => !!p).join(pathSeparator);
};

const addExtension = (path: string): string => {
	if (!availableExtensions.length) return path;
	const hasExtension = availableExtensions.some(e => path.indexOf(e, path.length - e.length) !== -1);
	const updPath = hasExtension ? path : path + availableExtensions[0];
	return updPath;
};

const getDirName = (path: string): string => {
	if (!path.length) return '';
	const pathParts = split(path);
	if (pathParts.length <= 1) return '';
	return slice(path, 0, -1);
}

const getFileName = (path: string): string => {
	if (!path.length) return '';
	const pathParts = split(path);
	return pathParts[pathParts.length - 1];
}

export default {
	split,
	slice,
	join,
	addExtension,
	getDirName,
	getFileName,
};
