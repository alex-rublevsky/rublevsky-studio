export interface Country {
	code: string;
	name: string;
}

export const COUNTRIES: Record<string, Country> = {
	CA: {
		code: "CA",
		name: "🇨🇦 Canada",
	},
	RU: {
		code: "RU",
		name: "🇷🇺 Russia",
	},
	CA_OR_RU: {
		code: "CA_OR_RU",
		name: "🇨🇦 Canada or 🇷🇺 Russia",
	},
} as const;

export const COUNTRY_OPTIONS = [
	{ code: "NONE", name: "Not specified" }, // Empty option
	...Object.values(COUNTRIES),
];

export const getCountryByCode = (code: string): Country | undefined => {
	if (code === "NONE" || code === "") {
		return { code: "NONE", name: "Not specified" };
	}
	return COUNTRIES[code];
};

export const getCountryDisplayName = (code: string): string => {
	const country = getCountryByCode(code);
	return country ? country.name : code;
};
