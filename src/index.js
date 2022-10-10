import core from "@actions/core"
import fetch from "node-fetch";
import github from "@actions/github"

const validationURL = "https://app.getdigraph.com/api/notifications/installation"

try {
  // `tf-plan-json` input defined in action metadata file
  const tfInput = core.getInput('tf-plan-json');
  console.log(`Input is: ${tfInput}!`);
  if (!tfInput) {
    core.setFailed('No tf-plan-json input provided.')
  }

  // Make API call and set response as output
  fetch(validationURL, {method: "POST", body: {tfPlan: tfInput}}).then(function (response) {
    if (response.ok) {
      console.log(`API Response is:  ${response.json()}`);
      core.setOutput("response", response.json());
    } else {
      console.log(`API failed with ${response.status}: ${response.json()}`);
      core.setOutput("response", response.body);
    }
  })

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}