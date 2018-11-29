const RESOURCES = {
	"cancel": "Cancel",
	"confirm": "Confirm",
	"gettingFiles": "Getting Files...",
	"invalidName": "File name is not valid.",
	"invalidNameTooltip": "Please do not use restricted symbols '<', '>', '\\', ':', '?', '*', '/', '|', '\"' and do not use '.' as the first symbol.",
	"name": "File Name",
	"processing": "Processing...",
	"search": "Enter file name...",
	"title": "File Dialog",
	"willBeOverwritten": "File will be overwritten."
};

export const getString = (key) => RESOURCES[key] || '???';
