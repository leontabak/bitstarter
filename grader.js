#!/usr/bin/env node

/*
Automatically grade files for the presence of specified
HTML tags/attributes.
Uses commander.js and cheerio.
Teaches command line application development and
basic DOM parsing.

References:

  + cheerio
    - https://github.com/MatthewMueller/cheerio
    - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
    - http://maxogden.com/scraping-with-node.html

  + commander.js
    - https://github.com/visionmedia/commander.js
    - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

  + JSON
    - http://en.wikipedia.org/wiki/JSON
    - https://developer.mozilla.org/en-US/docs/JSON
    - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2

*/

var fs = require("fs");
var program = require("commander");
var cheerio = require("cheerio");
var rest = require("restler");
var sys = require("util");
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://aqueous-mesa-4000.herokuapp.com";

var globalChecksFile = "";

var assertFileExists = function(infile) {
  var instr = infile.toString();
  if( !fs.existsSync(instr)) {
    console.log("%s does not exist. Exiting.", instr);
    process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
  } // if
  return instr;
};

var cheerioHtmlFile = function(htmlfile) {
  return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
  return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
  $ = cheerioHtmlFile(htmlfile);
  var checks = loadChecks(checksfile).sort();
  var out = {};
  for(var ii in checks) {
    var present = $(checks[ii]).length > 0;
    out[checks[ii]] = present;
  } // for
  return out;
};

var urlToString = function(result) {
  if( result instanceof Error ) {
    sys.puts( "Error: " + result.message );
    this.retry(5000);
  } // if
  else {
//    sys.puts(result);

    $ = cheerio.load(result);
    var checks = loadChecks(globalChecksFile).sort();
    var out = {};
    for(var ii in checks) {
      var present = $(checks[ii]).length > 0;
      out[checks[ii]] = present;
    } // for
    var checkJson = out;
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson); 
  } // else
};

var checkWebPage = function(url, checksfile) {
  var htmlstring = rest.get(url).on("complete", urlToString);
  globalChecksFile = checksfile;

  /*
  $ = cheerio.load(globalString);
  var checks = loadChecks(checksfile).sort();
  var out = {};
  for(var ii in checks) {
    var present = $(checks[ii]).length > 0;
    out[checks[ii]] = present;
  } // for
  return out;
  */

};

var clone = function(fn) {
  // Workaround for commander.js issue.
  // http://stackoverflow.com/a/6772648
  return fn.bind({});
};
  

if(require.main == module) {
  program
    .option("-c, --checks <check_file>", "Path to checks.json", clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option("-f, --file <html_file>", "Path to index.html", clone(assertFileExists))
    .option("-u, --url <address_on_web>", "Address on Web") 
    .parse(process.argv);

  if( program.checks && program.file ) {
    // console.log( " ---- file version ---- " + program.file );
    var checkJson = checkHtmlFile(program.file, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson); 
  } // if
  else if( program.checks && program.url ) {
    // console.log( " ---- url version ---- " + program.url );
    var checkJson = checkWebPage(program.url, program.checks);
    // var outJson = JSON.stringify(checkJson, null, 4);
    // console.log(outJson); 
  } // else if

}
else {
  exports.checkHtmlFile = checkHtmlFile;
}
