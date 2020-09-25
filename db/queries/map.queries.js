const { removeLastCommaBeforeWhere } = require('../../utils/helperFunctions');

module.exports = {
  getMapsByUserId: (userId, db) => {
    const searchQuery = `SELECT * FROM maps WHERE user_id = $1`;

    return db
      .query(searchQuery, [userId])
      .then(({ rows: userMaps }) => userMaps);
  },

  getMapByID: (mapId, db) => {
    const searchQuery = `SELECT * FROM maps WHERE id = $1`;

    return db.query(searchQuery, [mapId]).then(({ rows: map }) => map[0]);
  },

  createNewMap: (queryParams, db) => {
    const { title, map_description, city, map_picture } = queryParams.body;
    const { user: userId } = queryParams;
    console.log(map_picture);
    const searchQuery = `
    INSERT INTO
      maps(title, map_description, user_id, city, map_picture)
    VALUES
    ($1, $2, $3, $4, $5)
    RETURNING *;`;
    return db // added user_id to next line
      .query(searchQuery, [title, map_description, userId, city, map_picture])
      .then(({ rows: newMap }) => newMap[0]);
  },

  updateMapByID: (queryValues, id, db) => {
    const { title, map_description, city, category } = queryValues;

    const queryParams = [];

    let searchQuery = `UPDATE maps SET `;

    if (title) {
      queryParams.push(title);
      searchQuery += `title = $${queryParams.length}, `;
    }

    if (city) {
      queryParams.push(city);
      searchQuery += `city = $${queryParams.length}, `;
    }

    if (map_description) {
      queryParams.push(map_description);
      searchQuery += `map_description = $${queryParams.length}, `;
    }

    if (category) {
      queryParams.push(category);
      searchQuery += `category = $${queryParams.length}, `;
    }

    if (id) {
      queryParams.push(id);
      searchQuery += `WHERE id = $${queryParams.length} RETURNING *;`;
    }
    searchQuery = removeLastCommaBeforeWhere(searchQuery);

    return db.query(searchQuery, queryParams).then(({ rows: map }) => map[0]);
  },

  deleteMapByID: (db, id) => {
    const searchQuery = `DELETE FROM maps WHERE id = $1;`;

    return db.query(searchQuery, [id]);
  },

  addMapToFavorite: (mapId, userId, db) => {
    const addQuery = `INSERT INTO favorites(map_id, user_id) VALUES($1, $2);`;

    return db.query(addQuery, [mapId, userId]);
  },

  removeMapFromFavorite: (mapId, db) => {
    const deleteQuery = `DELETE FROM favorites WHERE map_id = $1;`;

    return db.query(deleteQuery, [mapId]);
  },

  getFavoriteMaps: (userId, db) => {
    const searchQuery = `SELECT * from maps JOIN favorites ON maps.id = map_id WHERE favorites.user_id = $1;`;

    return db.query(searchQuery, [userId]).then(({ rows: favMaps }) => favMaps);
  },

  getAllMaps: (db) => {
    const searchQuery = `SELECT * FROM maps;`;

    return db.query(searchQuery).then(({ rows: allMaps }) => allMaps);
  },
  getContributedMapsByUserID: (userId, db) => {
    const searchQuery = `SELECT maps.*  FROM maps JOIN points ON maps.id = map_id WHERE points.created_by = $1`;

    return db.query(searchQuery, [userId]).then(({ rows: maps }) => maps);
  },

  checkIfFavorite: (mapId, db) => {
    const searchQuery = `SELECT map_id FROM favorites WHERE map_id = $1`;

    return db.query(searchQuery, [mapId]).then(({ rows: id }) => {
      return id.length ? true : false;
    });
  },
};
