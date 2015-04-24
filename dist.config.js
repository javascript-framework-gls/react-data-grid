var webpack = require('webpack')

module.exports = {
    entry: './src/index.jsx',
    output: {
        path         : __dirname + '/dist',
        libraryTarget: 'umd',
        library      : 'DataGrid',
        filename     : 'react-datagrid.js'
    },
    module: {
        loaders: require('./loaders.config')
    },
    externals: {
        'react': 'React'
    },
    plugins: [
        new webpack.IgnorePlugin(/vertx/)
    ],
    resolve: {
        // Allow to omit extensions when requiring these files
        extensions: ['', '.js', '.jsx']
    }
}