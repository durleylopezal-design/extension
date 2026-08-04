/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './js/**/*.js'],
    safelist: [
        'hidden', 'rotate-180',
        { pattern: /^(bg|text|border)-(brand|accent|neutral|danger)-(50|100|200|300|400|500|600|700|800|900)$/ },
    ],
    theme: {
        extend: {
            colors: {
                // Turquesa institucional — color principal #1C7FA8
                brand: {
                    50:  '#F4F9FB',
                    100: '#E8F2F6',
                    200: '#D2E5EE',
                    300: '#B0D2E1',
                    400: '#8EBFD4',
                    500: '#1C7FA8',
                    600: '#1C6E91',
                    700: '#1C5D79',
                    800: '#1B4B62',
                    900: '#1B3A4A',
                },
                // Naranja institucional — color acento #F5821F
                accent: {
                    50:  '#FFF9F4',
                    100: '#FEF3E9',
                    200: '#FDE6D2',
                    300: '#FCD3B1',
                    400: '#FAC18F',
                    500: '#F5821F',
                    600: '#CA6B1A',
                    700: '#A05414',
                    800: '#753D0F',
                    900: '#4A2609',
                },
                // Gris neutro institucional — #C9CDCF
                neutral: {
                    50:  '#F9F9F9',
                    100: '#F0F2F3',
                    200: '#E1E4E5',
                    300: '#C9CDCF',
                    400: '#ABB0B3',
                    500: '#8B9094',
                    600: '#6B6F72',
                    700: '#4F5254',
                    800: '#3A3C3D',
                    900: '#2D2D2D',
                },
                // Verde de estado institucional
                success: '#2ECC71',
                // Coral — obligatorio, vencido, cruce de horario
                danger: {
                    50:  '#FDF0EF',
                    100: '#FBE1DE',
                    200: '#F5C2BB',
                    300: '#EFA394',
                    400: '#EC8873',
                    500: '#E96B5A',
                    600: '#C65B4D',
                    700: '#A34A3F',
                    800: '#7A3830',
                    900: '#502521',
                },
            }
        }
    },
    plugins: [],
};
