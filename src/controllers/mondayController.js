import AbortController from "abort-controller"

const api_key = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjExNTM5MzU1MSwidWlkIjoyMjM5MDcwMiwiaWFkIjoiMjAyMS0wNi0yOVQxNDo1MjoxNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6OTExMDA5NiwicmduIjoidXNlMSJ9.omzcoKrTHw63_L1ctkCQla6RuNeZWaR7WEBU8jP1k58";

const fetch = require('node-fetch');
const request = require('request');

let controller = new AbortController();
let signal = controller.signal;


async function challange(req, res)
{
  if (req.body.challange)
  {
    console.log(JSON.stringify(req.body, 0, 2)); 
    res.status(200).send(req.body);
  }

  else
  {
    const pulseId = req.body.event.pulseId;
   
    console.log(pulseId);

    let query1 = `query{ items (ids: ${pulseId}) { column_values (ids: [text, text44] ) { id type value text } } }` // text = sender_id , text44 = message to send

    const data = await fetch("https://api.monday.com/v2",{
      method:"post",
      headers: {
        'Content-Type': 'application/json',
        'Authorization' : api_key
      },
      body:JSON.stringify({
        'query' : query1,
      })
    })
      .then(res => res.json())

    let sender_id = data.data.items[0].column_values[1].text
    let response = data.data.items[0].column_values[0].text
    if (sender_id && response)
    {
      response = {
        "text": response
      }
      sendMessageToFacebook(sender_id, response); 
    }
  }

}

  // Query 4: Create a new item and populate column values
function start_fetch(vars2, sender_psid){
  let query5 = 'mutation ($myItemName: String!, $columnVals: JSON!) { create_item (board_id:3316014705, item_name:$myItemName, column_values:$columnVals) { id } }';
  let vars = vars2;
  fetch ("https://api.monday.com/v2", {
      method: 'post',
      signal: controller.signal,
      headers: {
          'Content-Type': 'application/json',
          'Authorization' : api_key
      },
      body: JSON.stringify({
          'query' : query5,
          'variables' : JSON.stringify(vars)
      })
  })
    .then(res => res.json())
    .then(res => console.log(JSON.stringify(res, null, 2)))
  }

// Sends response messages via the Send API
function sendMessageToFacebook(sender_psid, response) {
  // Construct the message body
  console.log(response)
  let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": response
    }
  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}


module.exports = {
  start_fetch: start_fetch,
  challange: challange,
}
