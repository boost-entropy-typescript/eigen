# Deploy a hotfix build

Occasionally a bug is found in a live release that requires a quick mitigation. For these cases we can deploy a build outside our normal release cadence with _only_ the critical bug fix added.

There are 2 methods of deploying hot fixes depending on the issue:

1. **Codepush Releases**: If the issue only affects javascript code we can deploy a hotfix with Codepush and users will get the update automatically on the next run of the app.

2. **Native Releases**: If the issue affects native code we must deploy new build and send through the app review process as normal. Note this build will still need to go through the review process and user's will need to update so this is only a mitigation not an immediate fix. If a faster release is necessary you can request an expedited review for the app store but this should be done sparingly and is not guaranteed to be approved. Google Play does not offer expedited reviews but their review process is typically faster.

## Install Prerequisites

The first time you deploy a hotfix you will need to install the app-center cli:

```
yarn global add appcenter-cli
```

## Get the release files and environment variables

Run:

```
yarn setup:releases
```

## Check out the tag corresponding with the last release of Eigen

All our live release versions should have a corresponding tag in git that will end in `-submission`.

You can find the latest release tags using the script:

`./scripts/deploys/latest-submissions`

This will output the latest submission tags:

```
Latest iOS submission: ios-8.34.0-2024.03.07.11-submission
Latest Android submission: android-8.34.0-1674645623-submission
```

If it was a typical release they should be equivalent code and you should be safe to choose one, but if you have doubts you can confirm in the compare view in github.

For our example let's say our last released build is `7.2.0 (2022.2.3.14)`
We will want to checkout the tag `ios-7.2.0-2022.02.03.14-submission`:

`git checkout ios-7.2.0-2022.02.03.14-submission`

## Create a branch for the hotfix

`git branch 7.2.0-hotfix`

`git checkout 7.2.0-hotfix`

## Apply the fix(es) using the script

Get the commit hash for the bug fix you want to release in the hotfix. If it was merged into main you want the hash of the merge commit.
You can find it in the github ui or by checking out main after the merge and running `git log --oneline`.

Run the script `./scripts/codepush/apply-fix.sh <commit-hash>`
Passing the commit hash of the fix, if there are multiple you can run multiple times.

If you see output like: `Warning: native code changed you cannot use codepush for this hotfix, please follow the native beta deployment steps.`
The changes affected native code and cannot be deployed through codepush, please follow the `Native release hotfix process` section of this document.
Otherwise follow the steps in `Codepush release hotfix process`.

<details>
  <summary>Codepush release hotfix process</summary>

## Deploy your change to codepush canary deployment

Let `#practice-mobile` know you will be deploying a hotfix and to hold off deploying to codepush or betas.

Run the script to deploy the hotfix to the canary deployment:
`./scripts/codepush/deploy-to-codepush.sh 'Canary' 'hotfix description'`

## Test your codepush change in the production app

Download the latest app from the app store or play store
Enable the dev menu and download the codepush bundle from the staging deployment.
Test that the fix is working as intended and do some basic QA to make sure the app is functioning correctly.

## Promote the codepush bundle to production

If QA goes well run the script to promote the bundle to production.
Make sure to monitor the app as it rolls out to users.

`./scripts/codepush/promote-release-to-prod.sh <rollout_percentage>`

For example if you wanted to rollout to 50% of users you would pass `50` for rollout_percentage. If it is critical to get the fix out fast
you can pass `100` otherwise it is suggested you pass `50` and monitor before updating to 100%.

### Update rollout

If all looks good with the fix you can update the rollout to all users:

`./scripts/codepush/update_rollout.sh 100`

</details>

<details>
  <summary>Native release hotfix process</summary>

## Update the version number of the app to match next release

Since the hotfix branch is a past release the app version will need to be updated to submit to Apple and Google Play. The next release version can be found in app store connect and is generally the previous release's version number incremented by 1. In this example it is 7.2.1

`./scripts/deploys/next`

`What is the new human-readable release version? 7.2.1`

Commit the version changes.

`git add -A`

`git commit -m "Update version for hotfix"`

## Deploy a beta with the hotfix

Communicate with other devs that a hotfix will be deployed and they should hold off on deploying betas until a build is submitted for review.

`./scripts/deploys/deploy-beta-both` (or `./scripts/deploys/deploy-beta-ios` or `./scripts/deploys/deploy-beta-android` for individual releases)

## Run through QA script and release to the app store

Follow the instructions for [deploying to app store](https://github.com/artsy/eigen/blob/main/docs/deploy_to_app_store.md) and [deploying to play store](https://github.com/artsy/eigen/blob/main/docs/deploy_to_play_store.md).

Make sure to QA the bug fix changes and run through the QA script before releasing to users.

</details>
