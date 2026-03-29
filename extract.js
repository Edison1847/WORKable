const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('D:/Projects/Analogy/Workable_1/WebApp/Docs/WORKable_Blueprint_v5_COMPLETE.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('blueprint.txt', data.text);
    console.log('Done');
}).catch(err => {
    console.error(err);
});
