const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require("../authenticate");
const cors = require("./cors");
const Favorite = require("../models/favorite");
const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }, (err, favorite) => {
      if (err) {
        return next(err);
      }
      if (!favorite) {
        res.statusCode = 403;
        res.end("No favorites found!!");
      }
    })
      .populate("user")
      .populate("dishes")
      .then(
        (favorites) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorites);
        },
        (err) => next(err)
      );
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }, (err, favorite) => {
      if (err) {
        return next(err);
      }
      if (!favorite) {
        Favorite.create({ user: req.user._id })
          .then(
            (favorite) => {
              for (var dish = 0; dish < req.body.dishes.length; dish++) {
                favorite.dishes.push(req.body.dishes[dish]);
              }
              favorite.save().then((favorite) => {
                console.log("favorite Created ", favorite);
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              });
            },
            (err) => next(err)
          )
          .catch((err) => next(err));
      } else {
        for (var dish = 0; dish < req.body.dishes.length; dish++) {
          if (favorite.dishes.indexOf(req.body.dishes[dish]) < 0) {
            favorite.dishes.push(req.body.dishes[dish]);
          }
        }
        favorite.save().then((favorite) => {
          console.log("favorite added ", favorite);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        });
      }
    });
  })

  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.remove({ user: req.user._id })
      .then(
        (resp) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

favoriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get((req, res, next) => {
    Favorite.find()
      .populate("dishes")
      .then(
        (favorites) => {
          favorites.forEach((favorite) => {
            favorite.dishes.forEach((fav) => {
              if (fav._id == req.params.dishId) {
                res.statusCode = 200;
                res.setHeader("Content-Type", "apllication/json");
                res.json(fav);
              }
            });
          });
        },
        (error) => {
          next(error);
        }
      )
      .catch((error) => next(error));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }, (err, favorite) => {
      if (err) {
        return next(err);
      }
      if (!favorite) {
        Favorite.create({ user: req.user._id })
          .then(
            (favorite) => {
              favorite.dishes.push(req.params.dishId);
              favorite.save().then((favorite) => {
                console.log("favorite Created ", favorite);
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              });
            },
            (err) => next(err)
          )
          .catch((err) => next(err));
      } else {
        if (favorite.dishes.indexOf(req.params.dishId) < 0) {
          favorite.dishes.push(req.params.dishId);
          favorite.save().then((favorite) => {
            console.log("favorite added ", favorite);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          });
        } else {
          res.statusCode = 200;
          res.end("Favorite already added!!");
        }
      }
    });
  })
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      res.statusCode = 403;
      res.end(`PUT operation not supported on /leaders`);
    }
  )
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }, (err, favorite) => {
      if (err) {
        return next(err);
      }
      if (!favorite) {
        res.statusCode = 200;
        res.end("No favorite to delete");
      }
      var index = favorite.dishes.indexOf(req.params.dishId);
      if (index > -1) {
        favorite.dishes.splice(index, 1);
        favorite
          .save()
          .then(
            (resp) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(resp);
            },
            (err) => next(err)
          )
          .catch((err) => next(err));
      }
    });
  });

module.exports = favoriteRouter;
