import React from "react";
import { render } from "react-dom";
import App from "./components/App";
import { isSentryEnabled } from "./storage";
import "./scss/main.scss";
import { getFeedbackURL } from "./utils/webext";

import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";


Sentry.init({
	enabled: config.SENTRY_DSN !== undefined,
	dsn: config.SENTRY_DSN,
	integrations: [
		new Integrations.BrowserTracing({
			tracingOrigins: [new URL(config.API_URL).host],
		})
	],

	debug: app_version.is_debug,
	environment: app_version.environment,
	release: `renewedtab@${app_version.version}`,

	beforeSend(event) {
		const exceptions = event.exception?.values ?? [];

		// Drop expected UserError exceptions
		if (exceptions.some(x => x.type == "UserError")) {
			return null;
		}

		const whitelistedMessages = [
			"ResizeObserver loop completed with undelivered notifications",
			"ResizeObserver loop limit exceeded",
		];
		if (exceptions.some(x => x.value && whitelistedMessages.some(y => x.value!.includes(y)))) {
			return null;
		}

		if (!isSentryEnabled()) {
			return null;
		}

		return event;
	},

	beforeBreadcrumb(crumb) {
		if (crumb.type !== "http") {
			return crumb;
		}

		try {
			const url = new URL(crumb.data!.url);
			for (const key of ["lat", "long"]) {
				if (url.searchParams.has(key)) {
					url.searchParams.set(key, "*****");
				}
			}

			crumb.data!.url = url.toString();
		} catch (e) {
			console.error(e);
		}

		return crumb;
	},
});

render(
	<App />,
	document.getElementById("app")
);


import { library, dom } from '@fortawesome/fontawesome-svg-core'
import {
	faPlus, faCog, faTimes, faPen, faTrash, faCaretUp, faCaretDown,
	faCaretLeft, faCaretRight, faEllipsisH, faCircle, faGlobeEurope, faBan,
	faThumbsUp, faQuestionCircle, faGripVertical, faLanguage, faTint, faSun,
	faWind, faLongArrowAltRight, faClone, faSearch, faUmbrella,
	faCircleQuestion, faQuestion, faCheck, faFolder, faGrip, faImage,
	faPaintBrush, faRightLeft
} from '@fortawesome/free-solid-svg-icons'

library.add(faPlus, faCog, faTimes, faPen, faTrash, faCaretUp, faCaretDown,
	faCaretLeft, faCaretRight, faEllipsisH, faCircle, faGlobeEurope, faBan,
	faThumbsUp, faCheck, faQuestionCircle, faGripVertical,
	faLanguage, faTint, faSun, faWind, faLongArrowAltRight, faClone, faSearch,
	faUmbrella, faCircleQuestion, faQuestion, faFolder, faGrip, faImage,
	faPaintBrush, faRightLeft);
dom.watch();


if (typeof browser !== "undefined") {
	async function setUninstallURL() {
		browser.runtime.setUninstallURL(await getFeedbackURL("uninstall"));
	}

	setUninstallURL().catch(console.error);
}
