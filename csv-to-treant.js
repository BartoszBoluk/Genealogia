// csv-to-treant.js
const csv = require('csvtojson');
const fs = require('fs');

const csvFile = process.argv[2] || 'people.csv';

csv()
  .fromFile(csvFile)
  .then(rows => {
    // oczekujemy: id,name,parentId
    const map = {};
    rows.forEach(r => map[r.id] = { ...r, children: [] });

    const roots = [];
    rows.forEach(r => {
      const node = map[r.id];
      const p = r.parentId && r.parentId.trim();
      if (p && map[p]) map[p].children.push(node);
      else roots.push(node);
    });

    function toTreant(n){
      const obj = { text: { name: n.name } };
      if (n.children && n.children.length) obj.children = n.children.map(toTreant);
      return obj;
    }

    let treantRoot;
    const treantRoots = roots.map(toTreant);
    if (treantRoots.length === 1) treantRoot = treantRoots[0];
    else treantRoot = { text: { name: "Drzewo rodzinne" }, children: treantRoots };

    fs.writeFileSync('data.json', JSON.stringify(treantRoot, null, 2), 'utf8');
    console.log('Wygenerowano data.json');
  });
