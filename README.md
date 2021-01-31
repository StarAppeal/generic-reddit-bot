# generic-reddit-bot
Generic reddit bot, which replies to a comment from each post in a subreddit.

The text from the post will be send to a rest url (which can be configured in an .env file), which handles the text manipulation if needed.

Needed scopes, so that the bot will work: read, history, identity, submit

The Bot (currently) always answers to a comment from a post, configured by AUTOMOD_ID. 
