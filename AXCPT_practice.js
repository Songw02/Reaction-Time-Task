// Assuming A, B, X, and Y are not part of the random letter pairs to avoid overlap with normal trials
window.AXCPT_test = (function() {
  var core ={};

  const letters = "CDEFGHIJKLMNOPQRSTUVWXYZ".split('');

  function weightedRandomSelect() {
    var weightedStimuli = [
      { weight: 25, stimuli: { combo: 'AX', cue_stimulus: '<p style="font-size:80px; font-family: Helvetica;">A</p>', probe_stimulus: '<p style="font-size:80px; font-family: Helvetica;">X</p>', correct_response: 'j' } },
      { weight: 25, stimuli: { combo: 'AY', cue_stimulus: '<p style="font-size:80px; font-family: Helvetica;">A</p>', probe_stimulus: '<p style="font-size:80px; font-family: Helvetica;">Y</p>', correct_response: 'f' } },
      { weight: 25, stimuli: { combo: 'BX', cue_stimulus: '<p style="font-size:80px; font-family: Helvetica;">B</p>', probe_stimulus: '<p style="font-size:80px; font-family: Helvetica;">X</p>', correct_response: 'f' } },
      { weight: 25, stimuli: { combo: 'BY', cue_stimulus: '<p style="font-size:80px; font-family: Helvetica;">B</p>', probe_stimulus: '<p style="font-size:80px; font-family: Helvetica;">Y</p>', correct_response: 'f' } }
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
  const numTrials = 4; // Set to 100 or any other number based on your experimental design

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

  /* Welcome and instructions */
  timeline.push({
    type: "html-keyboard-response",
    stimulus: "Welcome to the experiment. Press any key to begin."
  });

  timeline.push({
    type: "html-keyboard-response",
    stimulus: "<p>In this experiment, a pair of letters will appear in the center of the screen, one after the other.</p><p>If you see the sequence <strong>A-X</strong>, press the letter J on the keyboard as fast as you can.</p><p>For any other letter sequence, press the letter F.</p><p>Press any key to begin.</p>",
    post_trial_gap: 2000
  });

  // Adding trials to the timeline
  trials.forEach(trial => {
    // Fixation
    let variedtime = Math.floor(Math.random() * (2000 - 1000)) + 1000;
    timeline.push({
      type: "html-keyboard-response",
      stimulus: '<div style="font-size:60px;">+</div>',
      choices: jsPsych.NO_KEYS,
      trial_duration: 300
    });

    // Cue letter
    timeline.push({
      type: "html-keyboard-response",
      stimulus: trial.cue_stimulus,
      choices: jsPsych.NO_KEYS,
      trial_duration: 300
    });

    // Delay (empty screen)
    timeline.push({
      type: "html-keyboard-response",
      stimulus: '',
      choices: jsPsych.NO_KEYS,
      trial_duration: 700
    });

    timeline.push({
      type: "html-keyboard-response",
      stimulus: "",
      choices: jsPsych.NO_KEYS,
      trial_duration: variedtime
    });

    // Probe letter and initial response window
    timeline.push({
      type: "html-keyboard-response",
      stimulus: trial.probe_stimulus,
      choices: ['f', 'j'],
      trial_duration: 1000,
      stimulus_duration: 300,
      response_ends_trial: true,
      data: {
        correct_response: trial.correct_response
      },
      on_finish: function(data) {
        if (data.response !== null) {
          data.correct = jsPsych.pluginAPI.compareKeys(data.response, data.correct_response);
          return "Response too slow, please respond faster in the next trial.";
        }
      }
    });


  });

  core.on_finish = function(data) {
    // Retrieve the data from jsPsych
    var trial_data = jsPsych.data.get().values();
  
    // Initialize offset and chunk size variables
    var offset = 0;
    var chunk_size = 120; // This is the size of each data chunk to be saved
    var block = 0;
  
    // Loop to save data in chunks
    while (offset < trial_data.length) {
      // Calculate the end of the current chunk
      let end = offset + chunk_size;
      
      // Get the current chunk of data
      let curr_data = trial_data.slice(offset, end);
      let varname = "jsPsychData_testing_" + block;
  
      // Save the current chunk to Qualtrics Embedded Data
      Qualtrics.SurveyEngine.setEmbeddedData(varname, JSON.stringify(curr_data));
  
      // Update offset and block number
      offset = end;
      block += 1;
    }
  
    // Remove the display stage elements
    jQuery('#display_stage').remove();
    jQuery('#display_stage_background').remove();
  }
  

return core
})()