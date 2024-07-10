export default class Color {
	constructor(public r: number, public g: number,
		public b: number, public a: number) {}

	get hex(): string {
		function fm(x: number): string {
			return Math.min(255, Math.floor(x)).toString(16).padStart(2, "0");
		}

		return "#" + fm(this.r) + fm(this.g) + fm(this.b);
	}

	get rgba(): string {
		return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
	}

	get luminance(): number {
		return 0.2126*this.r + 0.7152*this.g + 0.0722*this.b;
	}

	lighten(v: number): Color {
		return new Color(this.r * v, this.g * v, this.b * v, this.a);
	}

	static fromString(value: string): (Color | null) {
		if (value.startsWith("#")) {
			const long = parseInt(value.substring(1), 16);
			const b = long & 0xFF;
			const g = (long >> 8) & 0xFF;
			const r = (long >> 16) & 0xFF;
			return new Color(r, g, b, 255);
		} else if (value.startsWith("rgba(")) {
			const re = /^rgba *\( *([0-9]+) *, *([0-9]+) *, *([0-9]+) *, *([0-9]+) *\) *$/;
			const matches = value.match(re);
			if (!matches) {
				return null;
			}

			const [ , r, g, b, a] = matches!;
			return new Color(parseInt(r), parseInt(g), parseInt(b), parseInt(a));
		}

		return null;
	}
}
