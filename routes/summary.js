var _ = require('lodash'),
    Tokenizer = require('sentence-tokenizer');

function splitContentToSentences(content, callback) {
	if(content.indexOf('.') == -1 && content.indexOf('?') == -1 && content.indexOf('!') == -1 && content.indexOf(';') == -1) {
		return callback(false);
	}

	var tokenizer = new Tokenizer();
	tokenizer.setEntry(content);

	callback(tokenizer.getSentences() || []);
}

function splitContentToParagraphs(content, callback) {
	callback(content.split("\n"));
}

function intersect_safe(a, b) {
    var ai= 0, bi=0;
    var result = [];
    _.sortBy(a,function(s){return s;});
    _.sortBy(b,function(s){return s;});

	while(ai < a.length && bi < b.length){
		if      (a[ai] < b[bi] ){ ai++; }
		else if (a[ai] > b[bi] ){ bi++; }
		else
		{
			result.push(a[ai]);
			ai++;
			bi++;
		}
	}

	return result;
}

function sentencesIntersection(sent1, sent2, callback) {
	var s1 = sent1.split(' '),
	    s2 = sent2.split(' '),
        intersect  = intersect_safe(s1, s2),
	    spliceHere = ((s1.length + s2.length) / 2);

	callback(intersect.length);
}

function formatSentence(sentence, callback) {
    if(sentence) {
		var re = /[^A-Za-z\s]/g
	  return callback(sentence.replace(re, ''));
	}
	return callback(sentence);
}

function getBestSentence(paragraph, sentences_dict, callback) {
	splitContentToSentences(paragraph, function(sentences) {
		if (!sentences) return '';
		if (sentences.length < 2) return '';

		var best_sentence = '',
            max_value = 0,
            strip_s,
            sentence,
            s;

		for(s in sentences) {
			sentence = sentences[s];
			formatSentence(sentence, function(strip_s) {
				if(strip_s && sentences_dict[strip_s] > max_value) {
					max_value     = sentences_dict[strip_s];
					best_sentence = sentence;
				}
			});
		}

		callback(best_sentence);
	});
}

function getSortedSentences(paragraph, sentences_dict, n, callback) {
	splitContentToSentences(paragraph, function(sentences) {
		if (!sentences) return callback('');
		if (sentences.length < 2) return callback('');

		var sentence_scores = [],
            strip_s;

		_.each(sentences, function(element, index) {
			formatSentence(element, function(strip_s){
				if(strip_s) {
					sentence_scores.push({
						sentence: element,
						score:    sentences_dict[strip_s],
						order:    index
					});
				}
			});
		});

		sentence_scores = _.sortBy(sentence_scores, function(sentence_score) { return -(sentence_score.score); });

		if(sentence_scores.length < n || n == 0) {
			n = sentence_scores.length;
		}

		sentence_scores = sentence_scores.slice(0, n);
		sentence_scores = _.sortBy(sentence_scores, function(sentence) { return sentence.order; });
		sorted_sentences = _.pluck(sentence_scores, 'sentence');

		callback(sorted_sentences);
	});
}

function getSentencesRanks(content, callback) {

	splitContentToSentences(content, function(sentences) {
		var n          = sentences.length,
			r          = _.range(n),
		    values     = [];
            _val       = [];

        // Assign values as a 0 matrix of size r*r
        for(var i=0;i<n;i++) {
			_val = [];
			for(var j=0;j<n;j++){
				_val.push(0);
			}
			values.push(_val);
		}

		// Assign each score to each sentence
		for(var i=0;i<n;i++) {
			for(var j=0;j<n;j++) {
				sentencesIntersection(sentences[i], sentences[j], function(intersection) {
					values[i][j] = intersection;
				});
			}
		}

		// Build sentence score dictionary
		var sentences_dict = {},
            score = 0;
		for(var i=0;i<n;i++) {
			score = 0;
			for(var j=0;j<n;j++) {
				if(i != j) score += values[i][j];
			}

			formatSentence(sentences[i], function(strip_s) {
				sentences_dict[strip_s] = score;
			});
		}

		callback(sentences_dict);
	});
}

exports.summarize = function(content, callback) {
	var summary = [],
        paragraphs = [],
        sentence = '';

	getSentencesRanks(content, function(dict) {
		splitContentToParagraphs(content, function(paragraphs) {
			for(p in paragraphs) {
				getBestSentence(paragraphs[p], dict, function(sentence) {
					if(sentence) summary.push(sentence);
				});
			}
			callback(summary.join(" "));
		});
	});
};

