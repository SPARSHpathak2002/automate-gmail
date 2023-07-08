require('dotenv').config()
const nodemailer=require('nodemailer')
const {google}=require('googleapis')

const CLIENT_ID=process.env.CLIENT_ID
const CLIENT_SECRET=process.env.CLIENT_SECRET
const REDIRECT_URI='https://developers.google.com/oauthplayground'
const REFRESH_TOKEN=process.env.REFRESH_TOKEN
const USER_MAIL='sparshpathak2002@gmail.com'
const oAuth2Client=new google.auth.OAuth2(CLIENT_ID,CLIENT_SECRET,REDIRECT_URI)

oAuth2Client.setCredentials({refresh_token:REFRESH_TOKEN})


const fetchSentMail=async()=>{
    const accessToken=await oAuth2Client.getAccessToken()
    const gmail = google.gmail({ version: 'v1', auth:oAuth2Client});
    const response = await gmail.users.messages.list({
        userId: 'me',
        labelIds: ['SENT'],
      });
    
      const messages = response.data.messages;
    
      if (messages.length === 0) {
        console.log('No messages found.');
        return;
      }
      let sentEmails=new Set()
      for (const message of messages) {
        const messageResponse = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'metadata',
          metadataHeaders: ['To'],
        });
    
        const headers = messageResponse.data.payload.headers;
        const toHeader = headers.find((header) => header.name === 'To');
        if (toHeader) {
            if(toHeader.value.includes(',')){
                const e=toHeader.value.split(',')
                for (const i of e){
                    sentEmails.add(i)
                }
            }
            else{
            sentEmails.add(toHeader.value)
            }
        }
    
      }
      return sentEmails
    }
const fetchAllMail=async()=>{
    const accessToken=await oAuth2Client.getAccessToken()
    const gmail = google.gmail({ version: 'v1', auth:oAuth2Client});
    const response = await gmail.users.messages.list({
        userId: 'me',
        labelIds: ['INBOX'],
      });
    
      const messages = response.data.messages;
    
      if (messages.length === 0) {
        console.log('No messages found.');
        return;
      }
      let inboxEmails=new Set()
      for (const message of messages) {
        const messageResponse = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'metadata',
          metadataHeaders: ['To'],
        });
    
        const headers = messageResponse.data.payload.headers;
        const toHeader = headers.find((header) => header.name === 'To');
        if (toHeader) {
            if(toHeader.value.includes(',')){
                const e=toHeader.value.split(',')
                for (const i of e){
                    inboxEmails.add(i)
                }
            }
            else{
            inboxEmails.add(toHeader.value)
            }
        }
    
      }
      return inboxEmails
    }   

const sendMail = async (tomail) => {
    try {
      const accessToken = await oAuth2Client.getAccessToken();
      
      const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: `${USER_MAIL}`,
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken
        }
      });
      const mailOptions = {
        from: `SPARSH's AI Assistant 🧑 <${USER_MAIL}>`,
        to: `${tomail}`, // `${tomail}`
        subject: 'Testing Gmail API',
        text: "Hi, I am Sparsh Pathak's email assistant.",
        html: "Hi, I am <b>Sparsh Pathak</b>'s email assistant."
      };
      const result = await transport.sendMail(mailOptions);
  
      // Classify recipient's email under "BOT RESPOND" label
      const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
      const userId = `${USER_MAIL}`;
      const messageIds = result.messageId.split(',');
      console.log(messageIds)
      for (const messageId of messageIds) {
        console.log(messageId.trim().replace(/[<>]/g, ''))
        await gmail.users.messages.modify({
            'userId': userId,
            'id': messageId.trim(),
            'requestBody': {
                'addLabelIds': ['BOT-RESPOND'],
                'removeLabelIds': ['SENT']
            }
        });
      }
  
      return result;
    } catch (error) {
      return error;
    }
  };
  

async function getUniqueItems() {
    const sentEmails = await fetchSentMail();
    const inboxEmails = await fetchAllMail();
  
    const uniqueItems = new Set(
      Array.from(inboxEmails).filter(item => !sentEmails.has(item))
    );
  
    return uniqueItems;
  }
  

// getUniqueItems().then(result=>{
//     //console.log(result)
//     for(const email of result){
//         sendMail(email).then(result=>console.log('Email sent !')).catch(error=>console.log(error.message))
//     }
// }).catch(error=>console.log(error));

sendMail('200303105145@paruluniversity.ac.in').then(console.log('Email sent !'))
.catch(error=>console.log(error.message))
  
  