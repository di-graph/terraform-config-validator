import core from "@actions/core"
import fetch from "node-fetch";
import fs from "fs"
import github from "@actions/github"
import path from "path"

const validationURL = "https://app.getdigraph.com/api/validate/terraform"

try {
  // `tf-plan-json` input defined in action metadata file
  const tfInput = core.getInput('tf-plan-json');
  console.log(`Input is: ${tfInput}!`);
  if (!tfInput) {
    core.setFailed('No tf-plan-json input provided.')
  }

  // // Get the JSON webhook payload for the event that triggered the workflow
  console.log(`The event name: ${github.context.eventName}`);
  
  // need organization, repo and commit SHA
  const organization = github.context.repo.owner
  const repository = github.context.repo.repo
  const commitSHA = github.context.payload.after

  console.log(`The event org: ${organization}`);
  console.log(`The event repo: ${repository}`);  
  console.log(`The event commit sha: ${commitSHA}`);

  fs.readFile(tfInput, (err, tfFile) => {
    if (err) {
      console.log(`Error: ${err.message}`);
      core.setFailed(err.message)
    }
    const jsonTFFile = JSON.parse(tfFile)
    // Make API call and set response as output
    let apiResponse
    const body = {
      terraform_plan: JSON.stringify(jsonTFFile),
      organization: organization,
      repository: repository,
      commit_sha: commitSHA
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
  });
} catch (error) {
  core.setFailed(error.message);
}