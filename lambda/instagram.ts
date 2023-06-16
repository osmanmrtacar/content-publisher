import { APIGatewayEvent, APIGatewayProxyCallback, Context, Handler } from 'aws-lambda';
import * as facebook from 'facebook-nodejs-business-sdk';
import { InstagramContent } from '../src/interfaces';



export const handler: Handler = async (event: APIGatewayEvent, context: Context, callback: APIGatewayProxyCallback) => {

  const accessToken = process.env.ACCESS_TOKEN;

  if (!accessToken) {
    return {
      statusCode: 400,
      message: "access token",
    };
  }

  const stringBody = JSON.stringify(event.body)

  const instagramContent : InstagramContent = JSON.parse(stringBody)

  const api = facebook.FacebookAdsApi.init(accessToken);

  const user = new facebook.IGUser('17841404434626251');

  try {
    const media = await user.createMedia([], {
      image_url: instagramContent.imageUrl,
      caption: instagramContent.caption,
    });
    const result = await user.createMediaPublish([], {
      creation_id: media.id,
    });
    console.log(result.id);
  } catch (error) {
    console.log(error);

    return callback('Share Error', {
      statusCode: 400,
      body: JSON.stringify({
        message: JSON.stringify(error),

      })
    })
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


};
