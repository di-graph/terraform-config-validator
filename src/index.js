import core from "@actions/core"
import fetch from "node-fetch";
import fs from "fs"
import github from "@actions/github"
import path from "path"

const validationURL = "https://app.getdigraph.com/api/validate/terraform"

try {
  // `tf-plan-json` input defined in action metadata file
  const tfInput = core.getInput('tf-plan-json');
  console.log(`Input path is: ${tfInput}!`);
  if (!tfInput) {
    core.setFailed('No tf-plan-json input provided.')
  }

  const apiKey = core.getInput('digraph-api-key');
  if (!apiKey) {
    core.setFailed('No digraph-api-key provided.')
  }

  const eventName = github.context.eventName
  const ref = github.context.ref
  // // Get the JSON webhook payload for the event that triggered the workflow
  console.log(`The event name: ${eventName}`);
  console.log(`The event ref: ${ref}`);
  
  
  // need organization and repo
  const organization = github.context.repo.owner
  const repository = github.context.repo.repo

  console.log(`The event org: ${organization}`);
  console.log(`The event repo: ${repository}`);  

  fs.readFile(tfInput, (err, tfFile) => {
    if (err) {
      console.log(`Error: ${err.message}`);
      core.setFailed(err.message)
    }
    const jsonTFFile = JSON.parse(tfFile)
    const resourceChanges = jsonTFFile['resource_changes']
    let actualChanges = []
    resourceChanges?.forEach((resourceChange) => {
      if (resourceChange?.change?.actions && resourceChange?.change?.actions.length > 0 && resourceChange?.change?.actions[0] != "no-op") {
        actualChanges.push(resourceChange)
      }
    })
    const parsedJSONPlan = {"resource_changes" : actualChanges}
    // Make API call and set response as output
    let apiResponse
    let body = {
      terraform_plan: parsedJSONPlan,
      organization: organization,
      repository: repository,
      event_name: eventName,
      ref: ref
    }
    if (eventName == "push") {
      const commit_sha = github.context.payload.after
      console.log(`The event commit sha: ${commit_sha}`);
      body = {
        ...body, 
        commit_sha: commit_sha
      }
    } else {
      const issue_number = github.context.payload.pull_request?.number
      console.log(`The event issue number: ${issue_number}`);
      body = {
        ...body, 
        issue_number: issue_number
      }
    }

    const headers = {
      "X-Digraph-Secret-Key": apiKey
    }
      
    fetch(validationURL, {method: "POST", headers: headers, body: JSON.stringify(body)}).then(function (response) {
      apiResponse = response
      return response.json()
    }).then((jsonData) => {
      if (apiResponse.ok) {
        console.log(`API Response is:  ${JSON.stringify(jsonData)}`);
        core.setOutput("response", jsonData);
      } else {
        console.log(`API failed with ${apiResponse.status}: ${JSON.stringify(jsonData)}`);
        // fail the action if the API call didn't succeed
        core.setOutput(JSON.stringify(jsonData));
      }
    })
  });
} catch (error) {
  core.setOutput(error.message);
}