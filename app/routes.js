var helpers = require('../lib/helpers');
var controllers = helpers.autoload(__dirname + '/controllers');

module.exports = function(app) {
    app.get('/', controllers.main.index);

    app.get('/api/jdigiclock/proxy', controllers.jdigiclock.proxy);

    app.put('/api/homes/:home', controllers.homes.update);
    app.del('/api/homes/:home', controllers.homes.destroy);

    app.post('/api/commands', controllers.commands.create);

    app.get('/api/volume', controllers.volume.show);

    app.get('/api/media/refresh', controllers.imports.refresh);
    app.get('/api/media/config', controllers.mediaconfigs.list);
    app.get('/api/media/config/:configid', controllers.mediaconfigs.get);
    app.post('/api/media/config', controllers.mediaconfigs.create);
    app.put('/api/media/config', controllers.mediaconfigs.save);

    app.get('/api/db/config', controllers.settings.get);
    app.post('/api/db/config', controllers.settings.save);

    app.get('/api/movies', controllers.movies.index);    
    app.get('/api/movies/last/:n', controllers.movies.lastN);
    app.get('/api/movies/:movieid', controllers.movies.get);
    app.get('/api/genres/movies', controllers.movies.genres);
    app.get('/api/years/movies', controllers.movies.years);

    app.get('/api/tvshows', controllers.tvshows.index);
    app.get('/api/tvshows/:tvshow', controllers.tvshows.show);
    app.get('/api/genres/tvshows', controllers.tvshows.genres);

    app.get('/api/seasons', controllers.seasons.index);
    app.get('/api/seasons/:tvshow/:season', controllers.seasons.show);

    app.get('/api/episodes', controllers.episodes.index);
    app.get('/api/episodes/last/:n', controllers.episodes.lastN);
    app.get('/api/episodes/label', controllers.episodes.label);

    app.get('/api/artists', controllers.artists.index);
    app.get('/api/artists/:artist', controllers.artists.show);
    app.get('/api/genres/artists', controllers.artists.genres);

    app.get('/api/albums', controllers.albums.index);
    app.get('/api/albums/:album', controllers.albums.show);
    app.get('/api/albums/last/:n', controllers.albums.lastN);
    app.get('/api/genres/albums', controllers.albums.genres);
    app.get('/api/years/albums', controllers.albums.years);

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
    app.post('/api/images', controllers.images.create);
    app.get('/api/svg/:color/:image', controllers.images.svgGet);

    app.get('/api/files', controllers.files.index);
};