# generic-reddit-bot

Generic reddit bot, which replies to a comment from each post in a subreddit.

The text from the post will be send to a rest url (which can be configured as an environment variable), which handles the text manipulation if needed.

Needed scopes: read (to read the post it replies to), history (to check if it already commented onto the post), identity (to also check if it already commented onto the post), submit (self explanatory) and privatemessages (to send a pm to the developer when it fails to comment onto a post) 

The Bot (currently) always answers to a comment from a post, configured by AUTOMOD_ID.
