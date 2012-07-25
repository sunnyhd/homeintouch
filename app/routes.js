var helpers = require('../lib/helpers');
var controllers = helpers.autoload(__dirname + '/controllers');

module.exports = function(app) {
    app.get('/', controllers.main.index);

    app.put('/api/homes/:home', controllers.homes.update);
    app.del('/api/homes/:home', controllers.homes.destroy);

    app.post('/api/commands', controllers.commands.create);

    app.get('/api/volume', controllers.volume.show);

    app.get('/api/movies', controllers.movies.index);

    app.get('/api/artists', controllers.artists.index);
    app.get('/api/artists/:artist', controllers.artists.show);

    app.get('/api/albums', controllers.albums.index);
    app.get('/api/albums/:album', controllers.albums.show);

    app.get('/api/songs', controllers.songs.index);

    app.get('/api/playlists', controllers.playlists.index);

    app.get('/api/playlists/:playlist/items', controllers.playlistitems.index);
    app.post('/api/playlists/:playlist/items', controllers.playlistitems.create);
    app.del('/api/playlists/:playlist/items/:index', controllers.playlistitems.destroy);

    app.get('/api/players', controllers.players.index);
    app.post('/api/players', controllers.players.create);
    app.get('/api/players/:player', controllers.players.show);
    app.del('/api/players/:player', controllers.players.destroy);

    app.get('/api/imports', controllers.imports.show);
    app.post('/api/imports', controllers.imports.create);

    app.get('/api/images/:image', controllers.images.show);
};