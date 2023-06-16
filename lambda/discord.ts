import { Handler,Context, APIGatewayProxyCallback } from "aws-lambda";
import * as nacl from "tweetnacl";
import * as AWS from "aws-sdk";

export const handler: Handler = async (event, context: Context, callback: APIGatewayProxyCallback) => {
  // console.log(event);
  // const PUBLIC_KEY = process.env.PUBLIC_KEY;
  // const signature = event.headers["x-signature-ed25519"];
  // const timestamp = event.headers["x-signature-timestamp"];
  // const strBody = event.body; // should be string, for successful sign

  // if (!PUBLIC_KEY) {
  //   return {
  //     statusCode: 401,
  //     body: JSON.stringify("invalid request signature"),
  //   };
  // }
  // const isVerified = nacl.sign.detached.verify(
  //   Buffer.from(timestamp + strBody),
  //   Buffer.from(signature, "hex"),
  //   Buffer.from(PUBLIC_KEY, "hex")
  // );
  // console.log(JSON.stringify({ isVerified }));
  // if (!isVerified) {
  //   return {
  //     statusCode: 401,
  //     body: JSON.stringify("invalid request signature"),
  //   };
  // }

  // // Replying to ping (requirement 2.)
  // const body = JSON.parse(strBody);
  // console.log({ body });
  // if (body.type === 1) {
  //   return {
  //     statusCode: 200,
  //     body: JSON.stringify({ type: 1 }),
  //   };
  // }

  // console.log(JSON.stringify({ isShare: body.data.name === "share" }));

  const strBody = event.body;

  const body = JSON.parse(strBody)

  if (body.data.name === "share") {
    try {
      const step = new AWS.StepFunctions();

      if (process.env.STATE_MACHINE_ARN) {
        const resultExec = step.startExecution({
          stateMachineArn: process.env.STATE_MACHINE_ARN,
          name: "INSTAGRAM",
          input: JSON.stringify({
            platform: "instagram",
          }),
        });

        console.log(resultExec);
      }
    } catch (e) {
      console.log(e);
    }

    callback(null, {
      statusCode: 200,

      body: JSON.stringify({
        type: 4,
        data: {
          content: 'Hello, World.',
        },
      })
    })
  }

  console.log(404);

  return {
    statusCode: 404, // If no handler implemented for Discord's request
  };
};
