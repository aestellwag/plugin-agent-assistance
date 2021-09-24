<a  href="https://www.twilio.com">
<img  src="https://static0.twilio.com/marketing/bundles/marketing/img/logos/wordmark-red.svg"  alt="Twilio"  width="250"  />
</a>

# Recommended Plugin Pairing

This plugin pairs extremely well with the Supervisor Barge/Coach Plugin (which gives the Supervisor the ability to barge into the call or coach the agent):  
https://github.com/twilio-professional-services/plugin-supervisor-barge-coach


# Twilio Flex Plugin - Agent Assistance

Twilio Flex Plugins allow you to customize the appearance and behavior of [Twilio Flex](https://www.twilio.com/flex). If you want to learn more about the capabilities and how to use the API, check out our [Flex documentation](https://www.twilio.com/docs/flex).

This plugin adds the ability for the agent to ask for assistance from a supervisor.  While on a task the agent can click the "Agent Assistance" button to alert supervisors that they need assistance.  From the Supervisor perspecitve, they will receive an alert that gives them the ability to navigate to the Team's View tab.  From the team's view tab, the Task Card will show as Red for any agent that requires assistance.  Upon monitoring a call or if the agent clicks to turn off assistance, the will clear the Task Card back to normal.

This plugin pairs extremely well with the Supervisor Barge/Coach Plugin (which gives the Supervisor the ability to barge into the call or coach the agent):  
https://github.com/twilio-professional-services/plugin-supervisor-barge-coach

This is the agent assistance button available to the agent while on a task:
![Plugin Demo](https://github.com/aestellwag/plugin-agent-assistance/blob/main/Agent-Assistance-Demo-2.gif)

Once the agent as clicked the Agent Assistance button, this Alert will broadcast to each supervisor
![Plugin Demo](https://github.com/aestellwag/plugin-agent-assistance/blob/main/Agent-Assistance-Demo-3.gif)

Once the Supervisor navigates to the Team's View tab, they will see which agents are need assistance
![Plugin Demo](TBD)

This button is available to Supervisors to mute the Agent Assistance Alert's if they wish
![Plugin Demo](https://github.com/aestellwag/plugin-agent-assistance/blob/main/Agent-Assistance-Demo-1.gif)

## Pre-req

To deploy this plugin, you will need:

- An active Twilio account with Flex provisioned. Refer to the [Flex Quickstart](https://www.twilio.com/docs/flex/quickstart/flex-basics#sign-up-for-or-sign-in-to-twilio-and-create-a-new-flex-project") to create one.
- npm version 5.0.0 or later installed (type `npm -v` in your terminal to check)
- Node.js version 10.12.0 or later installed (type `node -v` in your terminal to check)
- [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli) along with the [Flex CLI Plugin](https://www.twilio.com/docs/twilio-cli/plugins#available-plugins) and the [Serverless Plugin](https://www.twilio.com/docs/twilio-cli/plugins#available-plugins). Run the following commands to install them:
  ```
  # Install the Twilio CLI
  npm install twilio-cli -g
  ```
- A GitHub account

## Setup

Make sure you have [Node.js](https://nodejs.org) as well as [`npm`](https://npmjs.com) installed.

Navigate to the primary plugin folder and run NPM install for the plugin
```bash
cd plugin-agent-assistance
npm install
```

From the public folder, create the appConfig.js
```bash
cd public
rename appConfig.example.js to appConfig.js
```

## Development

In order to develop locally, you can use the Webpack Dev Server by running (from the root plugin directory):

```bash
Twilio flex:plugins:start
```

This will automatically start up the Webpack Dev Server and open the browser for you. Your app will run on `http://localhost:3000`. If you want to change that you can do this by setting the `PORT` environment variable:

When you make changes to your code, the browser window will be automatically refreshed.

## Deploy

When you are ready to deploy your plugin, in your terminal run:
```
Run: 
twilio flex:plugins:deploy --major --changelog "Notes for this version" --description "Functionality of the plugin"
```
For more details on deploying your plugin, refer to the [deploying your plugin guide](https://www.twilio.com/docs/flex/plugins#deploying-your-plugin).

## View your plugin in the Plugins Dashboard

After running the suggested next step with a meaningful name and description, navigate to the [Plugins Dashboard](https://flex.twilio.com/admin/) to review your recently deployed and released plugin. Confirm that the latest version is enabled for your contact center.

You are all set to test the Agent Assitance feature on your Flex instance!


---

## Changelog

### 1.0.0

**May 25, 2021**

- Initial Release of the Agent Assistance Plugin


## Disclaimer
This software is to be considered "sample code", a Type B Deliverable, and is delivered "as-is" to the user. Twilio bears no responsibility to support the use or implementation of this software.