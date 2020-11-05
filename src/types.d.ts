export interface pickDefined {
	<T, K extends keyof T>(obj: T, key: K[]): Partial<T>
}