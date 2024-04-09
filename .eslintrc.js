module.exports = {
    parser: '@typescript-eslint/parser', // Определяет парсер ESLint для TypeScript
    extends: [
        'plugin:react-hooks/recommended',
        'plugin:react/recommended', // Использует рекомендуемые правила из @eslint-plugin-react
        'plugin:@typescript-eslint/recommended', // Использует рекомендуемые правила из @typescript-eslint/eslint-plugin
        'plugin:import/typescript', // Обеспечивает поддержку для синтаксиса import/export для TypeScript
        'plugin:prettier/recommended', // Включает eslint-plugin-prettier и eslint-config-prettier. Это отображает правила prettier в виде ошибок ESLint.
    ],
    parserOptions: {
        ecmaVersion: 2018, // Позволяет использовать последние возможности ECMAScript
        sourceType: 'module', // Разрешает использование модулей import/export
        ecmaFeatures: {
            jsx: true, // Разрешает парсинг JSX
        },
    },
    settings: {
        react: {
            version: 'detect', // Автоматически определяет версию React для использования правил eslint-plugin-react
        },
    },
    plugins: ['react', '@typescript-eslint', 'react-hooks'],
    rules: {
        // Здесь можно добавить или переопределить правила eslint
        'react/react-in-jsx-scope': 'off', // Для новых версий React import React не нужен
        '@typescript-eslint/explicit-module-boundary-types': 'off', // Отключает предупреждение для функций без явного возвращаемого типа
        '@typescript-eslint/no-unused-vars': 'warn',
        'no-unused-vars': 'off',
        'react/prop-types': 'off', // Отключает правило проп-тайпс, так как в TypeScript используется статическая типизация.
    },
    overrides: [
        {
            // Включить правила ESLint для всех файлов TypeScript в вашем проекте
            files: ['*.ts', '*.tsx'],
            rules: {
                '@typescript-eslint/explicit-function-return-type': 'off', // Отключает требование явного возвращаемого типа у функций
            },
        },
    ],
    env: {
        browser: true, // Указывает, что код исполняется в браузере
        es6: true, // Поддержка новых инструкций ES6 (кроме модулей)
        node: true, // Указывает, что код может исполняться в Node.js
    },
};
