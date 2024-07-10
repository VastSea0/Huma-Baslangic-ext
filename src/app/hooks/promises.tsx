import { useEffect, useState } from "react";

/**
 * Runs promise and makes cancellable
 *
 * @param func Lambda to make promise
 * @param then If successful and not cancelled
 * @param reject If unsuccessful and not cancelled
 * @param dependents A list of dependent variables
 */
export function useRunPromise<T>(func: () => Promise<T>,
		then: (value: T) => void, reject: (reason: any) => void,
		dependents?: any[]): void {
	useEffect(() => {
		let cancelled = false;

		func().then((value) => {
			if (!cancelled) {
				then(value);
			}
		}).catch((reason) => {
			console.error(reason);
			if (!cancelled) {
				reject(reason);
			}
		});

		return () => {
			cancelled = true;
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, dependents);
}


/**
 * Runs promise and returns outputs as state
 *
 * @param func Lambda to make promise
 * @param dependents A list of dependent variables
 * @return {[result, error]]} - Result and error
 */
export function usePromise<T>(func: () => Promise<T>, dependents: any[]): [(T | null), (any | null)] {
	const [result, setResult] = useState<T | null>(null);
	const [error, setError] = useState<any | null>(null);
	useRunPromise(func, setResult, setError, dependents);
	return [result, error];
}
