// Assuming A, B, X, and Y are not part of the random letter pairs to avoid overlap with normal trials
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

const numTrials = 3; // Adjust as necessary
let trials = [];
for (let i = 0; i < numTrials; i++) {
  trials.push(weightedRandomSelect());
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

shuffleArray(trials);

var timeline = [];

timeline.push({
  type: "html-keyboard-response",
  stimulus: "Welcome to the experiment. Press any key to begin."
});

timeline.push({
  type: "html-keyboard-response",
  stimulus: "<p>In this experiment, a pair of letters will appear in the center of the screen, one after the other.</p><p>If you see the sequence <strong>A-X</strong>, press the letter J on the keyboard as fast as you can.</p><p>For any other letter sequence, press the letter F.</p><p>Press any key to begin.</p>",
  post_trial_gap: 2000
});

trials.forEach(trial => {
  timeline.push({
    type: "html-keyboard-response",
    stimulus: '<div style="font-size:60px;">+</div>',
    choices: jsPsych.NO_KEYS,
    trial_duration: 300
  });

  timeline.push({
    type: "html-keyboard-response",
    stimulus: trial.cue_stimulus,
    choices: jsPsych.NO_KEYS,
    trial_duration: 300
  });

  timeline.push({
    type: "html-keyboard-response",
    stimulus: '',
    choices: jsPsych.NO_KEYS,
    trial_duration: 4900
  });

  timeline.push({
    type: "html-keyboard-response",
    stimulus: trial.probe_stimulus,
    choices: ['f', 'j'],
    trial_duration: 300,
    data: { correct_response: trial.correct_response }
  });

  timeline.push({
    type: "html-keyboard-response",
    stimulus: '', // No stimulus, just capture the response
    choices: ['f', 'j'],
    trial_duration: 1000,
    on_finish: function(data) {
      if (data.rt <= 300) {
        data.correct = jsPsych.pluginAPI.compareKeys(data.response, trial.correct_response);
        data.isLate = false;
      } else if (data.rt > 300 && data.rt <= 1300) {
        data.correct = jsPsych.pluginAPI.compareKeys(data.response, trial.correct_response);
        data.isLate = true;
      } else {
        data.isLate = true;
      }
    }
  });

  timeline.push({
    type: "html-keyboard-response",
    stimulus: function() {
      var lastTrialData = jsPsych.data.getLastTrialData().values()[0];
      if (lastTrialData.rt === null) {
        return "Response too slow, please respond faster in the next trial.";
      } else if (lastTrialData.isLate) {
        return "Your response was late. Please try to respond faster.";
      } else {
        return "The response window is closed, the next trial will begin.";
      }
    },
    choices: jsPsych.NO_KEYS,
    trial_duration: 900
  });
});

