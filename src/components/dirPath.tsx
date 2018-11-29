import * as React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';

import Path from '../path';

export type DirPathProps = {
	dir: string,
	setDir: (path: string) => void,
};

export type DirPathState = {
	hover: boolean,
	scrolling: boolean,
};

export class DirPath extends React.Component<DirPathProps, DirPathState> {

	constructor(props) {
		super(props);
		this.state = {
			hover: false,
			scrolling: false,
		};
	}

	handlePathElementClick = (dirIndex) => () => {
		const { dir, setDir } = this.props;
		const updDir = Path.slice(dir, 0, dirIndex);
		setDir(updDir);
	}

	scrollBar: any = null;

	handleWheel = (e) => {
		const target = this.scrollBar;
		if (target) {
			const scrollLeft = target.getScrollLeft() || 0;
			const delta = e.deltaY || 0;
			target.scrollLeft(scrollLeft + delta);
		}
		e.stopPropagation();
	}

	handleMouseEnterAdorner = () => {
		if (!this.state.hover) this.setState({ hover: true });
	}

	handleMouseLeaveAdorner = () => {
		if (this.state.hover) this.setState({ hover: false });
	}

	handleScrollStart = () => {
		if (!this.state.scrolling) this.setState({ scrolling: true });
	}

	handleScrollStop = () => {
		if (this.state.scrolling) this.setState({ scrolling: false });
	}

	setRef = ref => {
		this.scrollBar = ref;
	}

	render() {
		const { hover, scrolling } = this.state;
		const { dir } = this.props;

		const pathParts = Path.split(dir);
		const pathElements = [
			<div key={"pathRoot"} className="file-dialog-dir-path-element" onClick={this.handlePathElementClick(0)}>
				<i className="mdi mdi-server-network" />
			</div>,
		];
		pathParts.forEach((pathPart, idx) => {
			pathElements.push(
				<div key={`pathSplit_${idx}`} className="file-dialog-dir-path-splitter" >
					<i className="mdi mdi-menu-right" />
				</div>,
				<div key={`pathElement_${idx}`} className="file-dialog-dir-path-element" onClick={this.handlePathElementClick(idx + 1)}>
					{pathPart}
				</div>,
			);
		});

		const scrollContainer = ({ style, ...props }) => <div {...props} className="scroll-container" />;

		const scrollTrackHorizontal = ({ style, ...props }) => {
			const customStyle = {
				opacity: (hover || scrolling) ? '1' : '0',
				height: '4px',
			};
			return <div {...props} style={{ ...style, ...customStyle }} className="horizontal-scroll-track" />;
		};

		const panelProps = {
			onWheel: this.handleWheel,
			className: 'file-dialog-dir-path',
			onMouseEnter: this.handleMouseEnterAdorner,
			onMouseLeave: this.handleMouseLeaveAdorner,
		}

		const scrollBarsProps = {
			renderView: scrollContainer,
			renderTrackHorizontal: scrollTrackHorizontal,
			onScrollStart: this.handleScrollStart,
			onScrollStop: this.handleScrollStop,
			hideTracksWhenNotNeeded: true,
			ref: this.setRef,
		};
		return (
			<div {...panelProps}>
				<Scrollbars {...scrollBarsProps}>
					{pathElements}
				</Scrollbars>
			</div>
		);
	}
}
