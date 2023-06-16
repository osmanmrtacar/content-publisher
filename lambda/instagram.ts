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
        'https://d23.com/app/uploads/2019/05/1180-x-600_up-easter-eggs-1.jpg',
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
  };
};
