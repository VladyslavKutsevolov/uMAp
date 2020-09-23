const { Router } = require('express');
const router = Router();
const {
  getMapsByUserId,
  getMapByID,
  createNewMap,
  updateMapByID,
  deleteMapByID,
  addMapToFavorite,
  removeMapFromFavorite,
  getFavoriteMaps,
} = require('../db/queries/map.queries');
const { getAllPins } = require('../db/queries/pin.queries');

module.exports = (db) => {
  //api/map
  router.get('/', (req, res) => {
    const user = req.session.user;
    if (!user) {
      return res.status(400).json({ msg: 'User should be logged in!' });
    }
    getMapsByUserId(user.userId, db)
      .then((userMaps) => {
        const vars = { user, userMaps };
        res.render('index', vars);
      })
      .catch((err) =>
        res.status(500).json({ msg: 'failed to load maps table' })
      );
  });

  router.get('/fav', (req, res) => {
    const user = req.session.user;
    getFavoriteMaps(user.userId, db).then((favMaps) => {
      console.log(favMaps);
      res.render('favmaps', { user, favMaps });
    });
  });

  router.post('/fav', (req, res) => {
    const { userId } = req.session.user;
    const { mapId } = req.body;
    addMapToFavorite(mapId, userId, db);
  });

  router.post('/fav/delete', (req, res) => {
    const { mapId } = req.body;
    removeMapFromFavorite(mapId, db);
  });

  router.get('/new', (req, res) => {
    const user = req.session.user;
    res.render('createMap', { user });
  });

  router.post('/new', (req, res) => {
    const user = req.session.user;
    const queryParams = { body: req.body, user: user.userId };

    createNewMap(queryParams, db)
      .then((newMap) => {
        res.redirect(`/api/map/${newMap.id}`);
      })
      .catch((err) => res.status(500).json({ msg: 'failed to add new map' }));
  });

  router.get('/:id', (req, res) => {
    const user = req.session.user;
    getMapByID(req.params.id, db)
      .then((map) => {
        getAllPins(map.id, db).then((pins) => {
          res.render('map', { map, user, pins });
        });
      })
      .catch((err) =>
        res.status(500).json({ msg: 'failed to get single map table' })
      );
  });

  router.post('/edit/:id', (req, res) => {
    updateMapByID(req.body, req.params.id, db)
      .then((map) => res.status(200).json(map))
      .catch((err) => res.status(500).json({ msg: 'failed to update map' }));
  });

  router.post('/:id/delete', (req, res) => {
    deleteMapByID(db, req.params.id)
      .then((response) => res.json({ msg: 'map deleted' }))
      .catch((err) => res.status(500).json({ msg: 'failed to delete map' }));
  });

  return router;
};
