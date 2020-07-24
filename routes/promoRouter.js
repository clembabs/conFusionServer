const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require('./cors');
const Promotions = require("../models/promotions");
var authenticate = require('../authenticate');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors,(req, res, next) => {
    Promotions.find({})
      .then(
        (promotions) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promotions);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser,authenticate.verifyAdmin,cors.corsWithOptions,  (req, res, next) => {
    Promotions.create(req.body)
      .then(
        (promo) => {
          console.log("Promo Created", promo);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promo);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser,authenticate.verifyAdmin,cors.corsWithOptions,  (req, res, next) => {
    Promotions.remove({})
      .then(
        (resp) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(authenticate.verifyUser,authenticate.verifyAdmin, cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT Operation not supported on /promotions");
  });

promoRouter
  .route("/:promoId")
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors,(req, res, next) => {
    Promotions.findById(req.params.promoId)
      .then(
        (promo) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promo);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser,authenticate.verifyAdmin, cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      "POST Operation not supported on /promotions/ " + req.params.promoId
    );
  })
  .delete(authenticate.verifyUser,authenticate.verifyAdmin,cors.corsWithOptions,  (req, res, next) => {
    Promotions.findByIdAndRemove(req.params.promoId)
      .then(
        (resp) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(authenticate.verifyUser,authenticate.verifyAdmin, cors.corsWithOptions, (req, res, next) => {
    Promotions.findByIdAndUpdate(
      req.params.promoId,
      {
        $set: req.body,
      },

      { new: true }
    )
      .then(
        (promo) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promo);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = promoRouter;
