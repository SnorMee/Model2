





////////////////////////////////////////////////////////////////////// LOAD DATA //////////////////////////////////////////////////////////

var data = null;

$.ajax({
    url: "data/Threat_nest_List.json",
    contentType:"application/json; charset=utf-8",
    dataType: 'json',
    async: false,

    success: function(response){
        dataThreatTotal = response
    }
});

$.ajax({
    url: "data/Threat_Title_ALL_IUCN.json",
    contentType:"application/json; charset=utf-8",
    dataType: 'json',
    async: false,

    success: function(response){
        dataThreatType = response
    }
});



function createData(data, type, word) {
  treeDict = data
  threatType = type
  word = word

  let nestedTypes = {};

for (let key in threatType) {
  const parts = key.split(".");
  let currLevel = nestedTypes;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!currLevel.hasOwnProperty(part)) {
      currLevel[part] = {"numT": 0, "category": "", "species": [], "value": 0};
    }
    currLevel = currLevel[part];
  }
  currLevel.category = threatType[key];
}
let sum = 0
for (let key in treeDict) {
  if (key.includes(word)){
    sum +=1
      let list = treeDict[key];        
      list.forEach(function(element) {
         if (element.split('.').length>=1) {
          let nest = nestedTypes[element.split('.')[0]]
          if (!nest['species'].includes(key)) {
              nest['species'].push(key);
              nest['value'] += 1
          }
          nest['numT'] +=1
         }
         if (element.split('.').length>=2) {
          let nest = nestedTypes[element.split('.')[0]][element.split('.')[1]]
          if (!nest['species'].includes(key)) {
              nest['species'].push(key);
              nest['value'] += 1
          }
          nest['numT'] +=1
         }
         if (element.split('.').length===3) {
          let nest = nestedTypes[element.split('.')[0]][element.split('.')[1]][element.split('.')[2]]
          if (!nest['species'].includes(key)) {
              nest['species'].push(key);
              nest['value'] += 1
          }
          nest['numT'] +=1
         }
         
      })


  }
}

let threatDict = {'name': 'All', 'children': nestedTypes, 'value': sum};
return threatDict
};

const searchBar = document.getElementById('search-bar');
  const searchButton = document.getElementById('search-button');

  let searchText = '';

  searchBar.addEventListener('input', (event) => {
    searchText = event.target.value;
  });

  searchButton.addEventListener('click', () => {
    search(searchText);
  });

  searchBar.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      search(searchText);
    }
  });

  function search(text) {
    console.log(`Searching for "${text}"...`);
    // Add your search functionality here.
    let selectedWord = text; //Add Search Word
    document.getElementById("canvas").innerHTML = "";
    console.log(createData(dataThreatTotal,dataThreatType,selectedWord));
    drawCanvas(createData(dataThreatTotal,dataThreatType,selectedWord));
  };



function drawCanvas(data){
// Sizing - independent
let tw = 1500
let th = 1000
let numX = 4
// Sizing - DEPENDENT
let numY = 12/numX
var paper = Raphael("canvas", tw+10 , th+10);
let x = 10
let x0 = x
let y = 10
let h = th/numY
let w = tw/numX
//Text and color
let headline = [
    '1. Residential & commercial development',
    '2. Agriculture & aquaculture',
    '3. Energy production & mining',
    '4. Transportation & service corridors',
    '5. Biological resource use',
    '6. Human intrusions & disturbance',
    '7. Natural system modifications',
    '8. Invasive & other problematic species, genes & diseases',
    '9. Pollution',
    '10. Geological events',
    '11. Climate change & severe weather',
    '12. Other options'
]
// Find Max Value
let maxVal = 0; // initialize maxVal to negative infinity

for (let i = 0; i < Object.keys(data.children).length - 1; i++) {
  let currVal = data['children'][i+1]['value'];
  if (currVal > maxVal) {
    maxVal = currVal;
  }
}

// Create 
for (let i = 0; i < 12; i++) {
    if (i % numX === 0 ) {
        if (i !== 0){
        y = y + h;
        x = x0;};
    } else {
      x = x + w;
    }
    // calculate lightness based on value in data
    //var saturation = data[String(i+1)] / (Math.max(...Object.values(data))) * 100; // Convert value to percentage of max value
    //var color = Raphael.hsl('#ff0', saturation, 50); // Use HSL color model to adjust lightness
    var myColor = d3.scaleLinear()
    .range(['#ffffff','#7f0000'])
    .domain([0,100]);
    var color = myColor(String(data['children'][i+1]['value']) /maxVal *100)

    var rect = paper.rect(x, y, w, h);
    rect.attr({
        fill: color
      }); 
    var text = paper.text(x + w / 2, y + h / 2,  headline[i]);
    text.attr({
        "font-size": 12,
        "font-family": "Arial",
        "fill": "#000"
    });
    var extraText = paper.text(x+w/2,y+h/2+12+2, "Number of Species: " + String(data['children'][i+1]['value']));
    extraText.attr({
      "font-size": 12,
      "font-family": "Arial",
      "fill": "#000"
  });
  // Add tooltip
        rect.node.setAttribute('title', 'Threat ' + (i + 1)); // set the title attribute
        rect.node.addEventListener('mouseover', function() {
            var tooltip = document.createElement('div');
            tooltip.innerHTML = 'Threat ' + (i + 1);
            tooltip.style.position = 'absolute';
            tooltip.style.left = event.pageX})
};
}
