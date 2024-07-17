const letters = "CDEFGHIJKLMNOPQRSTUVWXYZ".split('');

function weightedRandomSelect() {
  var weightedStimuli = [
    { weight: 70, stimuli: { combo: 'AX', cue_stimulus: '<p style="font-size:80px; font-family: Helvetica;">A</p>', probe_stimulus: '<p style="font-size:80px; font-family: Helvetica;">X</p>', correct_response: 'j' } },
    { weight: 10, stimuli: { combo: 'AY', cue_stimulus: '<p style="font-size:80px; font-family: Helvetica;">A</p>', probe_stimulus: '<p style="font-size:80px; font-family: Helvetica;">Y</p>', correct_response: 'f' } },
    { weight: 10, stimuli: { combo: 'BX', cue_stimulus: '<p style="font-size:80px; font-family: Helvetica;">B</p>', probe_stimulus: '<p style="font-size:80px; font-family: Helvetica;">X</p>', correct_response: 'f' } },
    { weight: 10, stimuli: { combo: 'BY', cue_stimulus: '<p style="font-size:80px; font-family: Helvetica;">B</p>', probe_stimulus: '<p style="font-size:80px; font-family: Helvetica;">Y</p>', correct_response: 'f' } }
  ];
  var totalWeight = weightedStimuli.reduce((total, item) => total + item.weight, 0);
  var random = Math.random() * totalWeight;
  var weightSum = 0;

  for (var i = 0; i < weightedStimuli.length; i++) {
    weightSum += weightedStimuli[i].weight;
    if (random <= weightSum) {
      return weightedStimuli[i].stimuli;
    }
  }
}

// Parameters to control the number of each type of trial
const numTrials = 19; // Set to 100 or any other number based on your experimental design

// Generate trials
let trials = [];
for (let i = 0; i < numTrials; i++) {
  trials.push(weightedRandomSelect());
}

console.log(trials.length);
console.log(trials); //log trial generated

// Shuffle trials to mix them
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

shuffleArray(trials);

/* Create jsPsych timeline */
var timeline = [];


// Adding trials to the timeline
//trials.forEach(trial => {
  // Fixation
//  timeline.push({
//    type: "html-keyboard-response",
//    stimulus: '<div style="font-size:60px;">+</div>',
//    choices: jsPsych.NO_KEYS,
//    trial_duration: 300
//  });

  // Cue letter
//  timeline.push({
//    type: "html-keyboard-response",
//    stimulus: trial.cue_stimulus,
//    choices: jsPsych.NO_KEYS,
//    trial_duration: 300
//  });

  // Delay (empty screen)
  timeline.push({
    type: "html-keyboard-response",
    stimulus: '',
    choices: jsPsych.NO_KEYS,
    trial_duration: 4900
  });

  // Probe letter and initial response window
  timeline.push({
    type: "html-keyboard-response",
    stimulus: trial.probe_stimulus,
    choices: ['f', 'j'],
    trial_duration: 300, // Duration of probe display
    data: { correct_response: trial.correct_response }
  });

  // Extend response window to capture late responses
  timeline.push({
    type: "html-keyboard-response",
    stimulus: '', // No stimulus, just capture the response
    choices: ['f', 'j'],
    trial_duration: 1000, // Extended duration to capture responses
    on_finish: function(data) {
      data.correct = jsPsych.pluginAPI.compareKeys(data.response, trial.correct_response);
    }
  });

  // End trial message
  timeline.push({
    type: "html-keyboard-response",
    stimulus: function() {
      var lastTrialData = jsPsych.data.getLastTrialData().values()[0];
      if(lastTrialData.response === null) {
        return "Response too slow, please respond faster in the next trial.";
      } else {
        return "The response window is closed, the next trial will begin.";
      }
    },
    choices: jsPsych.NO_KEYS,
    trial_duration: 900
  });

