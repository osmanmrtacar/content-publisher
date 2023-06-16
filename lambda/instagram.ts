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
    // const media = await user.createMedia([], {
    //   image_url:
    //     'https://ichef.bbci.co.uk/news/800/cpsprodpb/c4f0/live/ace78480-07ab-11ee-b5af-25e80c61c11a.jpg',
    //   caption:
    //     'Tom Holland, en son rol aldığı dizi yüzünden oyunculuğa bir yıl ara veriyor',
    // });
    // const result = await user.createMediaPublish([], {
    //   creation_id: media.id,
    // });
    // console.log(result.id);
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
