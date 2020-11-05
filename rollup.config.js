import strip from '@rollup/plugin-strip';
export default [
    {
        input: 'src/index.js',
        output:
            [
                {
                    file: 'dist/igv-widgets.js',
                    format: 'es'
                },
            ],
        plugins:
            [
                strip({ debugger: true, functions: ['console.log', 'assert.*', 'debug']})
            ]

    }
]
