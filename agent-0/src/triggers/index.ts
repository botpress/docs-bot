// import { Trigger } from '@botpress/runtime'
//
// /**
//  * An event subscription that fires automatically when the specified events occur.
//  * Bot events:    'register', 'message.created', 'conversation.started', 'conversation.ended',
//  *                'user.created', 'workflow.started', 'workflow.completed', 'workflow.failed'
//  * Webchat:       'webchat:conversationStarted', 'webchat:trigger'
//  * Slack:         'slack:reactionAdded', 'slack:memberJoinedChannel'
//  * Linear:        'linear:issueCreated', 'linear:issueUpdated'
//  * GitHub:        'github:issueOpened', 'github:pullRequestMerged'
//  * Run `adk info <integration>` to see all events for an integration.
//  */
// export default new Trigger({
//   name: 'onRegister',
//   description: 'Runs on bot startup to initialize state',
//   events: ['register'],
//   handler: async () => {
//     console.log('Bot started!')
//   },
// })
