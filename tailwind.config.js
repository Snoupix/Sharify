/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors')

module.exports = {
	content: ["./app/**/*.{ts,tsx}"],
	theme: {
		colors: {
			'bg-color': '#24004C',
			'main-color': '#7a007a',
			'main-color-hover': '#7a007aad',
			slate: colors.slate,
			indigo: colors.indigo,
			red: colors.red,
		},
		fontFamily: {
			kaushan: ['Kaushan Script', 'Montserrat', 'cursive', 'sans-serif']
		},
		extend: {
			boxShadow: {
				'backRight': '8px 8px 10px',
				'around': '0 0 25px',
			},
		},
	},
	plugins: [],
}
