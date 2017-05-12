var express = require('express'),
    router = express.Router(),
    bodyParser = require('body-parser'),
    path = require('path'),
    pug = require('pug'),
    summarizer = require( path.resolve( __dirname, "./summary.js" ) );

var inputError=false,
    message,
    resultGenerated=false;

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

router.get('/',function(req,res){
    resultGenerated=false;
    if(inputError)
        res.render('index',{iserror:inputError,msg:message});
    else
        res.render('index');
    inputError=false;
});

router.post('/',urlencodedParser, function(req, res) {
    content=req.body.input;
    if(content == ""){
        inputError=true;
        message="No input provided!!!";
        res.redirect('/');
    }
    else{
        summarizer.summarize(content, function(summary) {
	       if(summary == ""){
                inputError=true;
                message="Summary cannot be generated for given input!!!"
                res.redirect('/');
           }
            else{
                inputError=false;
                resultGenerated=true;
	            message="Original Length " + content.length;
                message+="\nSummary Length " + summary.length;
                message+="\nSummary Ratio: " + (100 - (100 * (summary.length / (content.length)))) +"%";
                res.render('index',{isSuccess:resultGenerated,msg:message,res:summary});
            }
        });
    }
});

router.get('/favicon.ico', function (req, res) {
  res.sendFile(path.resolve( __dirname, "/views/favicon.ico"));
});

module.exports = router;
