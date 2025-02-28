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

  const numTrials = 4; // Set to 100 or any other number based on your experimental design
  let trials = [];
  for (let i = 0; i < numTrials; i++) {
    trials.push(weightedRandomSelect());
  }
  console.log(trials.length);
  console.log(trials); //log trial generated
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  shuffleArray(trials);

  let timeline = [];

  timeline.push({
    type: "html-keyboard-response",
    stimulus: "Welcome to the experiment. Press any key to begin."
  });

  timeline.push({
    type: "html-keyboard-response",
    stimulus: "<p>In this experiment, a pair of letters will appear in the center of the screen, one after the other.</p><p>If you see the sequence <strong>A-X</strong>, press the letter J on the keyboard as fast as you can.</p><p>For any other letter sequence, press the letter F.</p><p>Press any key to begin.</p>",
    post_trial_gap: 2000
  });

  let responseGivenDuringProbe = false;
  
  trials.forEach(trial => {
    let variedtime = Math.floor(Math.random() * (2000 - 1000)) + 1000
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
      stimulus: "",
      choices: jsPsych.ALL_KEYS,
      response_ends_trial: false,
      trial_duration: 700
    });

    timeline.push({
      type: "html-keyboard-response",
      stimulus: "",
      choices: jsPsych.NO_KEYS,
      trial_duration: variedtime
    });

    timeline.push({
      type: "html-keyboard-response",
      stimulus: trial.probe_stimulus,
      choices: ['f', 'j'],
      trial_duration: 1000, // Duration of probe display
      stimulus_duration: 300,
    });

    // Conditional node to check if extending the response window is necessary
    timeline.push({
      timeline: [{
        type: "html-keyboard-response",
        stimulus: '', // No stimulus, just capture the response
        choices: ['f', 'j'],
        trial_duration: 1000, // Extended duration to capture responses
        data: {
          correct_response: trial.correct_response
        },
        on_finish: function(data) {
          if (data.response !== null) {
            data.correct = jsPsych.pluginAPI.compareKeys(data.response, data.correct_response); // Evaluate correctness of the response
          }
        }
      }],
      conditional_function: function() {
        // Check if response was given during the probe; if so, skip the extension
        return !responseGivenDuringProbe;
      }
    });

    timeline.push({
      type: "html-keyboard-response",
      stimulus: function() {
        return "The response window is closed, the next trial will begin.";
      },
      choices: jsPsych.NO_KEYS,
      trial_duration: variedtime
    });

    // Assign the final timeline
    core.timeline = timeline;
  });

  core.on_finish = function (data) {
    /* Change 5: Summarizing and save the results to Qualtrics */
    // summarize the results
    // var trials = jsPsych.data.get().filter({
    //     test_part: 'test'
    // });
    // var correct_trials = trials.filter({
    //     correct: true
    // });
    // var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
    // var rt = Math.round(correct_trials.select('rt').mean());

    // save to qualtrics embedded data
    // Qualtrics.SurveyEngine.setEmbeddedData("accuracy", accuracy);
    // Qualtrics.SurveyEngine.setEmbeddedData("rt", rt);
    // The Json string
   // let jsonData_testing = JSON.stringify(jsPsych.data.get().json());
    var trial_data = jsPsych.data.get().values();

    var offset=0;
    var chunk_size = 120;
    var block = 0;
    while (offset < trial_data.length){
      let curr_data = trial_data.slice(offset, chunk_size);
      let varname = "jsPsychData_testing_"+block;

      Qualtrics.SurveyEngine.setEmbeddedData(varname, JSON.stringify(curr_data));

      offset += chunk_size;
      block += 1;
    }

    //Qualtrics.SurveyEngine.setEmbeddedData("jsPsychData_testing", jsonData_testing);
        /* Change 6: Adding the clean up and continue functions.*/
        // clear the stage
    jQuery('#display_stage').remove();
    jQuery('#display_stage_background').remove();

    // simulate click on Qualtrics "next" button, making use of the Qualtrics JS API
    // this.clickNextButton();
}

  return core
})()
