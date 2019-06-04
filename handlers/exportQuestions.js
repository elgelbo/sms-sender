const fs = require('fs')
const quests = require('../survey_eng');

const map = quests.questions.map((x, index) => {
  const string = `\r\n\r\nQuestion #${index+1}\r\n${x.text}`;
  return string;
});
fs.writeFile(`./finalEnglishQuestions.txt`, map, function (err) {
  if (err) { throw err };
  console.log(`Saved: ./data/finalSpanishQuestions.txt`);
});