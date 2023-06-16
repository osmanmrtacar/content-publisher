import { Handler,Context, APIGatewayProxyCallback, APIGatewayEvent } from "aws-lambda";
import * as nacl from "tweetnacl";
import * as AWS from "aws-sdk";

export const handler: Handler = async (event: APIGatewayEvent, context: Context, callback: APIGatewayProxyCallback) => {

  const PUBLIC_KEY = process.env.PUBLIC_KEY;
  const signature = event?.headers?.["x-signature-ed25519"] ?? '';
  const timestamp = event?.headers?.["x-signature-timestamp"] ?? '';
  const strBody = event.body ?? ''; // should be string, for successful sign

  console.log(JSON.stringify(JSON.parse(strBody).data.options))

  if (!PUBLIC_KEY) {
    return {
      statusCode: 401,
      body: JSON.stringify("invalid request signature"),
    };
  }
  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + strBody),
    Buffer.from(signature, "hex"),
    Buffer.from(PUBLIC_KEY, "hex")
  );

  if (!isVerified) {
    return {
      statusCode: 401,
      body: JSON.stringify("invalid request signature"),
    };
  }

  // Replying to ping (requirement 2.)
  const body = JSON.parse(strBody);
  console.log({ body });
  if (body.type === 1) {
    return {
      statusCode: 200,
      body: JSON.stringify({ type: 1 }),
    };
  }



  if (body.data.name === "share") {
    try {
      const step = new AWS.StepFunctions();

      if (process.env.STATE_MACHINE_ARN) {
        const resultExec = await step.startExecution({
          stateMachineArn: process.env.STATE_MACHINE_ARN,
          input: JSON.stringify({
            platform: "instagram",
          }),
        }).promise();



        console.log(resultExec.executionArn)

      }
    } catch (e) {
      console.log(e);
    }

    return callback(null, {
      statusCode: 200,

      body: JSON.stringify({
        type: 4,
        data: {
          content: 'Hello, World.',
        },
      })
    })


  }
};
