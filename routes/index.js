const express = require('express');
const router = express.Router();
const db = require('../lib/mongodb');
const jsonexport = require('jsonexport');
const fs = require('fs');
const moment = require('moment')

const collection = 'Incidents';
const rawCollection = 'raw-incidents';

// home page - render layout
router.get('/', async function (req, res, next) {
  res.render('layout', {});
});

// render search existing incidents
router.get('/search-existing-incident', async function (req, res, next) {
  res.render('search-existing', {})
})

// render report incidents
router.get('/report-engine', async function (req, res, next) {
  const start = moment().format('YYYY-MM-DD') + 'T00:00';
  const end = moment().format('YYYY-MM-DDTHH:mm');
  res.render('report-incidents', { start, end })
})

// log new incident page
router.get('/create-new', async function (req, res, next) {

  db.getDB().collection(rawCollection).find({ display: { $ne: "false" } }).toArray((err, incidents) => {
    const settime = moment().format('YYYY-MM-DDTHH:mm');
    res.render('create-new-incident', { settime, incidents })
  });
})

router.post('/submit-new-incident', async function (req, res, next) {
  console.log(req.body)
  let incident = req.body;
  let collectionname;
  if (req.body.type=='raw') collectionname =  rawCollection
  else if (req.body.type == 'actual') collectionname = collection
  db.getDB().collection(collectionname).insertOne(incident, (err, result) => {
    if (err) console.log(err)
    else {
      // console.log(result);
      db.getDB().collection(rawCollection).find({ display: { $ne: "false" } }).toArray((err, incidents) => {
        // once submitted render create new incident page 
        const settime = moment().format('YYYY-MM-DDTHH:mm');
        res.render('create-new-incident', { settime, incidents})
      })
    }
  });

})


// this is route for search existing incident and report engine
// logic inside this caters for both pages
router.post('/list-incidents', async function (req, res, next) {
  console.log(req.body);
  let query = "";
  let fromdate = req.body.fromdate;
  // create query depending on where the request is coming from
  if (typeof (req.body.search) != 'undefined') {
    let history = req.body.History

    query = {
      $or:[
        {App_Id: new RegExp(req.body.search, "i")},
        {Issue_Description: new RegExp(req.body.search, "i")}
      ]
    };
    if(history != 'All'){
      query['Create_Date'] =  {
        $gte: getdate[history]()
      }
    }
    
    console.log(query);
  } else if (typeof (req.body.fromdate) != 'undefined') {
    query = {
      Create_Date: {
        $gte: req.body.fromdate,
        $lte: req.body.todate
      }
    };
  }

  // once query object is created, send request to mongidb to fetch details
  db.getDB().collection(collection).find(query, { projection: { _id: 0 } }).toArray((err, document) => {
    if (err) console.log(err)
    else {
      console.log(document);
      let incidents = document.sort((a,b) =>  new Date(b.Create_Date).getTime()-new Date(a.Create_Date).getTime());;
      // if request is coming from report page create a file to download
      incidents=incidents.map(i => {
        i.Create_Date=moment(i.Create_Date).format('YYYY-MM-DD HH:mm')
        return i;
      })
      if (typeof (fromdate) != 'undefined') {
        jsonexport(incidents, function (err, csv) {
          if (err) return console.log(err);
          console.log(csv);
          fs.writeFileSync(`${__dirname}/../public/incidents.csv`, csv.toString())
        });
        const start = req.body.fromdate
        const end = req.body.todate
        res.render('list-report-incidents', { incidents, start, end })
      }
      else {
        res.render('list-search-incidents', { incidents,  hidden:true })
      }

    }
  });
})


// router.get('/list-incidents', async function (req, res) {
//   res.redirect('/')
// })

// this route is to update records in mongo
router.get('/:id', async function (req, res) {
  const id = req.params.id;
  // console.log('id is ' + id)
try{
  db.getDB().collection(rawCollection).findOneAndUpdate({ _id: ObjectID(id)}, { $set: { display: "false" } }, (err, result) => {
    if (err) console.log(err);
    // console.log(result);
    db.getDB().collection(rawCollection).find({ display: { $ne: "false" } }).toArray((err, incidents) => {
      const settime = moment().format('YYYY-MM-DDTHH:mm');
      res.render('create-new-incident', { settime, incidents})
    })
  })
} catch (err) {
  console.log(err)
  res.redirect('/')
}
});

const getdate = {
  "Last 7 Days":  () => {
    let mydate = moment().subtract(7, 'days').calendar();
    return moment(mydate).format('YYYY-MM-DDTHH:mm')
    },
  "Last 30 Days" :  () => {
    let mydate = moment().subtract(30, 'days').calendar();
    return moment(mydate).format('YYYY-MM-DDTHH:mm')
    },
}

module.exports = router;