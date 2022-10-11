import core from "@actions/core"
import fetch from "node-fetch";
import github from "@actions/github"

const validationURL = "https://app.getdigraph.com/api/validate/terraform"

try {
  // `tf-plan-json` input defined in action metadata file
  const tfInput = core.getInput('tf-plan-json');
  console.log(`Input is: ${tfInput}!`);
  if (!tfInput) {
    core.setFailed('No tf-plan-json input provided.')
  }

  // Make API call and set response as output
  let apiResponse
  const body = {
    terraform_plan: tfInput
  }
  fetch(validationURL, {method: "POST", body: JSON.stringify(body)}).then(function (response) {
    apiResponse = response
    return response.json()
  }).then((jsonData) => {
    if (apiResponse.ok) {
      console.log(`API Response is:  ${JSON.stringify(jsonData)}`);
      core.setOutput("response", jsonData);
    } else {
      console.log(`API failed with ${apiResponse.status}: ${JSON.stringify(jsonData)}`);
      core.setOutput("response", jsonData);
    }
  })

  // // Get the JSON webhook payload for the event that triggered the workflow
  // const payload = JSON.stringify(github.context.payload, undefined, 2)
  // console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}