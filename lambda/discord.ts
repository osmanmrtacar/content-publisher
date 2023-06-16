import {Handler} from 'aws-lambda';
import * as nacl from 'tweetnacl';
import * as AWS from 'aws-sdk';

export const handler: Handler = async (event, context) => {
  console.log(event);
  const PUBLIC_KEY = process.env.PUBLIC_KEY;
  const signature = event.headers['x-signature-ed25519'];
  const timestamp = event.headers['x-signature-timestamp'];
  const strBody = event.body; // should be string, for successful sign

  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + strBody),
    Buffer.from(signature, 'hex'),
    Buffer.from(PUBLIC_KEY, 'hex')
  );
  console.log(JSON.stringify({isVerified}));
  if (!isVerified) {
    return {
      statusCode: 401,
      body: JSON.stringify('invalid request signature'),
    };
  }

  // Replying to ping (requirement 2.)
  const body = JSON.parse(strBody);
  console.log({body});
  if (body.type === 1) {
    return {
      statusCode: 200,
      body: JSON.stringify({type: 1}),
    };
  }

  console.log(JSON.stringify({isShare: body.data.name === 'share'}));

  if (body.data.name === 'share') {
    try {
      const step = new AWS.StepFunctions();
      console.log(JSON.stringify({ARN: process.env.STATE_MACHINE_ARN}));

      if (process.env.STATE_MACHINE_ARN) {
        const resultExec = step.startExecution({
          stateMachineArn: process.env.STATE_MACHINE_ARN,
          input: JSON.stringify({
            platform: 'instagram',
          }),
        });

        console.log(JSON.stringify({resultExec}));
      }
    } catch (e) {
      console.log(e);
    }

    return JSON.stringify({
      // Note the absence of statusCode
      type: 4, // This type stands for answer with invocation shown
      data: {content: 'bar'},
    });
  }

  console.log(JSON.stringify({statusCode: 404}));

  return {
    statusCode: 404, // If no handler implemented for Discord's request
  };
};
