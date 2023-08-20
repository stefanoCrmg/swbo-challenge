## How to run the project

`pnpm i && pnpm dev`

## Assumptions
The most important assumption made is that the `/api/eur-rates` is a "lossy" API that sometimes returns `null` to a client to which they've already sent some data for a currency.
So, hopefully as quickly as possible, it will eventually return data for each currency.

Given this assumption I went for the following approach: 
   1. continously poll the API while saving any returned data in a cache.
   2. the polling will stop when the client has gotten at least one conversion rate for every currency.
   3. if the API returns some data for a currency for which the client already has a quote, expect it to be the most up-to-date conversion rate.

This approach can quickly backfire if the API does not return data quickly or we need _ a lot_ of API calls to get all the conversion rates for every currency.
The bright side is that once we've got all the data the user will have a compiled table and won't have to wait any longer for the data to show.

Another route woud have been to progressively render data in the table as soon as a conversion rate was returned by the API.
This approach would still require a cache as we would have to handle temporaly-unavailable conversion rates as well as repeated conversion rates (for which we would probably still keep the latest).
This approach could be better as far as UX goes as it would quickly show some data to our user, but it would still require continously polling the API.

If the API has to keep being "lossy", a better approach to the whole sitution would have been sharing a websocket between client and server or having the server send updated quotes to the client via server sent events.


I've also made the assumption that the backend API will always be `https://localhost:8080`. This is of course not realistic and instead I would generally put the URL in an environment variable and validate its presence (and kind) at compile time.