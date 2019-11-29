const brain = require("brain.js");

const symptoms = [
  // allergy
  "sneezing",
  "hives",
  "anaphylaxis",
  "runny",
  "stuffynose",
  "tingling in the mouth",
  "itch",
  "skin rash",
  // cardiology
  "chestdiscomfort",
  "nausea",
  "indigestion",
  "heartburn",
  "dizzy",
  "throatorjawpain",
  "sweating",
  "cough",
  "legsfeetanklesareswollen",
  "stomachpain",
  "irregularheartbeat",
  //  chiropractor
  "uppermidorlowbackpain",
  "neckpain",
  "stiffnessshoulder",
  "painextremitypainarmleg",
  "hippain",
  "kneepain",
  "anklefootpain",
  "headaches"
];
let trainingData = [];
for (let i = 0; i < symptoms.length; i++) {
    i<8? trainingData.push({input:symptoms[i],output:'allergy/immunology'}) :
    (i >= 8 && i < 19) ? trainingData.push({ input: symptoms[i], output: 'cardiology' }):
    i >= 19 ? trainingData.push({ input: symptoms[i], output: 'chiropractor' }) :''
}
const net = new brain.recurrent.LSTM();
net.train(trainingData, {
    iterations: 100,
    erroThresh: 0.00011
});

exports.predict = symptoms => {
  return net.run(symptoms);
};
