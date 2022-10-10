const core = require('@actions/core');
const github = require('@actions/github');

const axios = require('axios').default;

const validationURL = "https://app.getdigraph.com/api/notifications/installation"

try {
  // `tf-plan-json` input defined in action metadata file
  const tfInput = core.getInput('tf-plan-json');
  console.log(`Input is: ${tfInput}!`);
  if (!tfInput) {
    core.error('No tf-plan-json input provided.')
  }

  // Make API call and set response as output
  axios.post(validationURL, {tfPlan: tfInput}).then(function (response) {
    console.log(`API Response is:  ${response}`);
    core.setOutput("response", response);
  }).catch((error) => {
    console.log(`API Error is:  ${error}`);
    core.setOutput("response", error);
    core.error(`Something went wrong: ${error}`)
  })
  
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);

} catch (error) {
  core.setFailed(error.message);
}