import { Handler } from 'aws-lambda';
import * as facebook from 'facebook-nodejs-business-sdk';

export const handler: Handler = async (event, context) => {
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
        'https://instagram.fadb6-3.fna.fbcdn.net/v/t51.2885-15/240866834_1517414451940350_251164755129675443_n.jpg',
      caption:
        'Pixar, "Up"ın sonunu 14 yıl sonra yeniden yazdı! 😭🏠🎈',
    });
    const result = await user.createMediaPublish([], {
      creation_id: media.id,
    });
    console.log(result.id);
  } catch (error) {
    console.log(error);

    return {
      statusCode: 400,
      message: JSON.stringify(error),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      StatusCode: 200
    })
  };
};
