var mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dishes : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'        
    }]
}, {
    timestamps: true
});

var Favorite = mongoose.model("Promotion", favoriteSchema);

module.exports = Favorite;