const turf = require('@turf/turf');
function cleanString(s) {
  return s.replace(/[^A-Za-z0-9_]/g, "");
}

exports.pipeline = (surveys) => {
  const notFlag = new Array();
  const complete = new Array();
  const spanish = new Array();
  const commute = new Array();
  const age = new Array();
  const email = new Array();
  const q1 = new Array();
  const q2 = new Array();
  const q2Name = new Array();
  const q2Point = new Array();
  const q3 = new Array();
  const q4 = new Array();
  const q5 = new Array();
  const q5Name = new Array();
  const q5Point = new Array();
  const q6 = new Array();
  const q7 = new Array();
  const q8 = new Array();
  const q8Name = new Array();
  const q8Point = new Array();
  const q9 = new Array();
  const q10 = new Array();
  const q11 = new Array();
  const q12 = new Array();
  const q13 = new Array();
  surveys.forEach(survey => {
    if (survey.flag != true) {
      notFlag.push(false);
      complete.push(survey.complete);
      spanish.push(survey.spanish);
      q1.push(survey.responses[0]);
      if (survey.responses[1] != null) {
        q2.push(Object.values(survey.responses[1]).toString());
        q2Name.push(survey.home.place_name);
        if (survey.responses[2] != null) {
          q2Point.push(turf.point(survey.home.geometry.coordinates, { 'mode': parseInt(Object.values(survey.responses[2]).toString()) }));
        } else {
          q2Point.push(turf.point(survey.home.geometry.coordinates, { 'mode': 0 }));
        }
      }
      if (survey.responses[2] != null) {
        q3.push(parseInt(Object.values(survey.responses[2])));
      }
      if (survey.responses[3] != null) {
        q4.push(Object.values(survey.responses[3]).toString());
      }
      if (survey.work.geometry != null) {
        q5.push(Object.values(survey.responses[4]).toString());
        q5Name.push(survey.work.place_name);
        // console.log();
        if (survey.responses[5] != null) {
          q5Point.push(turf.point(survey.work.geometry.coordinates, { 'mode': parseInt(Object.values(survey.responses[5]).toString()) }));
        }
        else {
          q5Point.push(turf.point(survey.work.geometry.coordinates, { 'mode': 0 }));
        }
      }
      if (survey.responses[5] != null && survey.responses[5].answer != 'skip') {
        q6.push(parseInt(Object.values(survey.responses[5])));
      }
      if (survey.responses[6] != null) {
        q7.push(Object.values(survey.responses[6]).toString());
      }
      // NEED TO GET COUNT BY HS NAME
      if (survey.responses[7] != null && survey.responses[7].answer != 'skip') {
        q8.push(cleanString(Object.values(survey.responses[7]).toString().toLowerCase()));
        q8Name.push(survey.school.place_name);
        if (survey.responses[8] != null) {
          q8Point.push(turf.point(survey.school.geometry.coordinates, { 'mode': parseInt(Object.values(survey.responses[8]).toString()) }));
        } else {
          q8Point.push(turf.point(survey.school.geometry.coordinates, { 'mode': 0 }));
        }
      }
      if (survey.responses[8] != null && survey.responses[8].answer != 'skip') {
        q9.push(parseInt(Object.values(survey.responses[8])));
      }
      if (survey.responses[9] != null) {
        q10.push(parseInt(Object.values(survey.responses[9])));
      }
      if (survey.responses[10] != null) {
        q11.push(Object.values(survey.responses[10]));
      }
      if (survey.responses[11] != null) {
        q12.push(parseInt(Object.values(survey.responses[11])));
      }
      if (survey.responses[12] != null) {
        q13.push(Object.values(survey.responses[12]));
      }
      if (survey.responses[13] != null) {
        age.push(parseInt(Object.values(survey.responses[13])));
      }
      if (survey.responses[14] != null) {
        if (JSON.parse(Object.values(survey.responses[14])) === true && survey.responses[15] != null) {
          var emailString = Object.values(survey.responses[15]).toString().split(' ');
          email.push(emailString[0]);
        }
      }
      // if home and if work
      if (survey.home.geometry != null && survey.work.geometry != null) {
        if (survey.responses[2] != null) {
          var myMode = parseInt(Object.values(survey.responses[2]).toString());
        } else {
          var myMode = 0;
        }
        const commuteGeo = {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": survey.home.geometry.coordinates
          },
          "properties": {
            "origin_id": survey.home.id,
            "origin_city": survey.home.text,
            "origin_country": "US",
            "origin_lon": survey.home.geometry.coordinates[0],
            "origin_lat": survey.home.geometry.coordinates[1],
            "destination_id": survey.work.id,
            "destination_city": survey.work.text,
            "destination_country": "US",
            "destination_lon": survey.work.geometry.coordinates[0],
            "destination_lat": survey.work.geometry.coordinates[1],
            "mode": myMode
          }
        };
        commute.push(commuteGeo);
      }
    }
  });
  const homePoints = turf.featureCollection(q2Point);
  const workPoints = turf.featureCollection(q5Point);
  const schoolPoints = turf.featureCollection(q8Point);
  const commuteGroup = turf.featureCollection(commute);

  const q3Summary = [
    {
      'title': 'Walk',
      'count': q3.filter(el => el === 1).length,
      'percent': JSON.parse((q3.filter(el => el === 1).length / q3.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Bike',
      'count': q3.filter(el => el === 2).length,
      'percent': JSON.parse((q3.filter(el => el === 2).length / q3.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Public Transportation',
      'count': q3.filter(el => el === 3).length,
      'percent': JSON.parse((q3.filter(el => el === 3).length / q3.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Taxi / Shared Vehicle',
      'count': q3.filter(el => el === 4).length,
      'percent': JSON.parse((q3.filter(el => el === 4).length / q3.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Motorcycle / Scooter',
      'count': q3.filter(el => el === 5).length,
      'percent': JSON.parse((q3.filter(el => el === 5).length / q3.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Carpool',
      'count': q3.filter(el => el === 6).length,
      'percent': JSON.parse((q3.filter(el => el === 6).length / q3.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Drove Alone',
      'count': q3.filter(el => el === 7).length,
      'percent': JSON.parse((q3.filter(el => el === 7).length / q3.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Combination',
      'count': q3.filter(el => el === 8).length,
      'percent': JSON.parse((q3.filter(el => el === 8).length / q3.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Other',
      'count': q3.filter(el => el === 9).length,
      'percent': JSON.parse((q3.filter(el => el === 9).length / q3.length.toFixed(1) * 100).toFixed(1)),
    }
  ];
  const q6Summary = [
    {
      'title': 'Walk',
      'count': q6.filter(el => el === 1).length,
      'percent': JSON.parse((q6.filter(el => el === 1).length / q6.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Bike',
      'count': q6.filter(el => el === 2).length,
      'percent': JSON.parse((q6.filter(el => el === 2).length / q6.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Public Transportation',
      'count': q6.filter(el => el === 3).length,
      'percent': JSON.parse((q6.filter(el => el === 3).length / q6.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Taxi / Shared Vehicle',
      'count': q6.filter(el => el === 4).length,
      'percent': JSON.parse((q6.filter(el => el === 4).length / q6.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Motorcycle / Scooter',
      'count': q6.filter(el => el === 5).length,
      'percent': JSON.parse((q6.filter(el => el === 5).length / q6.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Carpool',
      'count': q6.filter(el => el === 6).length,
      'percent': JSON.parse((q6.filter(el => el === 6).length / q6.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Drove Alone',
      'count': q6.filter(el => el === 7).length,
      'percent': JSON.parse((q6.filter(el => el === 7).length / q6.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Combination',
      'count': q6.filter(el => el === 8).length,
      'percent': JSON.parse((q6.filter(el => el === 8).length / q6.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Other',
      'count': q6.filter(el => el === 9).length,
      'percent': JSON.parse((q6.filter(el => el === 9).length / q6.length.toFixed(1) * 100).toFixed(1)),
    }
  ];
  const q9Summary = [
    {
      'title': 'Walk',
      'count': q9.filter(el => el === 1).length,
      'percent': JSON.parse((q9.filter(el => el === 1).length / q9.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Bike',
      'count': q9.filter(el => el === 2).length,
      'percent': JSON.parse((q9.filter(el => el === 2).length / q9.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Public Transportation',
      'count': q9.filter(el => el === 3).length,
      'percent': JSON.parse((q9.filter(el => el === 3).length / q9.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Taxi / Shared Vehicle',
      'count': q9.filter(el => el === 4).length,
      'percent': JSON.parse((q9.filter(el => el === 4).length / q9.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Motorcycle / Scooter',
      'count': q9.filter(el => el === 5).length,
      'percent': JSON.parse((q9.filter(el => el === 5).length / q9.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Carpool',
      'count': q9.filter(el => el === 6).length,
      'percent': JSON.parse((q9.filter(el => el === 6).length / q9.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Drove Alone',
      'count': q9.filter(el => el === 7).length,
      'percent': JSON.parse((q9.filter(el => el === 7).length / q9.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Combination',
      'count': q9.filter(el => el === 8).length,
      'percent': JSON.parse((q9.filter(el => el === 8).length / q9.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Other',
      'count': q9.filter(el => el === 9).length,
      'percent': JSON.parse((q9.filter(el => el === 9).length / q9.length.toFixed(1) * 100).toFixed(1)),
    }
  ];
  const q10Summary = [
    {
      'title': 'Very Easy',
      'count': q10.filter(el => el === 1).length,
      'percent': JSON.parse((q10.filter(el => el === 1).length / q10.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Somewhat Easy',
      'count': q10.filter(el => el === 2).length,
      'percent': JSON.parse((q10.filter(el => el === 2).length / q10.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Neutral',
      'count': q10.filter(el => el === 3).length,
      'percent': JSON.parse((q10.filter(el => el === 3).length / q10.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Somewhat Difficult',
      'count': q10.filter(el => el === 4).length,
      'percent': JSON.parse((q10.filter(el => el === 4).length / q10.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Very Difficult',
      'count': q10.filter(el => el === 5).length,
      'percent': JSON.parse((q10.filter(el => el === 5).length / q10.length.toFixed(1) * 100).toFixed(1)),
    }
  ];
  const q12Summary = [
    {
      'title': 'Very Easy',
      'count': q12.filter(el => el === 1).length,
      'percent': JSON.parse((q12.filter(el => el === 1).length / q12.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Somewhat Easy',
      'count': q12.filter(el => el === 2).length,
      'percent': JSON.parse((q12.filter(el => el === 2).length / q12.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Neutral',
      'count': q12.filter(el => el === 3).length,
      'percent': JSON.parse((q12.filter(el => el === 3).length / q12.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Somewhat Difficult',
      'count': q12.filter(el => el === 4).length,
      'percent': JSON.parse((q12.filter(el => el === 4).length / q12.length.toFixed(1) * 100).toFixed(1)),
    },
    {
      'title': 'Very Difficult',
      'count': q12.filter(el => el === 5).length,
      'percent': JSON.parse((q12.filter(el => el === 5).length / q12.length.toFixed(1) * 100).toFixed(1)),
    }
  ];
  const surveyTotal = notFlag.length;
  const sumAge = age.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
  const summary = {
    'total': surveyTotal,
    'complete': {
      'count': complete.filter(el => el === true).length,
      'percent': (parseFloat(complete.filter(el => el === true).length / surveyTotal) * 100).toFixed(1)
    },
    'spanish': {
      'count': spanish.filter(el => el === true).length,
      'percent': (parseFloat(spanish.filter(el => el === true).length / surveyTotal) * 100).toFixed(1)
    },
    'age': {
      'average': (sumAge / age.length).toFixed(1),
      'low': Math.min(...age),
      'high': Math.max(...age)
    },
    'email': {
      'list': email,
      'total': email.length
    },
    'question2': {
      'responses': q2,
      'names': q2Name,
      'points': {
        'features': homePoints,
        'bbox': turf.bbox(homePoints),
        'center': turf.center(homePoints)
      },
      'total': q2.length,
      'question': 'Where do you live?',
      'percent': ((q2.length / surveyTotal) * 100).toFixed(1)
    },
    'question3': {
      'question': 'On a typical day, how do you travel around your community to shop, eat, run errands, or for social or recreational purposes?',
      'total': q3.length,
      'percent': ((q3.length / surveyTotal) * 100).toFixed(1),
      'responses': q3Summary.sort(function (a, b) {
        return a.count - b.count;
      }).reverse()
    },
    'question4': {
      'question': 'Do You Currently Work?',
      'total': q4.length,
      'responses': [{
        'title': 'Yes',
        'count': q4.filter(el => el === 'true').length,
        'percent': JSON.parse(((q4.filter(el => el === 'true').length / q4.length) * 100).toFixed(1)),
      },
      {
        'title': 'No',
        'count': q4.filter(el => el === 'false').length,
        'percent': JSON.parse(((q4.filter(el => el === 'false').length / q4.length) * 100).toFixed(1)),
      }]
    },
    'question5': {
      'responses': q5,
      'names': q5Name,
      'points': {
        'features': workPoints,
        'bbox': turf.bbox(workPoints),
        'center': turf.center(workPoints)
      },
      'total': q5.length,
      'question': 'Where do you work?',
      'percent': ((q5.length / surveyTotal) * 100).toFixed(1)
    },
    'question6': {
      'question': 'How do you normally travel to/from work?',
      'total': q6.length,
      'percent': ((q6.length / surveyTotal) * 100).toFixed(1),
      'responses': q6Summary.sort(function (a, b) {
        return a.count - b.count;
      }).reverse()
    },
    'question7': {
      'question': 'Do you currently go to school?',
      'total': q7.length,
      'percent': ((q7.length / surveyTotal) * 100).toFixed(1),
      'responses': [{
        'title': 'Yes',
        'count': q7.filter(el => el === 'true').length,
        'percent': JSON.parse(((q7.filter(el => el === 'true').length / q7.length) * 100).toFixed(1)),
      },
      {
        'title': 'No',
        'count': q7.filter(el => el === 'false').length,
        'percent': JSON.parse(((q7.filter(el => el === 'false').length / q7.length) * 100).toFixed(1)),
      }]
    },
    'question8': {
      'question': 'Where do you go to school?',
      'responses': q8,
      'names': q8Name,
      'points': {
        'features': schoolPoints,
        'bbox': turf.bbox(schoolPoints),
        'center': turf.center(schoolPoints)
      },
      'total': q8.length,
      'percent': ((q8.length / surveyTotal) * 100).toFixed(1)
    },
    'question9': {
      'question': 'How do you normally travel to/from school?',
      'total': q9.length,
      'percent': ((q9.length / surveyTotal) * 100).toFixed(1),
      'responses': q9Summary.sort(function (a, b) {
        return a.count - b.count;
      }).reverse()
    },
    'question10': {
      'question': 'In general, how easy/difficult do you feel it is to walk 🚶 in Lake Elsinore?',
      'total': q10.length,
      'percent': ((q10.length / surveyTotal) * 100).toFixed(1),
      // 'responses': q10
      'responses': q10Summary.sort(function (a, b) {
        return a.count - b.count;
      }).reverse()
    },
    'question11': {
      'question': 'What are the biggest challenges for walking 🚶 in Lake Elsinore? What keeps you from walking more?',
      'total': q11.length,
      'percent': ((q11.length / surveyTotal) * 100).toFixed(1),
      'responses': q11
    },
    'question12': {
      'question': 'In general, how easy/difficult do you feel it is to bike 🚴‍ in Lake Elsinore?',
      'total': q12.length,
      'percent': ((q12.length / surveyTotal) * 100).toFixed(1),
      'responses': q12Summary.sort(function (a, b) {
        return a.count - b.count;
      }).reverse()
    },
    'question13': {
      'question': 'What are the biggest challenges for biking 🚴‍ in Lake Elsinore? What keeps you from biking more?',
      'total': q13.length,
      'percent': ((q13.length / surveyTotal) * 100).toFixed(1),
      'responses': q13
    },
    'commute': {
      'details': commuteGroup,
      'bbox': turf.bbox(commuteGroup)
    }
  };
  return summary;
}