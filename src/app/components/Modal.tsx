import { mergeClasses } from "app/utils";
import uuid from "app/utils/uuid";
import React, { CSSProperties, ReactNode, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { useIntl } from "react-intl";

export interface ModalProps {
	title: string;
	onClose?: () => void;
	children: ReactNode[] | ReactNode;
	lighterBg?: boolean;
	wide?: boolean;
	tall?: boolean;
}

export default function Modal(props: ModalProps) {
	const intl = useIntl();
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		window.requestAnimationFrame(() => setMounted(true));
	}, []);

	const [didClickBegin, setDidClickBegin] = useState(false);

	const style: CSSProperties = {};
	if (mounted) {
		style.opacity = 1;
	}

	useEffect(() => {
		function close(e: KeyboardEvent) {
			if (e.key == "Escape" && props.onClose) {
				props.onClose()
			}
		}

		window.addEventListener('keydown', close);
		return () => window.removeEventListener('keydown', close);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.onClose]);


	function handleMouseDown() {
		setDidClickBegin(true);
	}

	function handleMouseUp() {
		if (didClickBegin && props.onClose) {
			props.onClose();
		}
		setDidClickBegin(false);
	}

	const modalTitleId = useMemo(() => `modal-title-${uuid()}`, []);

	const bgClasses = mergeClasses("modal-bg",
		props.lighterBg && "modal-bg-lighter");

	return ReactDOM.createPortal((
		<aside className={bgClasses} onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp} style={style}>
			<div className={mergeClasses("flush modal",
					props.wide === true && "modal-wide", props.tall == true && "modal-tall")}
					onMouseDown={(e) => e.stopPropagation()}
					onMouseUp={(e) => e.stopPropagation()}
					role="dialog" aria-modal={true}
					aria-labelledby={modalTitleId}>
				<div className="modal-header">
					<h2 id={modalTitleId}>{props.title}</h2>
					{props.onClose && (
						<button className="btn modal-close" onClick={props.onClose}
								aria-label={intl.formatMessage({ defaultMessage: "Close" })}>
							<i className="fas fa-times" />
						</button>)}
				</div>
				{props.children}
			</div>
		</aside>
	), document.getElementById("modal-root")!);
}
