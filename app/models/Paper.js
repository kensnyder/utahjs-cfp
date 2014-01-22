"use strict";

var Paper = base.createModel({
	collection: 'paper',	
	isValid: function() {

	}
});

var PaperCollection = base.createCollection({

});

module.exports = {
	Paper: Paper,
	PaperCollection: PaperCollection
};