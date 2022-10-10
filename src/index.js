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
    if (response.status == "200") {
      console.log(`API Response is:  ${JSON.stringify(response)}`);
      core.setOutput("response", JSON.stringify(response));
    } else {
      console.log(`API failed with ${response.status}: ${response.body}`);
      core.setOutput("response", "error");
      core.setFailed(`Something went wrong: ${JSON.stringify(response)}`)
    }
  })

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}