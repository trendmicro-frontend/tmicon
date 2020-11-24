const svgFolder = './dist/svg';
const fs = require('fs');
const http = require('http');
const ejs = require('ejs');
const svgVewBoxStart = 'viewBox="';
const svgVewBoxEnd = '">';
const DEFAULT_VIEWBOX = '0 0 16 16';
const ICONMMON_VIEWBOX = '0 0 1060 1060';
const svgPathStart = 'd="';
const svgPathEnd = '"></path>';
const dataFromSvgFile = {};
const dataParsedFromApi = {};

let count = 0;

fs.readdirSync(svgFolder).forEach(file => {
  var text = fs.readFileSync(`${svgFolder}/${file}`,  "utf-8");
  // console.log(text);
  var textByLine = text.split("\n")
  const viewBox = textByLine
    .filter(line => line.indexOf("<svg") >= 0)
    .reduce((acc, svg) => {
      const viewBox = svg
        .split(svgVewBoxStart)[1]
        .split(svgVewBoxEnd)[0]
      if (viewBox === DEFAULT_VIEWBOX) {
        return DEFAULT_VIEWBOX;
      } else {
        count = count + 1;
        return ICONMMON_VIEWBOX;
      }
    }
    , DEFAULT_VIEWBOX);
  const paths = textByLine
    .filter(line => line.indexOf("path") >= 0)
    .map(path => path
      .split(svgPathStart)[1]
      .split(svgPathEnd)[0]
    )
  console.log(viewBox);
  dataFromSvgFile[file.split('.svg')[0]] = { paths, viewBox };
});
console.log("Incorrect viewBox count", count);

// http.get('http://style-portal.tw.trendnet.org/api/icons/info', (res) => {
//   const { statusCode } = res;
//   const contentType = res.headers['content-type'];

//   let error;
//   // Any 2xx status code signals a successful response but
//   // here we're only checking for 200.
//   if (statusCode !== 200) {
//     error = new Error('Request Failed.\n' +
//                       `Status Code: ${statusCode}`);
//   } else if (!/^application\/json/.test(contentType)) {
//     error = new Error('Invalid content-type.\n' +
//                       `Expected application/json but received ${contentType}`);
//   }
//   if (error) {
//     console.error(error.message);
//     // Consume response data to free up memory
//     res.resume();
//     return;
//   }
//   res.setEncoding('utf8');
//   let rawData = '';
//   res.on('data', (chunk) => { rawData += chunk; });
//   res.on('end', () => {
//     try {
//       const parsedData = JSON.parse(rawData);
//       dataParsedFromApi.iconsets = parsedData.iconsets.sort(function(a, b) {
//         var nameA = a.id; // ignore upper and lowercase
//         var nameB = b.id; // ignore upper and lowercase
//         if (nameA < nameB) {
//           return -1;
//         }
//         if (nameA > nameB) {
//           return 1;
//         }
//         // names must be equal
//         return 0;
//       });
//       dataParsedFromApi.icons = parsedData.icons.sort(function(a, b) {
//         var nameA = a.name.toUpperCase(); // ignore upper and lowercase
//         var nameB = b.name.toUpperCase(); // ignore upper and lowercase
//         if (nameA < nameB) {
//           return -1;
//         }
//         if (nameA > nameB) {
//           return 1;
//         }
//         // names must be equal
//         return 0;
//       }).map(({ name, minorVersion, iconset, code, paths}) => {
//         return {
//             code,
//             iconset,
//             name,
//             new: minorVersion === 17,
//             paths
//         }})

//         // merge data here
//         const combinedIcons = dataParsedFromApi.icons.map(icon => {
//           return {
//             ...icon,
//             paths: dataFromSvgFile[icon.name].paths,
//             viewBox: dataFromSvgFile[icon.name].viewBox
//           }
//         });

//         // Create tmIconMap.js file for Tonic UI
//         const TEMPLATE = `/* eslint-disable */
// // This file is auto generated.
// const tmIconMap = <%- JSON.stringify(ImportObj) %>;
// export default tmIconMap;`;
        
//         let output = ejs.render(TEMPLATE, {ImportObj: {
//           ...dataParsedFromApi,
//           icons: combinedIcons
//         }});
//         console.log(output);
        
//         fs.writeFile("tmIconMap.js", output, 'utf8', function (err) {
//           if (err) {
//               console.log("An error occured while writing JS Object to File.");
//               return console.log(err);
//           }
        
//           console.log("JS file has been saved.");
//         });


//     } catch (e) {
//       console.error(e.message);
//     }
//   });
// }).on('error', (e) => {
//   console.error(`Got error: ${e.message}`);
// });
