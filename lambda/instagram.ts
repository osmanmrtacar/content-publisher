import { APIGatewayEvent, APIGatewayProxyCallback, Context, Handler } from 'aws-lambda';
import * as facebook from 'facebook-nodejs-business-sdk';

export const handler: Handler = async (event: APIGatewayEvent, context: Context, callback: APIGatewayProxyCallback) => {
  console.log(event);
  const accessToken = process.env.ACCESS_TOKEN;

  if (!accessToken) {
    return {
      statusCode: 400,
      message: "access token",
    };
  }

  const api = facebook.FacebookAdsApi.init(accessToken);

  const user = new facebook.IGUser('17841404434626251');

  try {
    const media = await user.createMedia([], {
      image_url:
        'https://static1.moviewebimages.com/wordpress/wp-content/uploads/2022/04/Carl-Up-2009-Disney.jpg',
      caption:
        'Pixar, "Up"ın sonunu 14 yıl sonra yeniden yazdı! 😭🏠🎈',
    });
    const result = await user.createMediaPublish([], {
      creation_id: media.id,
    });
    console.log(result.id);
  } catch (error) {
    console.log(error);

    callback('Share Error', {
      statusCode: 400,
      body: JSON.stringify({
        message: JSON.stringify(error),

      })
    })
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
};
