/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html'],
    theme: {
        extend: {
            colors: {
                // Teal institucional — color principal #0080a4
                brand: {
                    50:  '#e5f4f8',
                    100: '#cce9f1',
                    200: '#99d3e3',
                    300: '#66bdd5',
                    400: '#33a7c7',
                    500: '#0080a4',
                    600: '#006683',
                    700: '#004d62',
                    800: '#003342',
                    900: '#001a21',
                },
                // Naranja institucional — color acento #f38e0e
                accent: {
                    50:  '#fef6ea',
                    100: '#fde9c7',
                    200: '#fbd38f',
                    300: '#f9bd57',
                    400: '#f7a72f',
                    500: '#f38e0e',
                    600: '#c9720b',
                    700: '#975608',
                    800: '#643905',
                    900: '#321d03',
                },
                // Gris neutro institucional — #b2babc
                neutral: {
                    50:  '#f0f2f3',
                    100: '#e1e5e6',
                    200: '#c3cbcd',
                    300: '#b2babc',
                    400: '#8e999b',
                    500: '#7a8689',
                    600: '#5e686a',
                    700: '#464e50',
                    800: '#2e3435',
                    900: '#171a1b',
                }
            }
        }
    },
    plugins: [],
};
